import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { ActivityIndicator, StyleSheet, Text, View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './src/screens/HomeScreen';
import ListaFretesScreen from './src/screens/ListaFretesScreen';
import NovoFreteScreen from './src/screens/NovoFreteScreen';
import DetalheFreteScreen from './src/screens/DetalheFreteScreen';
import EditarFreteScreen from './src/screens/EditarFreteScreen';
import ConfiguracoesScreen from './src/screens/ConfiguracoesScreen';
import PerfilScreen from './src/screens/PerfilScreen';
import LoginScreen from './src/screens/LoginScreen';
import { initDatabase } from './src/services/database';
import { initOfflineQueue } from './src/services/offlineQueue';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';

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
      <Stack.Screen name="Perfil" component={PerfilScreen} options={{ title: 'Minha Conta' }} />
      <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} options={{ title: 'Configurações' }} />
    </Stack.Navigator>
  );
}

function CustomDrawerContent({ navigation, state, collapsed, onToggle, user, onLogout }: any) {
  const { theme, isDark } = useTheme();
  const focusedRoute = state.routes[state.index];
  const nestedState = focusedRoute?.state;
  const currentScreen = nestedState?.routes?.[nestedState.index]?.name || 'Home';

  const Item = ({ label, icon, target }: { label: string; icon: any; target: string }) => {
    const isActive = currentScreen === target;
    return (
      <TouchableOpacity
        style={[
          styles.drawerItem,
          isActive && styles.drawerItemActive,
          { backgroundColor: isActive ? theme.colors.primary + '20' : 'transparent' },
        ]}
        onPress={() => navigation.navigate('MainStack', { screen: target })}
        activeOpacity={0.6}
      >
        <View style={[styles.iconContainer, isActive && { backgroundColor: theme.colors.primary + '40' }]}>
          <Ionicons name={icon} size={20} color={isActive ? theme.colors.primary : theme.colors.text} />
        </View>
        <Text
          style={[
            styles.drawerLabel,
            {
              color: isActive ? theme.colors.primary : theme.colors.text,
              fontWeight: isActive ? '700' : '500',
              opacity: collapsed ? 0 : 1,
              display: collapsed ? 'none' : 'flex',
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
    <LinearGradient
      colors={isDark ? [theme.colors.card, theme.colors.surface] : [theme.colors.card, theme.colors.primaryLight + '30']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <DrawerContentScrollView contentContainerStyle={[styles.drawerContent, { flex: 1 }]}>
        {/* User Profile Card */}
        {!collapsed && user && (
          <View style={[styles.userProfile, { backgroundColor: theme.colors.primary }]}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={50} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.userName, { color: '#FFFFFF' }]} numberOfLines={1}>
                {user.displayName || user.email?.split('@')[0] || 'Usuário'}
              </Text>
              <Text style={[styles.userEmail, { color: '#FFFFFF90' }]} numberOfLines={1}>
                {user.email}
              </Text>
            </View>
          </View>
        )}

        {collapsed && user && (
          <View style={styles.collapsedAvatar}>
            <Ionicons name="person-circle" size={36} color={theme.colors.primary} />
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {!collapsed && <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Menu</Text>}
          <Item label="Dashboard" icon="home" target="Home" />
          <Item label="Novo Frete" icon="add-circle" target="NovoFrete" />
          <Item label="Ver Fretes" icon="list" target="ListaFretes" />
          <Item label="Configurações" icon="settings" target="Configuracoes" />
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Toggle Button */}
        <TouchableOpacity
          style={[styles.drawerToggle, { backgroundColor: theme.colors.surface }]}
          onPress={onToggle}
          activeOpacity={0.7}
        >
          <View style={styles.toggleIconContainer}>
            <Ionicons 
              name={collapsed ? 'chevron-forward' : 'chevron-back'} 
              size={18} 
              color={theme.colors.primary} 
            />
          </View>
          {!collapsed && (
            <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>
              Minimizar
            </Text>
          )}
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.colors.error + '15' }]}
          onPress={onLogout}
          activeOpacity={0.6}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="log-out" size={20} color={theme.colors.error} />
          </View>
          {!collapsed && (
            <Text style={[styles.logoutText, { color: theme.colors.error }]}>
              Sair
            </Text>
          )}
        </TouchableOpacity>
      </DrawerContentScrollView>
    </LinearGradient>
  );
}

function AppNavigator() {
  const { theme, isDark } = useTheme();
  const { isAuthenticated, user, logout, isOfflineMode } = useAuth();
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
      
      {!isAuthenticated ? (
        // Tela de Login
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      ) : (
        // Drawer com aplicação principal
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          {isOfflineMode && (
            <View style={{ backgroundColor: '#FFA500', padding: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Ionicons name="wifi-outline" size={16} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Modo Offline</Text>
            </View>
          )}
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
                user={user}
                onLogout={logout}
              />
            )}
          >
            <Drawer.Screen name="MainStack" component={MainStackNavigator} />
          </Drawer.Navigator>
        </View>
      )}
    </NavigationContainer>
  );
}

function AppContent() {
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const { theme } = useTheme();
  const { user } = useAuth();

  useEffect(() => {
    const preparar = async () => {
      try {
        // Inicializa database com userId se usuário estiver autenticado
        if (user?.uid) {
          await initDatabase(user.uid);
        }
        await initOfflineQueue();
      } catch (error) {
        console.error('Erro ao inicializar app:', error);
        setErro('Erro ao inicializar o Firebase. Verifique sua conexão.');
      } finally {
        setPronto(true);
      }
    };
    preparar();
  }, [user?.uid]); // Re-inicializa quando usuário mudar

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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  splashText: { marginTop: 12, fontSize: 16 },
  errorText: { fontSize: 16, textAlign: 'center', paddingHorizontal: 20 },
  menuButton: { marginLeft: 12, padding: 6 },
  drawerContent: { paddingHorizontal: 8, paddingTop: 12, paddingBottom: 16, gap: 4, flex: 1 },
  
  // User Profile
  userProfile: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 14, 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 20, 
    marginHorizontal: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  avatarContainer: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: '#FFFFFF20', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF40',
  },
  collapsedAvatar: { 
    alignItems: 'center', 
    paddingVertical: 12, 
    marginBottom: 12 
  },
  userName: { 
    fontSize: 14, 
    fontWeight: '700', 
    letterSpacing: -0.5 
  },
  userEmail: { 
    fontSize: 12, 
    marginTop: 2,
    fontWeight: '500',
  },
  
  // Menu Items
  menuSection: { gap: 6 },
  sectionTitle: { 
    fontSize: 12, 
    fontWeight: '700', 
    marginLeft: 12, 
    marginBottom: 8, 
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  drawerItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    paddingVertical: 10, 
    paddingHorizontal: 12, 
    borderRadius: 12, 
    marginHorizontal: 4,
  },
  drawerItemActive: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconContainer: { 
    width: 40, 
    height: 40, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  drawerLabel: { 
    fontSize: 14, 
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  
  // Toggle Button
  drawerToggle: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    padding: 12, 
    borderRadius: 12, 
    marginHorizontal: 4,
    marginBottom: 8,
  },
  toggleIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleLabel: { 
    fontSize: 13, 
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  
  // Logout Button
  logoutButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    paddingVertical: 10, 
    paddingHorizontal: 12, 
    borderRadius: 12, 
    marginHorizontal: 4,
  },
  logoutText: { 
    fontSize: 14, 
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
