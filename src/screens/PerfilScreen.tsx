import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PerfilScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { user, isOfflineMode } = useAuth();
  
  const [nome, setNome] = useState(user?.displayName || user?.email?.split('@')[0] || '');
  const [email] = useState(user?.email || '');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const salvarNome = async () => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'Digite um nome válido');
      return;
    }

    setSalvando(true);
    try {
      // Atualizar nome localmente
      const credentials = await AsyncStorage.getItem('@auth_credentials');
      if (credentials) {
        const creds = JSON.parse(credentials);
        creds.displayName = nome.trim();
        await AsyncStorage.setItem('@auth_credentials', JSON.stringify(creds));
      }

      // Atualizar em usuários locais se existir
      if (isOfflineMode && email) {
        const existingUsers = await AsyncStorage.getItem('@local_users');
        if (existingUsers) {
          const users = JSON.parse(existingUsers);
          if (users[email]) {
            users[email].displayName = nome.trim();
            await AsyncStorage.setItem('@local_users', JSON.stringify(users));
          }
        }
      }

      Alert.alert('Sucesso', 'Nome atualizado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o nome');
      console.error('Erro ao salvar nome:', error);
    } finally {
      setSalvando(false);
    }
  };

  const alterarSenha = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      Alert.alert('Erro', 'Preencha todos os campos de senha');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert('Erro', 'A nova senha e a confirmação não coincidem');
      return;
    }

    if (novaSenha.length < 6) {
      Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setSalvando(true);
    try {
      if (isOfflineMode && email) {
        // Alterar senha local
        const existingUsers = await AsyncStorage.getItem('@local_users');
        if (existingUsers) {
          const users = JSON.parse(existingUsers);
          if (users[email]) {
            // Verificar senha atual
            if (users[email].password !== senhaAtual) {
              Alert.alert('Erro', 'Senha atual incorreta');
              setSalvando(false);
              return;
            }

            // Atualizar senha
            users[email].password = novaSenha;
            await AsyncStorage.setItem('@local_users', JSON.stringify(users));
            
            Alert.alert('Sucesso', 'Senha alterada com sucesso!');
            setSenhaAtual('');
            setNovaSenha('');
            setConfirmarSenha('');
          }
        }
      } else {
        Alert.alert('Aviso', 'Alteração de senha via Firebase ainda não implementada. Disponível apenas para contas locais.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível alterar a senha');
      console.error('Erro ao alterar senha:', error);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Cabeçalho com Avatar */}
        <View style={[styles.avatarContainer, { backgroundColor: theme.colors.card }]}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="person" size={48} color={theme.colors.textOnPrimary} />
          </View>
          <Text style={[styles.emailText, { color: theme.colors.textSecondary }]}>{email}</Text>
          {isOfflineMode && (
            <View style={styles.offlineBadge}>
              <Ionicons name="cloud-offline" size={14} color={theme.colors.warning} />
              <Text style={[styles.offlineText, { color: theme.colors.warning }]}>Modo Offline</Text>
            </View>
          )}
        </View>

        {/* Editar Nome */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Informações da Conta</Text>
          
          <Text style={[styles.label, { color: theme.colors.text }]}>Nome de Exibição</Text>
          <View style={[styles.inputContainer, { borderColor: theme.colors.border }]}>
            <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Digite seu nome"
              placeholderTextColor={theme.colors.textSecondary}
              value={nome}
              onChangeText={setNome}
              editable={!salvando}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={salvarNome}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color={theme.colors.textOnPrimary} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.colors.textOnPrimary }]}>Salvar Nome</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Alterar Senha */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Alterar Senha</Text>

          <Text style={[styles.label, { color: theme.colors.text }]}>Senha Atual</Text>
          <View style={[styles.inputContainer, { borderColor: theme.colors.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Digite sua senha atual"
              placeholderTextColor={theme.colors.textSecondary}
              value={senhaAtual}
              onChangeText={setSenhaAtual}
              secureTextEntry={!mostrarSenhaAtual}
              editable={!salvando}
            />
            <TouchableOpacity onPress={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}>
              <Ionicons name={mostrarSenhaAtual ? 'eye-off' : 'eye'} size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: theme.colors.text, marginTop: 12 }]}>Nova Senha</Text>
          <View style={[styles.inputContainer, { borderColor: theme.colors.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Digite a nova senha"
              placeholderTextColor={theme.colors.textSecondary}
              value={novaSenha}
              onChangeText={setNovaSenha}
              secureTextEntry={!mostrarNovaSenha}
              editable={!salvando}
            />
            <TouchableOpacity onPress={() => setMostrarNovaSenha(!mostrarNovaSenha)}>
              <Ionicons name={mostrarNovaSenha ? 'eye-off' : 'eye'} size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: theme.colors.text, marginTop: 12 }]}>Confirmar Nova Senha</Text>
          <View style={[styles.inputContainer, { borderColor: theme.colors.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Confirme a nova senha"
              placeholderTextColor={theme.colors.textSecondary}
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry={!mostrarConfirmarSenha}
              editable={!salvando}
            />
            <TouchableOpacity onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}>
              <Ionicons name={mostrarConfirmarSenha ? 'eye-off' : 'eye'} size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary, marginTop: 16 }]}
            onPress={alterarSenha}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color={theme.colors.textOnPrimary} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.colors.textOnPrimary }]}>Alterar Senha</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Informações da Conta */}
        <View style={[styles.infoSection, { backgroundColor: theme.colors.card }]}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Email</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>{email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="key-outline" size={20} color={theme.colors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>ID do Usuário</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]} numberOfLines={1}>
                {user?.uid}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  avatarContainer: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emailText: { fontSize: 16, fontWeight: '500' },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  offlineText: { fontSize: 12, fontWeight: '600' },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
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
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
});
