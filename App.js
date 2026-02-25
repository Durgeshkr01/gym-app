import React from 'react';
import { StatusBar } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { DataProvider } from './src/context/DataContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

function AppContent() {
  const { theme, isDark } = useTheme();
  return (
    <PaperProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar
            barStyle={isDark ? 'light-content' : 'light-content'}
            backgroundColor={theme.colors.header}
          />
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <DataProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </DataProvider>
  );
}
