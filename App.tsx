import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
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

const Stack = createStackNavigator();

export default function App() {
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

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
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.splashText}>Inicializando...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.splash}>
        <Text style={styles.errorText}>{erro}</Text>
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
        <Stack.Screen name="DetalheFrete" component={DetalheFreteScreen} options={{ title: 'Detalhes do Frete' }} />
        <Stack.Screen name="EditarFrete" component={EditarFreteScreen} options={{ title: 'Editar Frete' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5', padding: 20 },
  splashText: { marginTop: 12, fontSize: 16, color: '#555' },
  errorText: { fontSize: 16, color: '#E53935', textAlign: 'center', paddingHorizontal: 20 },
});
