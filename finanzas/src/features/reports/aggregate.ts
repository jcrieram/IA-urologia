import { Txn } from '../../models/types';

export interface RangeFilter {
  from?: string; // ISO yyyy-MM-dd inclusive
  to?: string; // ISO yyyy-MM-dd inclusive
}

export function filterByRange(txns: Txn[], range: RangeFilter): Txn[] {
  return txns.filter((t) => {
    if (range.from && t.date < range.from) return false;
    if (range.to && t.date > range.to) return false;
    return true;
  });
}

export interface Totals {
  gastos: number; // suma de cargos, en positivo
  ingresos: number; // suma de abonos
  neto: number; // ingresos - gastos
  count: number;
}

export function totals(txns: Txn[]): Totals {
  let gastos = 0;
  let ingresos = 0;
  for (const t of txns) {
    if (t.amount < 0) gastos += -t.amount;
    else ingresos += t.amount;
  }
  return { gastos, ingresos, neto: ingresos - gastos, count: txns.length };
}

export interface Bucket {
  key: string;
  total: number; // gasto en positivo
  count: number;
}

function groupExpenses(txns: Txn[], keyFn: (t: Txn) => string): Bucket[] {
  const map = new Map<string, Bucket>();
  for (const t of txns) {
    if (t.amount >= 0) continue; // solo gastos
    const key = keyFn(t) || '—';
    const b = map.get(key) ?? { key, total: 0, count: 0 };
    b.total += -t.amount;
    b.count += 1;
    map.set(key, b);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function byCategory(txns: Txn[]): Bucket[] {
  return groupExpenses(txns, (t) => t.category);
}

export function byMerchant(txns: Txn[], limit = 15): Bucket[] {
  return groupExpenses(txns, (t) => t.merchant).slice(0, limit);
}

export function byBank(txns: Txn[]): Bucket[] {
  return groupExpenses(txns, (t) => t.bank);
}

/** Presets de rango de fechas relativos a "hoy" (ISO). */
export function presetRange(preset: 'mes' | '30d' | '90d' | 'todo', todayIso: string): RangeFilter {
  if (preset === 'todo') return {};
  const today = new Date(todayIso + 'T00:00:00');
  if (preset === 'mes') {
    const from = `${todayIso.slice(0, 7)}-01`;
    return { from, to: todayIso };
  }
  const days = preset === '30d' ? 30 : 90;
  const past = new Date(today);
  past.setDate(past.getDate() - days);
  const from = past.toISOString().slice(0, 10);
  return { from, to: todayIso };
}
