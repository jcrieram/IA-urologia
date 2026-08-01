/** Formatea un monto en pesos chilenos (CLP) sin decimales: $1.234.567 */
export function formatCLP(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.round(Math.abs(amount));
  const withDots = abs.toLocaleString('es-CL');
  return `${sign}$${withDots}`;
}

/**
 * Convierte un texto de monto chileno a número.
 * Acepta formatos como "1.234.567", "1.234,56", "$ 1.234", "-1.234", "(1.234)".
 * En CLP el punto suele ser separador de miles; la coma, decimal.
 */
export function parseCLP(input: string): number | null {
  if (input == null) return null;
  let s = String(input).trim();
  if (s === '') return null;

  // Paréntesis => negativo (contabilidad)
  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1);
  }
  if (s.includes('-')) negative = true;

  // Quitar símbolos de moneda, espacios y signos
  s = s.replace(/[^\d.,]/g, '');
  if (s === '') return null;

  const hasComma = s.includes(',');
  const hasDot = s.includes('.');

  if (hasComma && hasDot) {
    // El último separador es el decimal
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (hasComma) {
    // Solo coma: decimal
    s = s.replace(',', '.');
  } else if (hasDot) {
    // Solo punto: en CLP suele ser miles. Si hay más de un punto,
    // o el grupo final no tiene 2 dígitos, tratar como miles.
    const parts = s.split('.');
    const last = parts[parts.length - 1];
    if (parts.length > 2 || last.length === 3) {
      s = s.replace(/\./g, '');
    }
    // si es "1234.56" (2 decimales) lo dejamos como decimal
  }

  const n = parseFloat(s);
  if (isNaN(n)) return null;
  return negative ? -Math.abs(n) : n;
}
