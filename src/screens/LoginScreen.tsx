import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { login, register } from '../services/authService';
import { useTheme } from '../context/ThemeContext';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';

interface LoginScreenProps {
  navigation?: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Preencha email e senha');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (error: any) {
      Alert.alert('Erro ao fazer login', error.message || 'Tente novamente');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await register(email.trim(), password);
      Alert.alert('Sucesso', 'Conta criada com sucesso!');
      setIsSignUp(false);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Erro ao registrar', error.message || 'Tente novamente');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = isSignUp ? handleRegister : handleLogin;

  return (
    <LinearGradient
      colors={[theme.colors.primary, '#7B68EE']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientBackground}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          width < 768 && styles.mobileContainer,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Container */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="cube" size={60} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Fretes Manager</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Crie sua conta para começar' : 'Bem-vindo de volta'}
          </Text>
        </View>

        {/* Form Container */}
        <View style={[styles.formContainer, { backgroundColor: theme.colors.card }]}>
          {/* Email */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
            <CustomInput
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              icon="mail"
              editable={!loading}
              keyboardType="email-address"
            />
          </View>

          {/* Senha */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Senha</Text>
            <CustomInput
              placeholder="Digite sua senha"
              value={password}
              onChangeText={setPassword}
              icon="lock-closed"
              secureTextEntry
              editable={!loading}
            />
          </View>

          {/* Confirmar Senha (apenas em Sign Up) */}
          {isSignUp && (
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Confirmar Senha</Text>
              <CustomInput
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                icon="lock-closed"
                secureTextEntry
                editable={!loading}
              />
            </View>
          )}

          {/* Botão Principal */}
          <CustomButton
            onPress={handleSubmit}
            title={isSignUp ? 'Criar Conta' : 'Entrar'}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
          />

          {/* Toggle entre Login e Registro */}
          <View style={styles.toggleContainer}>
            <Text style={[styles.toggleQuestion, { color: theme.colors.textSecondary }]}>
              {isSignUp ? 'Já tem conta? ' : 'Não tem conta? '}
            </Text>
            <TouchableOpacity
              onPress={() => setIsSignUp(!isSignUp)}
              disabled={loading}
            >
              <Text style={[styles.toggleText, { color: theme.colors.primary }]}>
                {isSignUp ? 'Entrar' : 'Registre-se'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Aviso de Modo Offline */}
          <View style={[styles.offlineNotice, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="alert-circle" size={16} color={theme.colors.warning} />
            <Text style={[styles.offlineText, { color: theme.colors.text }]}>
              Contas criadas localmente
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={[styles.footer, { color: '#FFFFFF80' }]}>
          © 2025 Gerenciamento de Fretes
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  mobileContainer: {
    paddingHorizontal: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF40',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF90',
    fontWeight: '500',
  },
  formContainer: {
    borderRadius: 20,
    padding: 28,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  submitButton: {
    marginTop: 28,
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 4,
  },
  toggleQuestion: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggleText: {
    fontWeight: '700',
    fontSize: 14,
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  offlineText: {
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 20,
  },
});
