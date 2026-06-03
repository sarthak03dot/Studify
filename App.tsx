import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import AppStack from './src/navigation/AppStack';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { SocketProvider } from './src/context/SocketContext';
import { ThemeSync } from './src/components/ThemeSync';
import { AlertProvider } from './src/context/AlertContext';
import { BookmarkProvider } from './src/context/BookmarkContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

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
      <QueryClientProvider client={queryClient}>
        <AlertProvider>
          <AuthProvider>
            <SocketProvider>
              <BookmarkProvider>
                <AppContent />
              </BookmarkProvider>
            </SocketProvider>
          </AuthProvider>
        </AlertProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
