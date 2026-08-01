import { BankId } from '../../models/types';

/**
 * Pistas de columnas por banco para el parser de cartolas.
 * Los nombres reales varían según el formato de descarga (CSV / Excel exportado
 * a CSV) y pueden cambiar; por eso el parser también hace detección genérica.
 * Todo en minúsculas para comparar sin distinción de mayúsculas.
 */
export interface BankHint {
  date: string[];
  description: string[];
  /** columna única de monto con signo, si existe */
  amount: string[];
  /** columnas separadas cargo/abono, si el banco las usa */
  charge: string[]; // cargo / giro / débito
  credit: string[]; // abono / depósito / crédito
}

const COMMON: BankHint = {
  date: ['fecha', 'fecha transaccion', 'fecha transacción', 'fecha mov', 'fecha movimiento', 'date'],
  description: ['descripcion', 'descripción', 'detalle', 'glosa', 'movimiento', 'concepto', 'comercio', 'transaccion', 'transacción'],
  amount: ['monto', 'monto (clp)', 'monto total', 'valor', 'importe'],
  charge: ['cargo', 'cargos', 'giro', 'giros', 'debito', 'débito', 'debe', 'cheques / cargos'],
  credit: ['abono', 'abonos', 'deposito', 'depósito', 'credito', 'crédito', 'haber', 'depositos / abonos'],
};

export const BANK_HINTS: Record<BankId, BankHint> = {
  bancoestado: {
    ...COMMON,
    date: ['fecha', ...COMMON.date],
    description: ['descripción', 'descripcion', 'transacción', 'transaccion', ...COMMON.description],
    charge: ['cheques / cargos', 'cargos', ...COMMON.charge],
    credit: ['depósitos / abonos', 'depositos / abonos', 'abonos', ...COMMON.credit],
  },
  bancochile: { ...COMMON },
  scotiabank: { ...COMMON },
  itau: { ...COMMON },
  otro: { ...COMMON },
};
