/**
 * Banco local SQLite (offline-first)
 */
import * as SQLite from 'expo-sqlite';
import { Frete, NovoFrete, EstatisticasFretes } from '../models/Frete';

const DB_NAME = 'fretes.db';

const getDatabase = async () => SQLite.openDatabaseAsync(DB_NAME);

export const initDatabase = async () => {
  const db = await getDatabase();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS fretes (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      origem TEXT NOT NULL,
      destino TEXT NOT NULL,
      valor REAL NOT NULL,
      observacoes TEXT,
      synced INTEGER DEFAULT 0,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );
  `);
};

export const criarFrete = async (novo: NovoFrete): Promise<Frete> => {
  const db = await getDatabase();
  const id = `frete_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const ts = Date.now();
  const frete: Frete = {
    id,
    ...novo,
    observacoes: novo.observacoes || undefined,
    synced: false,
    createdAt: ts,
    updatedAt: ts,
  };
  await db.runAsync(
    `INSERT INTO fretes (id, data, origem, destino, valor, observacoes, synced, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [frete.id, frete.data, frete.origem, frete.destino, frete.valor, frete.observacoes || null, 0, ts, ts]
  );
  return frete;
};

export const listarFretes = async (): Promise<Frete[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>('SELECT * FROM fretes ORDER BY data DESC, createdAt DESC');
  return rows.map((r) => ({
    id: r.id,
    data: r.data,
    origem: r.origem,
    destino: r.destino,
    valor: r.valor,
    observacoes: r.observacoes || undefined,
    synced: r.synced === 1,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
};

export const buscarFretePorId = async (id: string): Promise<Frete | null> => {
  const db = await getDatabase();
  const r = await db.getFirstAsync<any>('SELECT * FROM fretes WHERE id = ?', [id]);
  if (!r) return null;
  return {
    id: r.id,
    data: r.data,
    origem: r.origem,
    destino: r.destino,
    valor: r.valor,
    observacoes: r.observacoes || undefined,
    synced: r.synced === 1,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
};

export const atualizarFrete = async (id: string, dados: Partial<NovoFrete>) => {
  const db = await getDatabase();
  const campos: string[] = [];
  const valores: any[] = [];
  if (dados.data !== undefined) { campos.push('data = ?'); valores.push(dados.data); }
  if (dados.origem !== undefined) { campos.push('origem = ?'); valores.push(dados.origem); }
  if (dados.destino !== undefined) { campos.push('destino = ?'); valores.push(dados.destino); }
  if (dados.valor !== undefined) { campos.push('valor = ?'); valores.push(dados.valor); }
  if (dados.observacoes !== undefined) { campos.push('observacoes = ?'); valores.push(dados.observacoes); }
  campos.push('updatedAt = ?', 'synced = ?');
  valores.push(Date.now(), 0, id);
  await db.runAsync(`UPDATE fretes SET ${campos.join(', ')} WHERE id = ?`, valores);
};

export const deletarFrete = async (id: string) => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM fretes WHERE id = ?', [id]);
};

export const listarFretesNaoSincronizados = async (): Promise<Frete[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>('SELECT * FROM fretes WHERE synced = 0 ORDER BY createdAt ASC');
  return rows.map((r) => ({
    id: r.id,
    data: r.data,
    origem: r.origem,
    destino: r.destino,
    valor: r.valor,
    observacoes: r.observacoes || undefined,
    synced: false,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
};

export const marcarComoSincronizado = async (id: string) => {
  const db = await getDatabase();
  await db.runAsync('UPDATE fretes SET synced = 1 WHERE id = ?', [id]);
};

export const calcularEstatisticas = async (): Promise<EstatisticasFretes> => {
  const db = await getDatabase();
  const total = await db.getFirstAsync<any>('SELECT COUNT(*) as count, COALESCE(SUM(valor),0) as total FROM fretes');
  const agora = new Date();
  const mesAtual = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
  const mes = await db.getFirstAsync<any>(
    'SELECT COUNT(*) as count, COALESCE(SUM(valor),0) as total FROM fretes WHERE data LIKE ?',[`${mesAtual}%`]
  );
  return {
    totalFaturado: total?.total || 0,
    quantidadeFretes: total?.count || 0,
    freteMesAtual: mes?.total || 0,
    quantidadeMesAtual: mes?.count || 0,
  };
};
