import React from 'react';
import { Slot } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ThemeWrapper } from '@/components/ThemeWrapper';
import { View, StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ThemeWrapper>
          <View style={styles.container}>
            <Slot />
          </View>
        </ThemeWrapper>
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
