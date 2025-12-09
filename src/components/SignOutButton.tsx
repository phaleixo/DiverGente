import React, { useMemo } from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTheme } from '@/contexts/ThemeContext';

const SignOutButton: React.FC = () => {
  const { signOut } = useAuth();
  const isDarkMode = useColorScheme() === 'dark';
  const { colors } = useTheme();
  const theme = useMemo(() => isDarkMode ? colors.dark : colors.light, [isDarkMode, colors]);

  const confirmLogout = () => {
    Alert.alert('Confirmar', 'Deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <TouchableOpacity onPress={confirmLogout} style={{ alignItems: 'center', marginTop: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: theme.outline, backgroundColor: theme.surface }} activeOpacity={0.8}>
      <Text style={{ color: theme.onSurface, fontWeight: '600' }}>Sair{' '}</Text>
    </TouchableOpacity>
  );
};

export default SignOutButton;
