/**
 * Banco de dados Firebase Firestore
 * Persistência offline com snapshot listener que preenche cache
 */
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Frete, NovoFrete, EstatisticasFretes } from '../models/Frete';

const COLECAO = 'fretes';

// Cache local em memória para persistência offline
let fretesCached: Frete[] = [];
let cacheAtualizado = false;

// Adicionar frete ao cache manualmente (para filas offline)
export const addToCache = (frete: Frete) => {
  // Evitar duplicatas
  const exists = fretesCached.some(f => f.id === frete.id);
  if (!exists) {
    fretesCached.push(frete);
    console.log(`✨ Frete adicionado ao cache local: ${frete.id}`);
  }
};

// Remover frete do cache manualmente (para deletar offline)
export const removeFromCache = (freteId: string) => {
  const original = fretesCached.length;
  fretesCached = fretesCached.filter(f => f.id !== freteId);
  if (fretesCached.length < original) {
    console.log(`🗑️ Frete removido do cache local: ${freteId}`);
  }
};

// Inicializar listener para manter cache sempre atualizado
export const initDatabase = async () => {
  try {
    // Ativar listener que mantém cache sincronizado
    onSnapshot(
      collection(db, COLECAO),
      (snapshot) => {
        fretesCached = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            data: data.data,
            origem: data.origem,
            destino: data.destino,
            valorTotal: data.valorTotal || data.valor || 0,
            adiantamento: data.adiantamento || undefined,
            saldo: data.saldo || undefined,
            observacoes: data.observacoes || undefined,
            synced: true,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });
        cacheAtualizado = true;
        console.log(`Firebase Firestore pronto - ${fretesCached.length} fretes em cache offline`);
      },
      (error: any) => {
        console.error('Erro no listener de fretes:', error);
        cacheAtualizado = true;
      }
    );
  } catch (error) {
    console.error('Erro ao inicializar database:', error);
  }
};

export const criarFrete = async (novo: NovoFrete): Promise<Frete> => {
  try {
    const ts = Date.now();
    const freteData: any = {
      data: novo.data,
      origem: novo.origem,
      destino: novo.destino,
      valorTotal: novo.valorTotal,
      createdAt: ts,
      updatedAt: ts,
    };
    
    if (novo.adiantamento) {
      freteData.adiantamento = novo.adiantamento;
    }
    if (novo.saldo) {
      freteData.saldo = novo.saldo;
    }
    if (novo.observacoes) {
      freteData.observacoes = novo.observacoes;
    }

    const docRef = await addDoc(collection(db, COLECAO), freteData);

    return {
      id: docRef.id,
      ...novo,
      synced: true,
      createdAt: ts,
      updatedAt: ts,
    };
  } catch (error) {
    console.error('Erro ao criar frete:', error);
    throw new Error('Não foi possível criar o frete. Verifique sua conexão.');
  }
};

export const listarFretes = async (): Promise<Frete[]> => {
  try {
    // Sempre prioriza cache se temos dados
    if (fretesCached.length > 0) {
      console.log(`Retornando ${fretesCached.length} fretes do cache`);
      return fretesCached.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    // Se cache está vazio mas foi atualizado (significa offline sem dados), retorna vazio
    if (cacheAtualizado) {
      return [];
    }

    // Tenta buscar da rede
    const snapshot = await getDocs(collection(db, COLECAO));
    const fretes = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        data: data.data,
        origem: data.origem,
        destino: data.destino,
        valorTotal: data.valorTotal || data.valor || 0,
        adiantamento: data.adiantamento || undefined,
        saldo: data.saldo || undefined,
        observacoes: data.observacoes || undefined,
        synced: true,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    });

    return fretes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (error) {
    console.error('Erro ao listar fretes:', error);
    // Se falhar, retorna cache
    return fretesCached;
  }
};

export const buscarFretePorId = async (id: string): Promise<Frete | null> => {
  try {
    // Tenta buscar do cache primeiro
    const fretesCache = fretesCached.find(f => f.id === id);
    if (fretesCache) {
      console.log(`Frete ${id} encontrado em cache`);
      return fretesCache;
    }

    // Se não estiver em cache, busca da rede
    const docRef = doc(db, COLECAO, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      data: data.data,
      origem: data.origem,
      destino: data.destino,
      valorTotal: data.valorTotal || data.valor || 0,
      adiantamento: data.adiantamento || undefined,
      saldo: data.saldo || undefined,
      observacoes: data.observacoes || undefined,
      synced: true,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    console.error('Erro ao buscar frete:', error);
    return null;
  }
};

export const atualizarFrete = async (id: string, dados: Partial<NovoFrete>) => {
  try {
    const docRef = doc(db, COLECAO, id);
    const updateData: any = {
      ...dados,
      updatedAt: Date.now(),
    };

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Erro ao atualizar frete:', error);
    throw new Error('Não foi possível atualizar o frete.');
  }
};

export const deletarFrete = async (id: string) => {
  try {
    const docRef = doc(db, COLECAO, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Erro ao deletar frete:', error);
    throw new Error('Não foi possível deletar o frete.');
  }
};

export const calcularEstatisticas = async (): Promise<EstatisticasFretes> => {
  try {
    // Usar cache se disponível
    const fretes = fretesCached.length > 0 ? fretesCached : await listarFretes();

    let totalFaturado = 0;
    let quantidadeFretes = 0;
    let freteMesAtual = 0;
    let quantidadeMesAtual = 0;

    const agora = new Date();
    const mesAtual = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;

    fretes.forEach((frete) => {
      const valor = frete.valorTotal || 0;
      const dataStr = frete.data ? String(frete.data) : '';

      totalFaturado += valor;
      quantidadeFretes++;

      if (dataStr && dataStr.startsWith(mesAtual)) {
        freteMesAtual += valor;
        quantidadeMesAtual++;
      }
    });

    return {
      totalFaturado,
      quantidadeFretes,
      freteMesAtual,
      quantidadeMesAtual,
    };
  } catch (error) {
    console.error('Erro ao calcular estatísticas:', error);
    return {
      totalFaturado: 0,
      quantidadeFretes: 0,
      freteMesAtual: 0,
      quantidadeMesAtual: 0,
    };
  }
};
