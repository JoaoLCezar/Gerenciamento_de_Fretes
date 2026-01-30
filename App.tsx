import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import ListaFretesScreen from './src/screens/ListaFretesScreen';
import NovoFreteScreen from './src/screens/NovoFreteScreen';
import { initDatabase } from './src/services/database';
import { iniciarSincronizacaoAutomatica } from './src/services/syncService';

const Stack = createStackNavigator();

export default function App() {
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const preparar = async () => {
      try {
        await initDatabase();
        unsubscribe = iniciarSincronizacaoAutomatica();
      } finally {
        setPronto(true);
      }
    };
    preparar();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (!pronto) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.splashText}>Inicializando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: { ...DefaultTheme.colors, background: '#F5F5F5' },
      }}
    >
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: '#FFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
        <Stack.Screen name="ListaFretes" component={ListaFretesScreen} options={{ title: 'Fretes' }} />
        <Stack.Screen name="NovoFrete" component={NovoFreteScreen} options={{ title: 'Novo Frete' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' },
  splashText: { marginTop: 12, fontSize: 16, color: '#555' },
});
