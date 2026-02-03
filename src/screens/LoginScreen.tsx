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
import { Ionicons } from '@expo/vector-icons';
import { login, register } from '../services/authService';
import { useTheme } from '../context/ThemeContext';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background },
        width < 768 && styles.mobileContainer,
      ]}
    >
      <View style={styles.logoContainer}>
        <Ionicons name="cube" size={64} color={theme.colors.primary} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Fretes</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {isSignUp ? 'Crie sua conta' : 'Bem-vindo de volta'}
        </Text>
      </View>

      <View style={[styles.formContainer, { backgroundColor: theme.colors.card }]}>
        {/* Email */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
          <View style={[styles.inputContainer, { borderColor: theme.colors.primary }]}>
            <Ionicons name="mail" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="seu@email.com"
              placeholderTextColor={theme.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Senha */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Senha</Text>
          <View style={[styles.inputContainer, { borderColor: theme.colors.primary }]}>
            <Ionicons name="lock-closed" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Digite sua senha"
              placeholderTextColor={theme.colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirmar Senha (apenas em Sign Up) */}
        {isSignUp && (
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Confirmar Senha</Text>
            <View style={[styles.inputContainer, { borderColor: theme.colors.primary }]}>
              <Ionicons name="lock-closed" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Confirme sua senha"
                placeholderTextColor={theme.colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Botão Principal */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: theme.colors.primary },
            loading && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.textOnPrimary} size="small" />
          ) : (
            <Text style={[styles.submitButtonText, { color: theme.colors.textOnPrimary }]}>
              {isSignUp ? 'Criar Conta' : 'Entrar'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Toggle entre Login e Registro */}
        <View style={styles.toggleContainer}>
          <Text style={{ color: theme.colors.textSecondary }}>
            {isSignUp ? 'Já tem conta? ' : 'Não tem conta? '}
          </Text>
          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} disabled={loading}>
            <Text style={[styles.toggleText, { color: theme.colors.primary }]}>
              {isSignUp ? 'Entrar' : 'Registre-se'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Aviso de Modo Offline */}
        <View style={[styles.offlineNotice, { backgroundColor: theme.colors.primaryLight }]}>
          <Ionicons name="alert-circle" size={18} color={theme.colors.primary} />
          <Text style={[styles.offlineText, { color: theme.colors.text }]}>
            Modo offline - Contas criadas localmente
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
  },
  formContainer: {
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  submitButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  toggleText: {
    fontWeight: '600',
    fontSize: 14,
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
