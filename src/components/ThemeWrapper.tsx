import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

/**
 * Componente que envolve a aplicação para forçar re-render
 * quando o tema é alterado
 */
export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children }) => {
  const { currentTheme } = useTheme();

  return <>{children}</>;
};
