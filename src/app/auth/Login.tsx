import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme, Alert, Image, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import Title from '@/components/Title';
import { useAuth } from '@/contexts/AuthContext';
import { sendPasswordResetEmail } from '@/services/supabaseService';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';
  const styles = dynamicStyles(isDarkMode);
  const { signIn } = useAuth();
  const router = useRouter();
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      Alert.alert('Erro', error.message || 'Falha ao entrar');
      return;
    }

    // navega para a tela principal após login bem-sucedido
    try {
      router.replace('/');
    } catch (e) {
      // ignorar falhas de navegação silenciosamente
    }
    // após login manual bem-sucedido, oferecer ativar biometria
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (hasHardware && isEnrolled) {
        Alert.alert(
          'Ativar biometria',
          'Deseja ativar o login por digital/FaceID neste aparelho?',
          [
            { text: 'Não', style: 'cancel' },
            { text: 'Sim', onPress: enableBiometric },
          ],
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
        const enabled = await SecureStore.getItemAsync('biometric_enabled');
        setBiometricEnabled(enabled === 'true');
        if (enabled === 'true' && hasHardware && isEnrolled) {
          // tentar login biométrico automaticamente
          tryBiometricSignIn();
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  async function tryBiometricSignIn() {
    setLoading(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentique-se',
        cancelLabel: 'Cancelar',
      });
      if (result.success) {
        const storedEmail = await SecureStore.getItemAsync('auth_email');
        const storedPassword = await SecureStore.getItemAsync('auth_password');
        if (storedEmail && storedPassword) {
          const { error } = await signIn(storedEmail, storedPassword);
          if (error) {
            Alert.alert('Erro', error.message || 'Falha no login biométrico');
          } else {
            try { router.replace('/'); } catch (e) {}
          }
        } else {
          Alert.alert('Informação', 'Nenhuma credencial salva. Faça login manualmente e ative a biometria.');
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
        Alert.alert('Biometria não disponível', 'Seu dispositivo não oferece biometria configurada.');
        return;
      }
      const auth = await LocalAuthentication.authenticateAsync({ promptMessage: 'Confirme para ativar biometria' });
      if (!auth.success) {
        Alert.alert('Não autorizado', 'Não foi possível confirmar sua identidade.');
        return;
      }
      await SecureStore.setItemAsync('biometric_enabled', 'true');
      await SecureStore.setItemAsync('auth_email', email.trim());
      await SecureStore.setItemAsync('auth_password', password);
      setBiometricEnabled(true);
      Alert.alert('Sucesso', 'Login por biometria ativado.');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível ativar a biometria.');
    }
  };

  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image source={require('@/assets/images/icon.png')} style={styles.appIcon} />
          <Text style={styles.appName}>DiverGente</Text>
        </View>
        <View style={styles.form}>
        <TextInput
          placeholder="Email"
          placeholderTextColor={isDarkMode ? Colors.dark.outline : Colors.light.outline}
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Senha"
          placeholderTextColor={isDarkMode ? Colors.dark.outline : Colors.light.outline}
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />
        <TouchableOpacity onPress={handleSignIn} style={styles.button} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
        </TouchableOpacity>
        {isBiometricSupported ? (
          <TouchableOpacity onPress={tryBiometricSignIn} style={[styles.button, styles.biometricButton]} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar com biometria'}</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity onPress={() => router.push('/auth/Register')} style={styles.linkButton}>
          <Text style={styles.linkText}>Não tem conta? Registrar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={async () => {
          // Esqueci a senha: usa o email preenchido no campo. Se vazio, pede para preencher.
          if (!email.trim()) {
            Alert.alert('Informe o email', 'Digite seu email no campo acima para receber instruções de redefinição de senha.');
            return;
          }
          try {
            setLoading(true);
            // Forçar redirect para a página de reset no GitHub Pages
            const res = await sendPasswordResetEmail(email.trim(), 'https://phaleixo.github.io/DiverGente/reset.html');
            setLoading(false);

            if (res?.error) {
              Alert.alert('Erro', res.error.message || 'Não foi possível enviar o email de redefinição.');
            } else {
              Alert.alert('Enviado', 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.');
            }
          } catch (e: any) {
            setLoading(false);
            Alert.alert('Erro', e?.message || 'Erro desconhecido');
          }
        }} style={[styles.linkButton, { marginTop: 6 }]}> 
          <Text style={styles.linkText}>Esqueci minha senha</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const dynamicStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background,
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
    alignItems: 'center',
  },
  biometricButton: {
    marginTop: 12,
    backgroundColor: isDarkMode ? Colors.dark.secondary || Colors.dark.primary : Colors.light.secondary || Colors.light.primary,
  },
  buttonText: {
    color: isDarkMode ? Colors.dark.onPrimary : Colors.light.onPrimary,
    fontWeight: '700',
  },
  linkButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  linkText: {
    color: isDarkMode ? Colors.dark.primary : Colors.light.primary,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginTop: 120,
    marginBottom: 8,
  },
  appIcon: {
    width: 96,
    height: 96,
    borderRadius: 24,
    marginBottom: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
  },
});

export default LoginScreen;
