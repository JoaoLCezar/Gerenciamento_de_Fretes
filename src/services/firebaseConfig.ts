/**
 * Configuração do Firebase com persistência offline
 * Otimizado para React Native com Expo
 * Use variáveis EXPO_PUBLIC_FIREBASE_* no EAS
 */
import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
  memoryLocalCache,
  Firestore,
} from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Suprimir logs verbosos do Firebase
if (!__DEV__) {
  console.warn = () => {};
}

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const missingFirebaseEnv = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingFirebaseEnv.length > 0) {
  const message = `Firebase env ausentes: ${missingFirebaseEnv.join(', ')}`;
  console.error(message);
  throw new Error(message);
}

const app = initializeApp(firebaseConfig);

// Inicializa Firestore com cache adequado por plataforma
let db: Firestore;
if (Platform.OS === 'web') {
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentSingleTabManager({ forceOwnership: false })
      })
    });
  } catch (error) {
    console.log('Cache persistente não disponível no web, usando memória');
    db = initializeFirestore(app, {
      localCache: memoryLocalCache()
    });
  }
} else {
  // React Native não suporta IndexedDB; usar cache em memória
  db = initializeFirestore(app, {
    localCache: memoryLocalCache()
  });
}

// Inicializa Firebase Auth com persistência AsyncStorage para React Native
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export { db, auth };
export default app;
