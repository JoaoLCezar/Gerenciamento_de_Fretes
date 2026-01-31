/**
 * Sistema de fila offline
 * Salva operações localmente e sincroniza quando houver rede
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { addToCache, removeFromCache } from './database';

interface QueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

const QUEUE_KEY = '@fretes_queue';
let queue: QueueItem[] = [];
let isSyncing = false;
let isOnline = false; // Começa como false, será atualizado na inicialização
let isInitialized = false;

// Inicializar fila e monitorar rede
export const initOfflineQueue = async () => {
  if (isInitialized) return; // Evitar inicializar duas vezes
  
  try {
    // Carregar fila do storage
    const saved = await AsyncStorage.getItem(QUEUE_KEY);
    queue = saved ? JSON.parse(saved) : [];
    console.log(`Fila offline carregada: ${queue.length} operações pendentes`);

    // Obter estado inicial de rede
    const netState = await NetInfo.fetch();
    isOnline = netState.isConnected ?? false;
    console.log(`Estado inicial de rede: ${isOnline ? 'Online' : 'Offline'}`);

    // Monitorar mudanças de conexão
    NetInfo.addEventListener((state) => {
      const wasOffline = !isOnline;
      isOnline = state.isConnected ?? false;

      if (wasOffline && isOnline && queue.length > 0) {
        console.log('✅ Rede disponível - sincronizando fila');
        syncQueue();
      } else if (!isOnline) {
        console.log('📴 Offline - operações salvas localmente');
      }
    });

    // Sincronizar fila inicial se tiver rede e houver pendências
    if (isOnline && queue.length > 0) {
      console.log('Sincronizando fila inicial...');
      await syncQueue();
    }

    isInitialized = true;
  } catch (error) {
    console.error('Erro ao inicializar fila offline:', error);
    isInitialized = true;
  }
};

// Adicionar operação à fila
const addToQueue = async (operation: 'create' | 'update' | 'delete', data: any) => {
  try {
    // Remover campos undefined do Firebase
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    const item: QueueItem = {
      id: Date.now().toString(),
      operation,
      data: cleanData,
      timestamp: Date.now(),
    };

    queue.push(item);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    console.log(`📝 Operação ${operation} adicionada à fila (Total: ${queue.length})`);
  } catch (storageError) {
    console.error('Erro ao salvar na fila:', storageError);
    throw storageError;
  }
};

// Sincronizar fila com Firebase
const syncQueue = async () => {
  if (isSyncing || queue.length === 0 || !isOnline) return;

  isSyncing = true;
  const itemsToSync = [...queue];

  try {
    for (const item of itemsToSync) {
      try {
        if (item.operation === 'create') {
          await addDoc(collection(db, 'fretes'), item.data);
        } else if (item.operation === 'update') {
          const { freteId, ...updateData } = item.data;
          await updateDoc(doc(db, 'fretes', freteId), updateData);
        } else if (item.operation === 'delete') {
          await deleteDoc(doc(db, 'fretes', item.data.freteId));
        }

        // Remover da fila após sucesso
        queue = queue.filter(q => q.id !== item.id);
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
        console.log(`✅ Sincronizado: ${item.operation}`);
      } catch (itemError) {
        console.error(`Erro ao sincronizar ${item.operation}:`, itemError);
        break; // Parar se falhar
      }
    }

    if (queue.length === 0) {
      console.log('🎉 Fila sincronizada com sucesso');
    }
  } catch (error) {
    console.error('Erro ao sincronizar fila:', error);
  } finally {
    isSyncing = false;
  }
};

// Função pública para criar frete (com fila)
export const criarFreteComFila = async (freteData: any) => {
  const tempId = Date.now().toString();
  
  try {
    // Se online, enviar direto
    if (isOnline) {
      try {
        const docRef = await addDoc(collection(db, 'fretes'), freteData);
        console.log('✅ Frete criado online');
        return { id: docRef.id, ...freteData };
      } catch (firebaseError) {
        console.log('Falha ao enviar online, salvando na fila...');
        // Adicionar ao cache com ID temporário
        addToCache({
          id: tempId,
          ...freteData,
          synced: false,
        });
        await addToQueue('create', freteData);
        return { id: tempId, ...freteData };
      }
    }

    // Se offline, adicionar à fila E ao cache
    addToCache({
      id: tempId,
      ...freteData,
      synced: false,
    });
    await addToQueue('create', freteData);
    return { id: tempId, ...freteData };
  } catch (error) {
    console.error('Erro crítico ao criar frete:', error);
    // Tentar salvar ao cache e fila mesmo com erro
    try {
      addToCache({
        id: tempId,
        ...freteData,
        synced: false,
      });
      await addToQueue('create', freteData);
    } catch (queueError) {
      console.error('Não foi possível salvar na fila:', queueError);
    }
    return { id: tempId, ...freteData };
  }
};

// Função pública para atualizar frete (com fila)
export const atualizarFreteComFila = async (freteId: string, dados: any) => {
  try {
    const dataWithTimestamp = { ...dados, updatedAt: Date.now() };
    
    if (isOnline) {
      try {
        await updateDoc(doc(db, 'fretes', freteId), dataWithTimestamp);
        console.log('✅ Frete atualizado online');
        return;
      } catch (firebaseError) {
        console.log('Falha ao atualizar online, salvando na fila...');
        await addToQueue('update', { freteId, ...dataWithTimestamp });
      }
    } else {
      await addToQueue('update', { freteId, ...dataWithTimestamp });
    }
  } catch (error) {
    console.error('Erro ao atualizar frete:', error);
    try {
      await addToQueue('update', { freteId, ...dados, updatedAt: Date.now() });
    } catch (queueError) {
      console.error('Não foi possível salvar atualização na fila:', queueError);
    }
  }
};

// Função pública para deletar frete (com fila)
export const deletarFreteComFila = async (freteId: string) => {
  try {
    // Remover do cache imediatamente
    removeFromCache(freteId);
    
    if (isOnline) {
      try {
        await deleteDoc(doc(db, 'fretes', freteId));
        console.log('✅ Frete deletado online');
        return;
      } catch (firebaseError) {
        console.log('Falha ao deletar online, salvando na fila...');
        await addToQueue('delete', { freteId });
      }
    } else {
      await addToQueue('delete', { freteId });
    }
  } catch (error) {
    console.error('Erro ao deletar frete:', error);
    try {
      await addToQueue('delete', { freteId });
    } catch (queueError) {
      console.error('Não foi possível salvar deleção na fila:', queueError);
    }
  }
};

// Obter status da fila
export const getQueueStatus = () => ({
  pendingCount: queue.length,
  isOnline,
  isSyncing,
});
