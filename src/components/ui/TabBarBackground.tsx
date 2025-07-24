import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

const MODERN_TABBAR_HEIGHT = 70;

export default function TabBarBackground() {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View
      pointerEvents="box-only"
      style={[
        styles.tabBar,
        {
          backgroundColor: isDarkMode ? Colors.dark.surface : Colors.light.surface,
          shadowColor: isDarkMode ? Colors.dark.shadow : Colors.light.shadow,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
    height: MODERN_TABBAR_HEIGHT,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
});

export function useBottomTabOverflow() {
  return 0;
}
