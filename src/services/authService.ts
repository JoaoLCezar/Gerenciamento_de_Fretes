import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './firebaseConfig';

interface StoredCredentials {
  email: string;
  uid: string;
  displayName?: string;
}

const CREDENTIALS_KEY = '@auth_credentials';
const SESSION_KEY = '@auth_session';

/**
 * Registra novo usuário - usa Firebase se disponível, senão salva localmente
 */
export async function register(email: string, password: string, displayName?: string): Promise<User> {
  try {
    // Tenta criar com Firebase (se tiver internet E firebase auth habilitado)
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Salva credenciais localmente para offline
    const credentials: StoredCredentials = {
      email: user.email || email,
      uid: user.uid,
      displayName: displayName || user.displayName || undefined,
    };

    await AsyncStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({
      uid: user.uid,
      email: user.email,
      timestamp: Date.now(),
    }));

    return user;
  } catch (error: any) {
    console.log('Firebase Auth indisponível, criando conta local...', error.code);

    // Se Firebase Auth não está configurado, cria conta local
    if (error.code === 'auth/configuration-not-found' || error.code === 'auth/network-request-failed') {
      // Verificar se email já existe localmente
      const existingUsers = await AsyncStorage.getItem('@local_users');
      const users = existingUsers ? JSON.parse(existingUsers) : {};

      if (users[email]) {
        throw new Error('Este email já está cadastrado');
      }

      // Criar usuário local
      const uid = `local_${Date.now()}`;
      const localUser: StoredCredentials = {
        email,
        uid,
        displayName: displayName || email.split('@')[0],
      };

      // Salvar usuário local
      users[email] = {
        ...localUser,
        password, // Em produção, use bcrypt!
      };

      await AsyncStorage.setItem('@local_users', JSON.stringify(users));
      await AsyncStorage.setItem(CREDENTIALS_KEY, JSON.stringify(localUser));
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({
        uid,
        email,
        timestamp: Date.now(),
        localOnly: true,
      }));

      // Retornar user fictício para modo local
      return {
        uid,
        email,
        displayName: localUser.displayName,
      } as User;
    }

    throw error;
  }
}

/**
 * Login com Firebase + fallback offline local
 */
export async function login(email: string, password: string): Promise<User | null> {
  try {
    // Tenta com Firebase primeiro
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Salva sessão localmente
    const credentials: StoredCredentials = {
      email: user.email || email,
      uid: user.uid,
      displayName: user.displayName || undefined,
    };

    await AsyncStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({
      uid: user.uid,
      email: user.email,
      timestamp: Date.now(),
    }));

    return user;
  } catch (firebaseError: any) {
    console.log('Firebase indisponível, tentando autenticação local...', firebaseError.code);

    // Se Firebase não disponível, tenta login local
    if (firebaseError.code === 'auth/configuration-not-found' || firebaseError.code === 'auth/network-request-failed') {
      try {
        const existingUsers = await AsyncStorage.getItem('@local_users');
        if (!existingUsers) {
          throw new Error('Nenhum usuário local encontrado. Crie uma conta primeiro.');
        }

        const users = JSON.parse(existingUsers);
        const userData = users[email];

        if (!userData) {
          throw new Error('Email não encontrado');
        }

        // Valida senha (em produção use bcrypt!)
        if (userData.password !== password) {
          throw new Error('Senha incorreta');
        }

        // Cria sessão local
        const credentials: StoredCredentials = {
          email: userData.email,
          uid: userData.uid,
          displayName: userData.displayName,
        };

        await AsyncStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({
          uid: userData.uid,
          email: userData.email,
          offline: true,
          localOnly: true,
          timestamp: Date.now(),
        }));

        // Retorna usuário fictício
        return {
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName,
        } as User;
      } catch (localError: any) {
        throw new Error(localError.message || 'Falha ao fazer login local');
      }
    }

    // Outros erros do Firebase
    throw new Error(firebaseError.message || 'Falha ao conectar. Verifique email/senha.');
  }
}

/**
 * Logout - limpa sessão
 */
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Erro ao fazer logout no Firebase:', error);
  } finally {
    // Sempre limpa sessão local
    await AsyncStorage.removeItem(SESSION_KEY);
    
    // Limpa cache de banco de dados
    const { clearCache } = await import('./database');
    clearCache();
  }
}

/**
 * Verifica sessão ativa
 */
export async function getSession(): Promise<StoredCredentials | null> {
  try {
    const session = await AsyncStorage.getItem(SESSION_KEY);
    if (!session) return null;

    const parsed = JSON.parse(session);
    return {
      email: parsed.email,
      uid: parsed.uid,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Listener para mudanças de autenticação (Firebase)
 */
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Retorna usuário atual do Firebase
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}
