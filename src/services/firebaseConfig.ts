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
  apiKey: "AIzaSyDscg5SvTC6VHITpgcnAM4Bs5nUpoIlyu8",
  authDomain: "gerenciamento-de-fretes-ccc7c.firebaseapp.com",
  projectId: "gerenciamento-de-fretes-ccc7c",
  storageBucket: "gerenciamento-de-fretes-ccc7c.firebasestorage.app",
  messagingSenderId: "16489676583",
  appId: "1:16489676583:web:72f23be26f2098db5b3302",
  measurementId: "G-8WN7H80K0B"
};

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
