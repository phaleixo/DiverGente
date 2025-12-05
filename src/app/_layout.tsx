import React from 'react';
import { Slot } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { View, StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <AuthProvider>
      <View style={styles.container}>
        <Slot />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
