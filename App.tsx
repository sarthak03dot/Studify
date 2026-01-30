import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import AppStack from './src/navigation/AppStack';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { SocketProvider } from './src/context/SocketContext';
import { ThemeSync } from './src/components/ThemeSync';
import { AlertProvider } from './src/context/AlertContext';

const AppContent = () => {
  const { theme } = useTheme();

  return (
    <NavigationContainer theme={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <ThemeSync />
      <AppStack />
    </NavigationContainer>
  );
};

function App(): React.JSX.Element {
  return (
    <ThemeProvider>
      <AlertProvider>
        <AuthProvider>
          <SocketProvider>
            <AppContent />
          </SocketProvider>
        </AuthProvider>
      </AlertProvider>
    </ThemeProvider>
  );
}

export default App;
