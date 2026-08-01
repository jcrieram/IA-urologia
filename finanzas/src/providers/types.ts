import { Debt, Txn } from '../models/types';

/**
 * Contrato común para cualquier fuente de datos financieros.
 * Hoy: ImportProvider (cartolas CSV). Mañana: FintocProvider (open banking),
 * sin cambiar el resto de la app.
 */
export interface DataProvider {
  id: string;
  label: string;
  /** ¿Está listo para usarse? (ej: Fintoc necesita credenciales). */
  isAvailable(): Promise<boolean>;
  /** Trae movimientos nuevos. El caller se encarga de deduplicar y guardar. */
  fetchTransactions(): Promise<Txn[]>;
  /** Trae deudas conocidas (tarjetas / créditos). Puede devolver []. */
  fetchDebts(): Promise<Debt[]>;
}
