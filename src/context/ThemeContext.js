import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();
const THEME_KEY = '@sg_theme_mode';

export const LightTheme = {
  dark: false,
  roundness: 4,
  colors: {
    primary: '#FF6B35',
    accent: '#FF6B35',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#333333',
    subtext: '#666666',
    muted: '#999999',
    card: '#FFFFFF',
    border: '#E0E0E0',
    header: '#FF6B35',
    headerText: '#FFFFFF',
    tabActive: '#FF6B35',
    tabInactive: '#999999',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#FF5252',
    info: '#2196F3',
    statusBar: 'dark-content',
  },
};

export const DarkTheme = {
  dark: true,
  roundness: 4,
  colors: {
    primary: '#FF8A5E',
    accent: '#FF8A5E',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#EEEEEE',
    subtext: '#AAAAAA',
    muted: '#777777',
    card: '#1E1E1E',
    border: '#333333',
    header: '#1E1E1E',
    headerText: '#FF8A5E',
    tabActive: '#FF8A5E',
    tabInactive: '#666666',
    success: '#66BB6A',
    warning: '#FFA726',
    error: '#EF5350',
    info: '#42A5F5',
    statusBar: 'light-content',
  },
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? DarkTheme : LightTheme;

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved === 'dark') setIsDark(true);
    } catch (e) {}
  };

  const toggleTheme = async () => {
    const newMode = !isDark;
    setIsDark(newMode);
    await AsyncStorage.setItem(THEME_KEY, newMode ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export default ThemeContext;
