export type BankId =
  | 'bancoestado'
  | 'bancochile'
  | 'scotiabank'
  | 'itau'
  | 'otro';

export const BANKS: Record<BankId, { label: string; color: string }> = {
  bancoestado: { label: 'BancoEstado', color: '#F5A623' },
  bancochile: { label: 'Banco de Chile', color: '#0033A0' },
  scotiabank: { label: 'Scotiabank', color: '#E4002B' },
  itau: { label: 'Itaú', color: '#FF7A00' },
  otro: { label: 'Otro', color: '#7A88A8' },
};

/** Un movimiento de una cartola o proveedor. Montos en pesos chilenos (CLP). */
export interface Txn {
  id: string;
  date: string; // ISO yyyy-MM-dd
  description: string;
  merchant: string; // comercio normalizado
  amount: number; // negativo = gasto/cargo, positivo = abono/ingreso
  bank: BankId;
  account?: string; // producto/cuenta enmascarada
  category: string;
  source: 'import' | 'fintoc' | 'manual';
}

export type DebtType = 'tarjeta' | 'credito';

/** Una deuda: saldo de tarjeta de crédito o crédito de consumo. */
export interface Debt {
  id: string;
  bank: BankId;
  type: DebtType;
  product: string; // "Tarjeta Visa", "Crédito de consumo"...
  totalOwed: number; // deuda total en CLP
  minPayment?: number; // pago mínimo
  dueDate?: string; // ISO yyyy-MM-dd fecha de vencimiento
  updatedAt: string; // ISO
}

export interface Vault {
  version: number;
  transactions: Txn[];
  debts: Debt[];
}

export const EMPTY_VAULT: Vault = {
  version: 1,
  transactions: [],
  debts: [],
};
