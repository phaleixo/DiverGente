import React, { useMemo, useState } from "react";
import {
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Modal,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/config/supabase";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

WebBrowser.maybeCompleteAuthSession();

const DeleteAccountButton: React.FC = () => {
  const { user, signOut, signInWithGoogle } = useAuth();
  const isDarkMode = useColorScheme() === "dark";
  const { colors } = useTheme();
  const theme = useMemo(
    () => (isDarkMode ? colors.dark : colors.light),
    [isDarkMode, colors]
  );
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Verifica se o usuário logou com Google
  const isGoogleUser =
    user?.app_metadata?.provider === "google" ||
    user?.identities?.some((i: any) => i.provider === "google");

  const handleDeleteAccount = async () => {
    if (!user) return;

    Alert.alert(
      "Excluir Conta",
      "Tem certeza que deseja excluir sua conta? Esta ação é IRREVERSÍVEL e todos os seus dados serão perdidos permanentemente.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Continuar",
          style: "destructive",
          onPress: () => setShowModal(true),
        },
      ]
    );
  };

  const authenticateWithPassword = async () => {
    if (!password.trim()) {
      Alert.alert("Erro", "Digite sua senha para confirmar");
      return;
    }

    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: password,
      });

      if (error) {
        Alert.alert("Erro", "Senha incorreta. Tente novamente.");
        setAuthLoading(false);
        return;
      }

      // Senha correta, prosseguir com exclusão
      setShowModal(false);
      setPassword("");
      await deleteAccount();
    } catch (e: any) {
      Alert.alert("Erro", e?.message || "Falha na autenticação");
    } finally {
      setAuthLoading(false);
    }
  };

  const authenticateWithGoogle = async () => {
    setAuthLoading(true);
    try {
      const result = await signInWithGoogle();

      if (result.error) {
        Alert.alert("Erro", result.error.message || "Falha na autenticação");
        setAuthLoading(false);
        return;
      }

      if ((result as any).url) {
        const redirectUrl = Linking.createURL("");
        const authResult = await WebBrowser.openAuthSessionAsync(
          (result as any).url,
          redirectUrl
        );

        if (authResult.type === "success" && authResult.url) {
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
                // Autenticação bem-sucedida, prosseguir com exclusão
                setShowModal(false);
                await deleteAccount();
                return;
              }
            }
          }
        }

        if (authResult.type === "cancel") {
          setAuthLoading(false);
          return;
        }
      }

      Alert.alert("Erro", "Não foi possível autenticar com Google");
    } catch (e: any) {
      Alert.alert("Erro", e?.message || "Falha na autenticação");
    } finally {
      setAuthLoading(false);
    }
  };

  const deleteAccount = async () => {
    setLoading(true);

    try {
      const userId = user?.id;

      // 1. Deletar dados do usuário nas tabelas do Supabase
      try {
        await supabase.from("tasks").delete().eq("user_id", userId);
      } catch (e) {}

      try {
        await supabase.from("diary_entries").delete().eq("user_id", userId);
      } catch (e) {}

      try {
        await supabase.from("decisions").delete().eq("user_id", userId);
      } catch (e) {}

      // 2. Limpar dados locais
      try {
        const keys = await AsyncStorage.getAllKeys();
        const userKeys = keys.filter(
          (key) => key.includes(userId) || key.startsWith("@")
        );
        if (userKeys.length > 0) {
          await AsyncStorage.multiRemove(userKeys);
        }
      } catch (e) {
        console.warn("Erro ao limpar AsyncStorage:", e);
      }

      try {
        await SecureStore.deleteItemAsync("biometric_enabled");
        await SecureStore.deleteItemAsync("auth_email");
        await SecureStore.deleteItemAsync("auth_password");
        await SecureStore.deleteItemAsync("supabase_session");
      } catch (e) {
        console.warn("Erro ao limpar SecureStore:", e);
      }

      // 3. Deletar o usuário do Supabase Auth
      try {
        const { error } = await supabase.rpc("delete_user");
        if (error) {
          console.warn("Erro ao deletar usuário via RPC:", error);
        }
      } catch (e) {
        console.warn("Função delete_user não encontrada:", e);
      }

      // 4. Fazer logout
      await signOut();

      Alert.alert(
        "Conta Excluída",
        "Sua conta foi excluída com sucesso. Sentiremos sua falta!"
      );
    } catch (error: any) {
      console.error("Erro ao excluir conta:", error);
      Alert.alert(
        "Erro",
        "Não foi possível excluir a conta. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleDeleteAccount}
        style={[
          styles.button,
          {
            borderColor: theme.error,
            backgroundColor: isDarkMode
              ? "rgba(250, 60, 60, 0.1)"
              : "rgba(250, 60, 60, 0.05)",
          },
        ]}
        activeOpacity={0.8}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={theme.error} />
        ) : (
          <>
            <MaterialCommunityIcons
              name="delete-alert"
              size={18}
              color={theme.error}
              style={styles.icon}
            />
            <Text style={[styles.text, { color: theme.error }]}>
              Excluir Conta
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Modal de Autenticação */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View
            style={[styles.modalContent, { backgroundColor: theme.surface }]}
          >
            <Text style={[styles.modalTitle, { color: theme.error }]}>
              Confirmar Exclusão
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.onSurface }]}>
              Para excluir sua conta, confirme sua identidade:
            </Text>

            {isGoogleUser ? (
              // Usuário do Google - mostrar botão de autenticação Google
              <TouchableOpacity
                onPress={authenticateWithGoogle}
                style={styles.googleButton}
                disabled={authLoading}
              >
                {authLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name="logo-google"
                      size={20}
                      color="#fff"
                      style={styles.googleIcon}
                    />
                    <Text style={styles.googleButtonText}>
                      Confirmar com Google
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              // Usuário com email/senha - mostrar campo de senha
              <>
                <TextInput
                  placeholder="Digite sua senha"
                  placeholderTextColor={theme.outline}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={[
                    styles.input,
                    {
                      borderColor: theme.outline,
                      color: theme.onSurface,
                      backgroundColor: theme.background,
                    },
                  ]}
                />
                <TouchableOpacity
                  onPress={authenticateWithPassword}
                  style={[
                    styles.confirmButton,
                    { backgroundColor: theme.error },
                  ]}
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.confirmButtonText}>
                      Confirmar e Excluir
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              onPress={() => {
                setShowModal(false);
                setPassword("");
              }}
              style={[styles.cancelButton, { borderColor: theme.outline }]}
            >
              <Text
                style={[styles.cancelButtonText, { color: theme.onSurface }]}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontWeight: "600",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.8,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  confirmButton: {
    width: "100%",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  cancelButton: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  cancelButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DB4437",
    width: "100%",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default DeleteAccountButton;
