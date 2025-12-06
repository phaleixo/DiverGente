import React, { useMemo } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTheme } from '@/contexts/ThemeContext';

interface FABProps {
  onPress: () => void;
  icon: keyof typeof Feather.glyphMap;
  iconColor?: string;
  size?: number;
  style?: any;
}

const FAB: React.FC<FABProps> = ({
  onPress,
  icon,
  iconColor,
  size = 56,
  style,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const { colors } = useTheme();
  const theme = useMemo(() => isDarkMode ? colors.dark : colors.light, [isDarkMode, colors]);
  const styles = useMemo(() => dynamicStyles(theme, size), [theme, size]);

  return (
    <TouchableOpacity
      style={[styles.fab, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Feather name={icon} size={28} color={iconColor || theme.onPrimary} />
    </TouchableOpacity>
  );
};

const dynamicStyles = (theme: any, size: number) =>
  StyleSheet.create({
    fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: size,
      height: size,
      borderRadius: 15,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
  });

export default FAB; 