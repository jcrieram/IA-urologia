import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthGate from './src/security/AuthGate';
import { DataProvider } from './src/state/DataContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.surface, border: colors.border, text: colors.text, primary: colors.primary },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <DataProvider>
        <AuthGate>
          <NavigationContainer theme={navTheme}>
            <RootNavigator />
          </NavigationContainer>
        </AuthGate>
      </DataProvider>
    </SafeAreaProvider>
  );
}
