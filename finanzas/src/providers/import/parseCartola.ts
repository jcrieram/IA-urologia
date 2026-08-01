import Papa from 'papaparse';
import * as Crypto from 'expo-crypto';
import { BankId, Txn } from '../../models/types';
import { parseCLP } from '../../utils/currency';
import { categorize, normalizeMerchant } from '../../utils/categories';
import { BANK_HINTS, BankHint } from './banks';

export interface ParseResult {
  txns: Txn[];
  warnings: string[];
  detectedColumns: { date?: string; description?: string; amount?: string; charge?: string; credit?: string };
}

function norm(s: string): string {
  return (s ?? '').toString().trim().toLowerCase();
}

function matchColumn(header: string[], candidates: string[]): number {
  const H = header.map(norm);
  // match exacto primero
  for (const cand of candidates) {
    const idx = H.indexOf(cand);
    if (idx >= 0) return idx;
  }
  // match parcial (contiene)
  for (const cand of candidates) {
    const idx = H.findIndex((h) => h.includes(cand));
    if (idx >= 0) return idx;
  }
  return -1;
}

/** Puntúa una fila como posible cabecera según cuántas pistas reconoce. */
function headerScore(row: string[], hint: BankHint): number {
  let score = 0;
  if (matchColumn(row, hint.date) >= 0) score += 2;
  if (matchColumn(row, hint.description) >= 0) score += 2;
  if (matchColumn(row, hint.amount) >= 0) score += 1;
  if (matchColumn(row, hint.charge) >= 0) score += 1;
  if (matchColumn(row, hint.credit) >= 0) score += 1;
  return score;
}

/** Convierte dd/MM/yyyy, dd-MM-yyyy, yyyy-MM-dd o dd/MM/yy a ISO yyyy-MM-dd. */
function parseDate(input: string): string | null {
  const s = (input ?? '').trim();
  if (!s) return null;

  // yyyy-MM-dd o yyyy/MM/dd
  let m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;

  // dd-MM-yyyy o dd/MM/yyyy
  m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;

  // dd/MM/yy
  m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2})$/);
  if (m) {
    const yy = parseInt(m[3], 10);
    const year = yy >= 70 ? 1900 + yy : 2000 + yy;
    return `${year}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  }
  return null;
}

async function makeId(seed: string): Promise<string> {
  const h = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, seed);
  return h.slice(0, 24);
}

/**
 * Parsea el contenido de una cartola CSV. Detecta automáticamente la fila de
 * cabecera (muchas cartolas traen metadatos arriba) y mapea las columnas.
 */
export async function parseCartolaCsv(
  content: string,
  bank: BankId,
  accountLabel?: string
): Promise<ParseResult> {
  const warnings: string[] = [];
  const hint = BANK_HINTS[bank] ?? BANK_HINTS.otro;

  const parsed = Papa.parse<string[]>(content, {
    skipEmptyLines: 'greedy',
  });
  const rows = (parsed.data as unknown as string[][]).filter((r) => Array.isArray(r) && r.some((c) => norm(c) !== ''));

  if (rows.length === 0) {
    return { txns: [], warnings: ['El archivo está vacío o no se pudo leer.'], detectedColumns: {} };
  }

  // Buscar la mejor fila de cabecera en las primeras 25 filas
  let headerIdx = -1;
  let bestScore = 0;
  const scanLimit = Math.min(rows.length, 25);
  for (let i = 0; i < scanLimit; i++) {
    const score = headerScore(rows[i], hint);
    if (score > bestScore) {
      bestScore = score;
      headerIdx = i;
    }
  }

  if (headerIdx < 0 || bestScore < 3) {
    return {
      txns: [],
      warnings: [
        'No se reconoció la cabecera de la cartola. Revisa que el CSV tenga columnas de Fecha, Descripción y Monto (o Cargo/Abono).',
      ],
      detectedColumns: {},
    };
  }

  const header = rows[headerIdx];
  const iDate = matchColumn(header, hint.date);
  const iDesc = matchColumn(header, hint.description);
  const iAmount = matchColumn(header, hint.amount);
  const iCharge = matchColumn(header, hint.charge);
  const iCredit = matchColumn(header, hint.credit);

  const detectedColumns = {
    date: iDate >= 0 ? header[iDate] : undefined,
    description: iDesc >= 0 ? header[iDesc] : undefined,
    amount: iAmount >= 0 ? header[iAmount] : undefined,
    charge: iCharge >= 0 ? header[iCharge] : undefined,
    credit: iCredit >= 0 ? header[iCredit] : undefined,
  };

  if (iDate < 0 || iDesc < 0 || (iAmount < 0 && iCharge < 0 && iCredit < 0)) {
    return {
      txns: [],
      warnings: ['Faltan columnas clave (fecha, descripción y monto/cargo/abono).'],
      detectedColumns,
    };
  }

  const txns: Txn[] = [];
  let skipped = 0;

  for (let r = headerIdx + 1; r < rows.length; r++) {
    const row = rows[r];
    const rawDate = row[iDate];
    const date = parseDate(rawDate);
    if (!date) {
      skipped++;
      continue;
    }
    const description = (row[iDesc] ?? '').toString().trim();
    if (!description) {
      skipped++;
      continue;
    }

    let amount: number | null = null;
    if (iAmount >= 0) {
      amount = parseCLP(row[iAmount]);
    }
    if (amount === null && (iCharge >= 0 || iCredit >= 0)) {
      const charge = iCharge >= 0 ? parseCLP(row[iCharge]) : null;
      const credit = iCredit >= 0 ? parseCLP(row[iCredit]) : null;
      if (charge && Math.abs(charge) > 0) amount = -Math.abs(charge);
      else if (credit && Math.abs(credit) > 0) amount = Math.abs(credit);
    }
    if (amount === null || amount === 0) {
      skipped++;
      continue;
    }

    const merchant = normalizeMerchant(description);
    const category = categorize(merchant, amount);
    const id = await makeId(`${bank}|${date}|${description}|${amount}|${r}`);

    txns.push({
      id,
      date,
      description,
      merchant,
      amount,
      bank,
      account: accountLabel,
      category,
      source: 'import',
    });
  }

  if (skipped > 0) warnings.push(`Se omitieron ${skipped} filas sin fecha/monto válidos.`);
  if (txns.length === 0) warnings.push('No se pudo extraer ningún movimiento del archivo.');

  return { txns, warnings, detectedColumns };
}
