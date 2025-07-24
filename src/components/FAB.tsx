import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

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
  const styles = dynamicStyles(isDarkMode, size);

  return (
    <TouchableOpacity
      style={[styles.fab, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Feather name={icon} size={28} color={iconColor || (isDarkMode ? Colors.dark.onPrimary : Colors.light.onPrimary)} />
    </TouchableOpacity>
  );
};

const dynamicStyles = (isDarkMode: boolean, size: number) =>
  StyleSheet.create({
    fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: size,
      height: size,
      borderRadius: 15,
      backgroundColor: isDarkMode ? Colors.dark.primary : Colors.light.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
      shadowColor: isDarkMode ? Colors.dark.shadow : Colors.light.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
  });

export default FAB; 