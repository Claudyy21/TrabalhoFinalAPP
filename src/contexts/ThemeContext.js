import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'user_theme_preference';

const light = {
  dark: false,
  background: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: '#EEF0F2',
  surface: '#F1F2F4',
  surfaceBorder: '#E3E5E8',
  text: '#1A1A1A',
  textSecondary: '#6B7076',
  textMuted: '#9AA0A6',
  primary: '#2F80ED',
  primaryLight: '#E8F0FE',
  danger: '#E55353',
  dangerLight: '#FDEAEA',
  success: '#34A853',
  warning: '#E0A800',
  warningLight: '#FFF6E0',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E3E5E8',
  header: '#FFFFFF',
  placeholder: '#A0A0A0',
};

const dark = {
  dark: true,
  background: '#121212',
  card: '#1E1E1E',
  cardBorder: '#2C2C2C',
  surface: '#2A2A2A',
  surfaceBorder: '#3A3A3A',
  text: '#F0F0F0',
  textSecondary: '#AAAAAA',
  textMuted: '#666666',
  primary: '#4D9FFF',
  primaryLight: '#1A2A3A',
  danger: '#FF6B6B',
  dangerLight: '#2A1A1A',
  success: '#4CAF50',
  warning: '#FFB300',
  warningLight: '#2A2000',
  tabBar: '#1E1E1E',
  tabBarBorder: '#2C2C2C',
  header: '#1E1E1E',
  placeholder: '#666666',
};

const ThemeContext = createContext({
  theme: light,
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  // null = seguir sistema, 'light' ou 'dark' = manual
  const [preference, setPreference] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') {
        setPreference(saved);
      }
    });
  }, []);

  const isDark =
    preference != null ? preference === 'dark' : systemScheme === 'dark';

  const theme = isDark ? dark : light;

  const toggleTheme = async () => {
    const next = isDark ? 'light' : 'dark';
    setPreference(next);
    await AsyncStorage.setItem(THEME_KEY, next);
  };

  const resetToSystem = async () => {
    setPreference(null);
    await AsyncStorage.removeItem(THEME_KEY);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, resetToSystem }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);