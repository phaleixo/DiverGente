import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useTheme, ThemeName } from '@/contexts/ThemeContext';

interface ThemeOption {
  name: ThemeName;
  label: string;
  primaryColor: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  { name: 'blue', label: 'Oceano', primaryColor: 'rgba(77, 166, 240, 1)' },
  { name: 'purple', label: 'Améthista', primaryColor: 'rgba(124, 68, 219, 1)' },
  { name: 'green', label: 'Floresta', primaryColor: 'rgba(27, 202, 158, 1)' },
  { name: 'orange', label: 'Fogo', primaryColor: 'rgba(226, 121, 51, 1)' },
  { name: 'red', label: 'Rubis', primaryColor: 'rgba(211, 42, 33, 1)' },
  { name: 'teal', label: 'Turquesa', primaryColor: 'rgba(78, 236, 218, 1)' },
  { name: 'pink', label: 'Sakura', primaryColor: 'rgba(236, 129, 160, 1)' },
];

const ThemePicker: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const { currentTheme, setTheme, colors } = useTheme();
  const theme = useMemo(() => (isDarkMode ? colors.dark : colors.light), [isDarkMode, colors]);
  const styles = dynamicStyles(isDarkMode, theme);

  const handleSelectTheme = async (theme: ThemeName) => {
    await setTheme(theme);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha o tema</Text>
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.themeGrid}
      >
        {THEME_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.name}
            onPress={() => handleSelectTheme(option.name)}
            style={[
              styles.themeOption,
              currentTheme === option.name && styles.selectedTheme,
            ]}
          >
            <View style={styles.colorPreviewContainer}>
              <View
                style={[
                  styles.colorPreview,
                  { backgroundColor: option.primaryColor },
                ]}
              />
              {currentTheme === option.name && (
                <View style={styles.checkmarkContainer}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              )}
            </View>
            <Text style={styles.themeLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const dynamicStyles = (_isDarkMode: boolean, theme: any) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 8,
      paddingVertical: 8,
      backgroundColor: theme.background,
      borderRadius: 12,
      marginTop: 30,
    },
    title: {
      fontSize: 22,
      fontWeight: '600',
      color: theme.onSurface,
      marginBottom: 18,
    },
    themeGrid: {
      paddingRight: 0,
      paddingLeft: 0,
      gap: 4,
    },
    themeOption: {
      alignItems: 'center',
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: theme.elevation?.level1 ?? theme.surface,
      paddingHorizontal: 4,
    },
    selectedTheme: {
      borderWidth: 2,
      borderColor: theme.primary,
      backgroundColor: theme.elevation?.level2 ?? theme.surface,
    },
    colorPreviewContainer: {
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
    },
    colorPreview: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1.5,
      borderColor: theme.outline,
    },
    checkmarkContainer: {
      position: 'absolute',
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      bottom: -2,
      right: -2,
    },
    checkmark: {
      color: theme.onPrimary,
      fontSize: 10,
      fontWeight: '700',
    },
    themeLabel: {
      fontSize: 9,
      fontWeight: '500',
      color: theme.onSurface,
      textAlign: 'center',
    },
  });

export default ThemePicker;
