/**
 * Sincronização SQLite -> Firebase
 */
import NetInfo from '@react-native-community/netinfo';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { listarFretesNaoSincronizados, marcarComoSincronizado, buscarFretePorId, criarFrete, atualizarFrete } from './database';

const COLECAO = 'fretes';

export const verificarConexao = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected === true;
};

export const sincronizarParaNuvem = async () => {
  if (!(await verificarConexao())) return;
  const pendentes = await listarFretesNaoSincronizados();
  for (const frete of pendentes) {
    const ref = doc(db, COLECAO, frete.id);
    const payload = {
      ...frete,
      observacoes: frete.observacoes ?? null,
    };
    await setDoc(ref, payload);
    await marcarComoSincronizado(frete.id);
  }
};

export const sincronizarDaNuvem = async () => {
  if (!(await verificarConexao())) return;
  const snap = await getDocs(collection(db, COLECAO));
  for (const docSnap of snap.docs) {
    const dados = docSnap.data();
    const local = await buscarFretePorId(docSnap.id);
    if (!local) {
      await criarFrete({
        data: dados.data,
        origem: dados.origem,
        destino: dados.destino,
        valor: dados.valor,
        observacoes: dados.observacoes,
      });
      await marcarComoSincronizado(docSnap.id);
    } else if (dados.updatedAt > local.updatedAt) {
      await atualizarFrete(docSnap.id, {
        data: dados.data,
        origem: dados.origem,
        destino: dados.destino,
        valor: dados.valor,
        observacoes: dados.observacoes,
      });
      await marcarComoSincronizado(docSnap.id);
    }
  }
};

export const sincronizarCompleto = async () => {
  await sincronizarParaNuvem();
  await sincronizarDaNuvem();
};

export const iniciarSincronizacaoAutomatica = () => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) sincronizarCompleto();
  });
  sincronizarCompleto();
  return unsubscribe;
};
