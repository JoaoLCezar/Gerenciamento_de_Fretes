import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

interface ThemeColors {
  // Cores de fundo
  background: string;
  card: string;
  surface: string;
  
  // Cores de texto
  text: string;
  textSecondary: string;
  textOnPrimary: string;
  
  // Cores primárias
  primary: string;
  primaryLight: string;
  
  // Cores de status
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Bordas e divisores
  border: string;
  divider: string;
  
  // Inputs
  inputBackground: string;
  inputBorder: string;
  placeholder: string;
  
  // Badges
  badgePendente: string;
  badgeAdiantamento: string;
  badgePago: string;
}

interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const lightTheme: ThemeColors = {
  background: '#F5F5F5',
  card: '#FFFFFF',
  surface: '#FAFAFA',
  
  text: '#333333',
  textSecondary: '#666666',
  textOnPrimary: '#FFFFFF',
  
  primary: '#007AFF',
  primaryLight: '#E3F2FD',
  
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#FF6B6B',
  info: '#2196F3',
  
  border: '#E0E0E0',
  divider: '#EEEEEE',
  
  inputBackground: '#FFFFFF',
  inputBorder: '#DDDDDD',
  placeholder: '#999999',
  
  badgePendente: '#FF6B6B',
  badgeAdiantamento: '#FFA500',
  badgePago: '#28A745',
};

const darkTheme: ThemeColors = {
  background: '#121212',
  card: '#1E1E1E',
  surface: '#2C2C2C',
  
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textOnPrimary: '#FFFFFF',
  
  primary: '#0A84FF',
  primaryLight: '#1A2942',
  
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#FF6B6B',
  info: '#2196F3',
  
  border: '#3A3A3A',
  divider: '#2A2A2A',
  
  inputBackground: '#2C2C2C',
  inputBorder: '#3A3A3A',
  placeholder: '#666666',
  
  badgePendente: '#FF6B6B',
  badgeAdiantamento: '#FFA500',
  badgePago: '#28A745',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setMode(savedTheme);
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
    }
  };

  const toggleTheme = async () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    try {
      await AsyncStorage.setItem('theme', newMode);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  const theme: Theme = {
    mode,
    colors: mode === 'light' ? lightTheme : darkTheme,
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: mode === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
