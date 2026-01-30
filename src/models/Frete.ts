/**
 * Modelo de dados do Frete
 */
export interface Frete {
  id: string;
  data: string; // ISO string
  origem: string;
  destino: string;
  valor: number;
  observacoes?: string;
  synced: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface NovoFrete {
  data: string;
  origem: string;
  destino: string;
  valor: number;
  observacoes?: string;
}

export interface EstatisticasFretes {
  totalFaturado: number;
  quantidadeFretes: number;
  freteMesAtual: number;
  quantidadeMesAtual: number;
}
