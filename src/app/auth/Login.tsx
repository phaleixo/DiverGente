import React, { useState, useEffect } from "react";
import { View,Text,TextInput,TouchableOpacity,StyleSheet,useColorScheme,Alert,KeyboardAvoidingView,ScrollView,Platform,Image,} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { sendPasswordResetEmail } from "@/services/supabaseService";
import { supabase } from "@/config/supabase";


WebBrowser.maybeCompleteAuthSession();

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const isDarkMode = useColorScheme() === "dark";
  const styles = dynamicStyles(isDarkMode);
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      Alert.alert("Erro", error.message || "Falha ao entrar");
      return;
    }

    // navega para a tela principal após login bem-sucedido
    try {
      router.replace("/");
    } catch (e) {
      // ignorar falhas de navegação silenciosamente
    }
    // após login manual bem-sucedido, oferecer ativar biometria
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (hasHardware && isEnrolled) {
        Alert.alert(
          "Ativar biometria",
          "Deseja ativar o login por digital/FaceID neste aparelho?",
          [
            { text: "Não", style: "cancel" },
            { text: "Sim", onPress: enableBiometric },
          ]
        );
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricSupported(!!hasHardware && !!isEnrolled);
        const enabled = await SecureStore.getItemAsync("biometric_enabled");
        setBiometricEnabled(enabled === "true");
        if (enabled === "true" && hasHardware && isEnrolled) {
          // tentar login biométrico automaticamente
          tryBiometricSignIn();
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // Listener para capturar deep links do OAuth (quando app é aberto via URL)
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      if (url) {
        await processOAuthUrl(url);
      }
    };

    // Verifica se o app foi aberto por um deep link
    const checkInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        await processOAuthUrl(initialUrl);
      }
    };

    // Adiciona listener para deep links
    const subscription = Linking.addEventListener("url", handleDeepLink);
    checkInitialUrl();

    return () => {
      subscription.remove();
    };
  }, []);

  // Processa a URL do OAuth e extrai os tokens
  const processOAuthUrl = async (url: string) => {
    try {
      const hashIndex = url.indexOf("#");
      if (hashIndex !== -1) {
        const fragment = url.substring(hashIndex + 1);
        const params = new URLSearchParams(fragment);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          setLoading(true);
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!error) {
            await new Promise((resolve) => setTimeout(resolve, 300));
            router.replace("/(tabs)");
          } else {
            Alert.alert("Erro", "Falha ao configurar sessão");
          }
          setLoading(false);
        }
      }
    } catch (e) {
      console.error("Erro ao processar URL OAuth:", e);
      setLoading(false);
    }
  };

  async function tryBiometricSignIn() {
    setLoading(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Autentique-se",
        cancelLabel: "Cancelar",
      });
      if (result.success) {
        const storedEmail = await SecureStore.getItemAsync("auth_email");
        const storedPassword = await SecureStore.getItemAsync("auth_password");
        if (storedEmail && storedPassword) {
          const { error } = await signIn(storedEmail, storedPassword);
          if (error) {
            Alert.alert("Erro", error.message || "Falha no login biométrico");
          } else {
            try {
              router.replace("/");
            } catch (e) {}
          }
        } else {
          Alert.alert(
            "Informação",
            "Nenhuma credencial salva. Faça login manualmente e ative a biometria."
          );
        }
      }
    } catch (e) {
      // ignorar
    }
    setLoading(false);
  }

  async function enableBiometric() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          "Biometria não disponível",
          "Seu dispositivo não oferece biometria configurada."
        );
        return;
      }
      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirme para ativar biometria",
      });
      if (!auth.success) {
        Alert.alert(
          "Não autorizado",
          "Não foi possível confirmar sua identidade."
        );
        return;
      }
      await SecureStore.setItemAsync("biometric_enabled", "true");
      await SecureStore.setItemAsync("auth_email", email.trim());
      await SecureStore.setItemAsync("auth_password", password);
      setBiometricEnabled(true);
      Alert.alert("Sucesso", "Login por biometria ativado.");
    } catch (e) {
      Alert.alert("Erro", "Não foi possível ativar a biometria.");
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();

      if (result.error) {
        Alert.alert(
          "Erro",
          result.error.message || "Falha ao iniciar login com Google"
        );
        setLoading(false);
        return;
      }

      if ((result as any).url) {
        // Cria uma URL de redirect simples
        const redirectUrl = Linking.createURL("");

        // Abre o navegador para autenticação
        const authResult = await WebBrowser.openAuthSessionAsync(
          (result as any).url,
          redirectUrl
        );

        if (authResult.type === "success" && authResult.url) {
          // Extrai os tokens da URL de callback
          const url = authResult.url;
          const hashIndex = url.indexOf("#");

          if (hashIndex !== -1) {
            const fragment = url.substring(hashIndex + 1);
            const params = new URLSearchParams(fragment);
            const accessToken = params.get("access_token");
            const refreshToken = params.get("refresh_token");

            if (accessToken && refreshToken) {
              const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (!error) {
                // Aguarda a sessão ser propagada
                await new Promise((resolve) => setTimeout(resolve, 300));
                router.replace("/(tabs)");
                setLoading(false);
                return;
              } else {
                Alert.alert("Erro", "Falha ao configurar sessão");
              }
            }
          }

          // Tenta verificar se já existe sessão
          const { data } = await supabase.auth.getSession();
          if (data?.session) {
            router.replace("/(tabs)");
            setLoading(false);
            return;
          }
        }

        if (authResult.type === "cancel") {
          // Usuário cancelou
          setLoading(false);
          return;
        }
      }
    } catch (error: any) {
      Alert.alert("Erro", error?.message || "Erro ao fazer login com Google");
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/splash-icon.png")}
            style={styles.appIcon}
          />
          <Text style={styles.appName}>DiverGente{"    "}</Text>
          <Text style={styles.appDescription}>
            Um aplicativo essencial com rotinas{"    "}
          </Text>
          <Text style={styles.appDescription}>
            para organizar sua vida.{"    "}
          </Text>
        </View>
        <View style={styles.form}>
          <TextInput
            placeholder="Email"
            placeholderTextColor={
              isDarkMode ? Colors.dark.outline : Colors.light.outline
            }
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Senha"
            placeholderTextColor={
              isDarkMode ? Colors.dark.outline : Colors.light.outline
            }
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />
          <TouchableOpacity
            onPress={handleSignIn}
            style={styles.button}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Entrando... " : " Entrar  "}
            </Text>
          </TouchableOpacity>
          {isBiometricSupported ? (
            <TouchableOpacity
              onPress={tryBiometricSignIn}
              style={[styles.button, styles.biometricButton]}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Entrando... " : "   Entrar com biometria       "}
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            onPress={() => router.push("/auth/Register")}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>
              Não tem conta? Registrar {"    "}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              // Esqueci a senha: usa o email preenchido no campo. Se vazio, pede para preencher.
              if (!email.trim()) {
                Alert.alert(
                  "Informe o email",
                  "Digite seu email no campo acima para receber instruções de redefinição de senha."
                );
                return;
              }
              try {
                setLoading(true);
                // Forçar redirect para a página de reset no GitHub Pages
                const res = await sendPasswordResetEmail(
                  email.trim(),
                  "https://phaleixo.github.io/DiverGente/reset.html"
                );
                setLoading(false);

                if (res?.error) {
                  Alert.alert(
                    "Erro",
                    res.error.message ||
                      "Não foi possível enviar o email de redefinição."
                  );
                } else {
                  Alert.alert(
                    "Enviado",
                    "Se o email estiver cadastrado, você receberá instruções para redefinir sua senha."
                  );
                }
              } catch (e: any) {
                setLoading(false);
                Alert.alert("Erro", e?.message || "Erro desconhecido");
              }
            }}
            style={[styles.linkButton, { marginTop: 6 }]}
          >
            <Text style={styles.linkText}>Esqueci minha senha{"    "}</Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>ou </Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            onPress={handleGoogleSignIn}
            style={[
              styles.googleButtonModern,
              {
                backgroundColor: isDarkMode ? "#000" : "#fff",
                borderColor: isDarkMode ? "#222" : "#ddd",
              },
            ]}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Image
              source={require("@/assets/images/google-logo.png")}
              style={styles.googleLogo}
              resizeMode="contain"
            />
            <Text
              style={[
                styles.googleButtonTextModern,
                { color: isDarkMode ? "#fff" : "#222" },
              ]}
            >
              {loading ? "Entrando..." : "Entrar com Google"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const dynamicStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode
        ? Colors.dark.background
        : Colors.light.background,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
    },
    form: {
      marginTop: 20,
    },
    input: {
      borderWidth: 1,
      borderColor: isDarkMode ? Colors.dark.outline : Colors.light.outline,
      padding: 12,
      borderRadius: 10,
      marginBottom: 12,
      color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
      backgroundColor: isDarkMode ? Colors.dark.surface : Colors.light.surface,
    },
    button: {
      backgroundColor: isDarkMode ? Colors.dark.primary : Colors.light.primary,
      padding: 14,
      borderRadius: 10,
      alignItems: "center",
      width: "100%",
    },
    biometricButton: {
      marginTop: 12,
      backgroundColor: isDarkMode
        ? Colors.dark.secondary || Colors.dark.primary
        : Colors.light.secondary || Colors.light.primary,
    },
    buttonText: {
      color: isDarkMode ? Colors.dark.onPrimary : Colors.light.onPrimary,
      fontWeight: "700",
      textAlign: "center",
    },
    linkButton: {
      marginTop: 12,
      alignItems: "center",
    },
    linkText: {
      color: isDarkMode ? Colors.dark.primary : Colors.light.primary,
      fontWeight: "600",
    },
    header: {
      alignItems: "center",
      marginTop: 120,
      marginBottom: 8,
    },
    appIcon: {
      width: 148,
      height: 128,
      borderRadius: 24,
      marginBottom: 8,
    },
    appName: {
      marginBottom: 8,
      fontSize: 32,
      textAlign: "center",
      fontWeight: "700",
      color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
    },
    appDescription: {
      fontSize: 14,
      textAlign: "center",
      fontWeight: "400",
      color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
    },
    dividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 20,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: isDarkMode ? Colors.dark.outline : Colors.light.outline,
    },
    dividerText: {
      marginHorizontal: 10,
      color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
      fontSize: 14,
    },
    googleButtonModern: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.5,
      borderRadius: 24,
      paddingVertical: 12,
      paddingHorizontal: 16,
      width: "100%",
      marginTop: 8,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 2,
    },
    googleLogo: {
      width: 22,
      height: 22,
      marginRight: 12,
    },
    googleButtonTextModern: {
      fontWeight: "600",
      fontSize: 16,
      letterSpacing: 0.2,
    },
  });

export default LoginScreen;
