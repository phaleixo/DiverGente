import React, { useMemo } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTheme } from '@/contexts/ThemeContext';


interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  animated?: boolean;
  scale?: number;
  contentStyle?: any;
}

const Card: React.FC<CardProps> = ({
  children,
  onPress,
  animated = false,
  scale = 1,
  contentStyle,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const { colors } = useTheme();
  const theme = useMemo(() => isDarkMode ? colors.dark : colors.light, [isDarkMode, colors]);
  const styles = useMemo(() => dynamicStyles(theme), [theme]);

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[
        styles.card,
        animated && { transform: [{ scale }] },
        contentStyle,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.content}>
        {children}
      </View>
    </CardComponent>
  );
};

const dynamicStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
      marginHorizontal: 16,
    },
    content: {
      flex: 1,
    },
  });

export default Card;
