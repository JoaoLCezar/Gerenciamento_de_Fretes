import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import ListaFretesScreen from './src/screens/ListaFretesScreen';
import NovoFreteScreen from './src/screens/NovoFreteScreen';
import DetalheFreteScreen from './src/screens/DetalheFreteScreen';
import EditarFreteScreen from './src/screens/EditarFreteScreen';
import { initDatabase } from './src/services/database';
import { initOfflineQueue } from './src/services/offlineQueue';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

const Stack = createStackNavigator();

function AppNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <NavigationContainer
      theme={{
        ...(isDark ? DarkTheme : DefaultTheme),
        colors: {
          ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
          background: theme.colors.background,
        },
      }}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.textOnPrimary,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
        <Stack.Screen name="ListaFretes" component={ListaFretesScreen} options={{ title: 'Fretes' }} />
        <Stack.Screen name="NovoFrete" component={NovoFreteScreen} options={{ title: 'Novo Frete' }} />
        <Stack.Screen name="DetalheFrete" component={DetalheFreteScreen} options={{ title: 'Detalhes do Frete' }} />
        <Stack.Screen name="EditarFrete" component={EditarFreteScreen} options={{ title: 'Editar Frete' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function AppContent() {
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const preparar = async () => {
      try {
        await initDatabase();
        await initOfflineQueue();
      } catch (error) {
        console.error('Erro ao inicializar app:', error);
        setErro('Erro ao inicializar o Firebase. Verifique sua conexão.');
      } finally {
        setPronto(true);
      }
    };
    preparar();
  }, []);

  if (!pronto) {
    return (
      <View style={[styles.splash, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.splashText, { color: theme.colors.textSecondary }]}>Inicializando...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={[styles.splash, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{erro}</Text>
      </View>
    );
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  splashText: { marginTop: 12, fontSize: 16 },
  errorText: { fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
});
