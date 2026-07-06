import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { ProximityProvider } from './src/contexts/ProximityContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProximityProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </ProximityProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}