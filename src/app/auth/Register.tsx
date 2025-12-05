import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import Title from '@/components/Title';
import { useAuth } from '@/contexts/AuthContext';

const RegisterScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';
  const styles = dynamicStyles(isDarkMode);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSignUp = async () => {
    // validações locais
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor informe seu nome.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor informe um email válido.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email.trim(), password, name.trim());
    setLoading(false);
    if (error) {
      Alert.alert('Erro', error.message || 'Falha ao registrar');
      return;
    }
    Alert.alert('Sucesso', 'Confira seu email para confirmar a conta.');
    try {
      router.replace('/auth/Login');
    } catch (e) {}
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('@/assets/images/icon.png')} style={styles.appIcon} />
        <Text style={styles.appName}>DiverGente</Text>
      </View>
      <Title variant="h2" marginTop={16} marginBottom={8} marginLeft={20}>Registrar</Title>
      <View style={styles.form}>
        <TextInput
          placeholder="Nome"
          placeholderTextColor={isDarkMode ? Colors.dark.outline : Colors.light.outline}
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
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
        <TextInput
          placeholder="Confirmar senha"
          placeholderTextColor={isDarkMode ? Colors.dark.outline : Colors.light.outline}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          secureTextEntry
        />
        <TouchableOpacity onPress={handleSignUp} style={styles.button} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Registrando...' : 'Registrar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/auth/Login')} style={styles.linkButton}>
          <Text style={styles.linkText}>Já tem conta? Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const dynamicStyles = (isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background,
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
    width: 84,
    height: 84,
    borderRadius: 16,
    marginBottom: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface,
  },
});

export default RegisterScreen;
