import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF6B35',      // Orange - Main brand color
    secondary: '#004E89',    // Deep Blue
    accent: '#F7931E',       // Light Orange
    background: '#F5F5F5',   // Light Grey
    surface: '#FFFFFF',      // White
    text: '#333333',         // Dark Grey
    error: '#D32F2F',        // Red
    success: '#4CAF50',      // Green
    warning: '#FFC107',      // Yellow
    disabled: '#CCCCCC',     // Grey
    placeholder: '#999999',  // Medium Grey
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700',
    },
  },
  roundness: 8,
};

export const colors = theme.colors;
