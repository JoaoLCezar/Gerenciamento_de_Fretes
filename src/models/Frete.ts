/**
 * Modelo de dados do Frete
 */

export type StatusPagamento = 'pendente' | 'adiantamento_pago' | 'pago';

export interface Frete {
  id: string;
  titulo: string;
  userId: string; // ID do usuário que criou o frete
  data: string; // ISO string
  origem: string;
  destino: string;
  valorTotal: number;
  adiantamento?: number;
  saldo?: number;
  statusPagamento: StatusPagamento;
  observacoes?: string;
  synced: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface NovoFrete {
  titulo: string;
  userId: string; // ID do usuário que está criando
  data: string;
  origem: string;
  destino: string;
  valorTotal: number;
  adiantamento?: number;
  saldo?: number;
  statusPagamento?: StatusPagamento;
  observacoes?: string;
}

export interface EstatisticasFretes {
  totalFaturado: number;
  quantidadeFretes: number;
  freteMesAtual: number;
  quantidadeMesAtual: number;
  totalSaldo: number;
}
