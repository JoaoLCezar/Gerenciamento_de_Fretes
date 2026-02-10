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
  background: '#F8F9FF',
  card: '#FFFFFF',
  surface: '#F0F2F7',
  
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textOnPrimary: '#FFFFFF',
  
  primary: '#007AFF',
  primaryLight: '#E3F2FD',
  
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  border: '#E5E7EB',
  divider: '#F3F4F6',
  
  inputBackground: '#FFFFFF',
  inputBorder: '#E5E7EB',
  placeholder: '#9CA3AF',
  
  badgePendente: '#FEE2E2',
  badgeAdiantamento: '#FEF08A',
  badgePago: '#DCFCE7',
};

const darkTheme: ThemeColors = {
  background: '#0F172A',
  card: '#1E293B',
  surface: '#334155',
  
  text: '#F1F5F9',
  textSecondary: '#CBD5E1',
  textOnPrimary: '#FFFFFF',
  
  primary: '#0EA5E9',
  primaryLight: '#0C4A6E',
  
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  border: '#475569',
  divider: '#334155',
  
  inputBackground: '#1E293B',
  inputBorder: '#475569',
  placeholder: '#94A3B8',
  
  badgePendente: '#7F1D1D',
  badgeAdiantamento: '#78350F',
  badgePago: '#064E3B',
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
