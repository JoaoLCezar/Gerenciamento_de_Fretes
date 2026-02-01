import { StatusPagamento } from '../models/Frete';

export const calcularStatusPagamento = (
  valorTotal: number,
  adiantamento?: number,
  saldo?: number
): StatusPagamento => {
  // Se não tem adiantamento nem saldo, está pendente
  if (!adiantamento && !saldo) {
    return 'pendente';
  }

  const valorAdiantamento = adiantamento || 0;
  const valorSaldo = saldo || 0;

  // Se adiantamento + saldo cobrem o valor total, está pago
  if (valorAdiantamento > 0 && valorSaldo > 0 && (valorAdiantamento + valorSaldo) >= valorTotal) {
    return 'pago';
  }

  // Se tem apenas adiantamento e cobre o total, está pago
  if (valorAdiantamento >= valorTotal && valorSaldo === 0) {
    return 'pago';
  }

  // Se tem adiantamento mas não cobre o total, adiantamento está pago (parcial)
  if (valorAdiantamento > 0 && valorAdiantamento < valorTotal) {
    return 'adiantamento_pago';
  }

  return 'pendente';
};

export const obterTextoStatus = (status: StatusPagamento): string => {
  switch (status) {
    case 'pendente':
      return 'Pendente';
    case 'adiantamento_pago':
      return 'Adiant. Pago';
    case 'pago':
      return 'Pago';
    default:
      return 'Pendente';
  }
};

export const obterCorStatus = (status: StatusPagamento): string => {
  switch (status) {
    case 'pendente':
      return '#FF6B6B'; // Vermelho
    case 'adiantamento_pago':
      return '#FFA500'; // Laranja
    case 'pago':
      return '#28A745'; // Verde
    default:
      return '#999';
  }
};
