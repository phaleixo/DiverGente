import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

const SignOutButton: React.FC = () => {
  const { signOut } = useAuth();
  const isDarkMode = useColorScheme() === 'dark';

  const confirmLogout = () => {
    Alert.alert('Confirmar', 'Deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <TouchableOpacity onPress={confirmLogout} style={{ alignItems: 'center', marginTop: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: isDarkMode ? Colors.dark.outline : Colors.light.outline, backgroundColor: isDarkMode ? Colors.dark.surface : Colors.light.surface }} activeOpacity={0.8}>
      <Text style={{ color: isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface, fontWeight: '600' }}>Sair</Text>
    </TouchableOpacity>
  );
};

export default SignOutButton;
