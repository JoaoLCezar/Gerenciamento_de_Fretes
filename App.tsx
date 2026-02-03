import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { ActivityIndicator, StyleSheet, Text, View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './src/screens/HomeScreen';
import ListaFretesScreen from './src/screens/ListaFretesScreen';
import NovoFreteScreen from './src/screens/NovoFreteScreen';
import DetalheFreteScreen from './src/screens/DetalheFreteScreen';
import EditarFreteScreen from './src/screens/EditarFreteScreen';
import ConfiguracoesScreen from './src/screens/ConfiguracoesScreen';
import { initDatabase } from './src/services/database';
import { initOfflineQueue } from './src/services/offlineQueue';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function MainStackNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.textOnPrimary,
        headerTitleStyle: { fontWeight: 'bold' },
        headerLeft: () => (
          <TouchableOpacity style={styles.menuButton} onPress={() => navigation.getParent()?.openDrawer()}>
            <Ionicons name="menu" size={24} color={theme.colors.textOnPrimary} />
          </TouchableOpacity>
        ),
      })}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="ListaFretes" component={ListaFretesScreen} options={{ title: 'Fretes' }} />
      <Stack.Screen name="NovoFrete" component={NovoFreteScreen} options={{ title: 'Novo Frete' }} />
      <Stack.Screen name="DetalheFrete" component={DetalheFreteScreen} options={{ title: 'Detalhes do Frete' }} />
      <Stack.Screen name="EditarFrete" component={EditarFreteScreen} options={{ title: 'Editar Frete' }} />
      <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} options={{ title: 'Configurações' }} />
    </Stack.Navigator>
  );
}

function CustomDrawerContent({ navigation, state, collapsed, onToggle }: any) {
  const { theme } = useTheme();
  const focusedRoute = state.routes[state.index];
  const nestedState = focusedRoute?.state;
  const currentScreen = nestedState?.routes?.[nestedState.index]?.name || 'Home';

  const Item = ({ label, icon, target }: { label: string; icon: any; target: string }) => {
    const isActive = currentScreen === target;
    return (
      <TouchableOpacity
        style={[
          styles.drawerItem,
          { backgroundColor: isActive ? theme.colors.primaryLight : 'transparent' },
        ]}
        onPress={() => navigation.navigate('MainStack', { screen: target })}
      >
        <Ionicons name={icon} size={22} color={isActive ? theme.colors.primary : theme.colors.text} />
        <Text
          style={[
            styles.drawerLabel,
            {
              color: theme.colors.text,
              display: collapsed ? 'flex' : 'flex',
              opacity: collapsed ? 1 : 1,
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <DrawerContentScrollView contentContainerStyle={styles.drawerContent}>
      <TouchableOpacity style={styles.drawerToggle} onPress={onToggle}>
        <Ionicons name={collapsed ? 'chevron-forward' : 'chevron-back'} size={22} color={theme.colors.text} />
        <Text style={[styles.drawerLabel, { color: theme.colors.text }]}>
          {collapsed ? 'Expandir' : 'Minimizar'}
        </Text>
      </TouchableOpacity>

      <Item label="Dashboard" icon="home" target="Home" />
      <Item label="Novo frete" icon="add-circle" target="NovoFrete" />
      <Item label="Ver fretes" icon="list" target="ListaFretes" />
      <Item label="Configurações" icon="settings" target="Configuracoes" />
    </DrawerContentScrollView>
  );
}

function AppNavigator() {
  const { theme, isDark } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const dimensions = useWindowDimensions();
  const drawerWidth = collapsed ? 72 : 300;
  const drawerType = dimensions.width >= 768 ? 'permanent' : 'front';

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
      <Drawer.Navigator
        screenOptions={{
          headerShown: false,
          drawerStyle: { width: drawerWidth, backgroundColor: theme.colors.card },
          drawerType,
          overlayColor: 'rgba(0, 0, 0, 0.4)',
          sceneContainerStyle: { backgroundColor: theme.colors.background },
        }}
        drawerContent={(props) => (
          <CustomDrawerContent
            {...props}
            collapsed={collapsed}
            onToggle={() => setCollapsed((prev) => !prev)}
          />
        )}
      >
        <Drawer.Screen name="MainStack" component={MainStackNavigator} />
      </Drawer.Navigator>
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
  menuButton: { marginLeft: 12, padding: 6 },
  drawerContent: { paddingTop: 16, gap: 8 },
  drawerToggle: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, marginHorizontal: 8 },
  drawerLabel: { fontSize: 15, fontWeight: '600' },
});
