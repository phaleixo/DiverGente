import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface TitleProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  color?: string;
}

const Title: React.FC<TitleProps> = ({
  children,
  variant = 'h1',
  marginTop = 0,
  marginBottom = 0,
  marginLeft = 0,
  marginRight = 0,
  textAlign = 'left',
  color,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const styles = dynamicStyles(isDarkMode);

  const getColor = () => {
    if (color) return color;
    return isDarkMode ? Colors.dark.onSurface : Colors.light.onSurface;
  };

  return (
    <Text
      style={[
        styles[variant],
        {
          marginTop,
          marginBottom,
          marginLeft,
          marginRight,
          textAlign,
          color: getColor(),
        },
      ]}
    >
      {children}
    </Text>
  );
};

const dynamicStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: 'bold',
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    h5: {
      fontSize: 18,
      fontWeight: '500',
      lineHeight: 24,
    },
    h6: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 20,
    },
  });

export default Title; 