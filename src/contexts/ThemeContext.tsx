import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/Colors';
import { 
  PurpleTheme, 
  GreenTheme, 
  OrangeTheme, 
  RedTheme, 
  TealTheme, 
  PinkTheme 
} from '@/constants/ColorVariations';

export type ThemeName = 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'teal' | 'pink';

interface ThemeContextType {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => Promise<void>;
  colors: any;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = '@divergente_theme';

const THEMES: Record<ThemeName, any> = {
  blue: Colors,
  purple: PurpleTheme,
  green: GreenTheme,
  orange: OrangeTheme,
  red: RedTheme,
  teal: TealTheme,
  pink: PinkTheme,
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('blue');
  const [loading, setLoading] = useState(true);

  // Carregar tema salvo ao iniciar
  useEffect(() => {
    (async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (savedTheme && (Object.keys(THEMES) as ThemeName[]).includes(savedTheme as ThemeName)) {
          setCurrentTheme(savedTheme as ThemeName);
        }
      } catch (error) {
        console.error('Erro ao carregar tema:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setTheme = async (theme: ThemeName) => {
    try {
      setCurrentTheme(theme);
      await AsyncStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    colors: THEMES[currentTheme],
    loading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const useThemeColors = () => {
  const { colors } = useTheme();
  const isDarkMode = require('react-native').useColorScheme() === 'dark';
  return isDarkMode ? colors.dark : colors.light;
};
