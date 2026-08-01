/**
 * Categorización simple por palabras clave sobre el nombre del comercio.
 * Pensado para comercios chilenos comunes. Es heurístico y ampliable.
 */
export const CATEGORIES = [
  'Supermercado',
  'Restaurante',
  'Combustible',
  'Transporte',
  'Salud',
  'Farmacia',
  'Retail',
  'Servicios',
  'Streaming',
  'Educación',
  'Viajes',
  'Transferencia',
  'Ingreso',
  'Otros',
] as const;

export type Category = (typeof CATEGORIES)[number];

const RULES: { category: Category; keywords: string[] }[] = [
  { category: 'Supermercado', keywords: ['lider', 'jumbo', 'santa isabel', 'unimarc', 'tottus', 'acuenta', 'ekono', 'mayorista 10', 'super'] },
  { category: 'Restaurante', keywords: ['restaurant', 'restoran', 'cafe', 'café', 'pedidosya', 'uber eats', 'ubereats', 'rappi', 'mcdonald', 'burger', 'kfc', 'doggis', 'juan maestro', 'sushi', 'pizza', 'starbucks'] },
  { category: 'Combustible', keywords: ['copec', 'shell', 'petrobras', 'aramco', 'terpel', 'bencina', 'combustible'] },
  { category: 'Transporte', keywords: ['uber', 'cabify', 'didi', 'metro', 'bip', 'transantiago', 'red movilidad', 'estacionamiento', 'tag', 'autopista', 'peaje'] },
  { category: 'Farmacia', keywords: ['farmacia', 'cruz verde', 'salcobrand', 'ahumada', 'dr simi'] },
  { category: 'Salud', keywords: ['clinica', 'clínica', 'hospital', 'isapre', 'fonasa', 'consulta', 'laboratorio', 'dental', 'medico', 'médico'] },
  { category: 'Retail', keywords: ['falabella', 'ripley', 'paris', 'hites', 'la polar', 'abcdin', 'sodimac', 'easy', 'mercado libre', 'mercadolibre', 'aliexpress', 'amazon'] },
  { category: 'Streaming', keywords: ['netflix', 'spotify', 'disney', 'hbo', 'max ', 'prime video', 'youtube', 'apple.com/bill', 'google', 'paramount', 'crunchyroll'] },
  { category: 'Educación', keywords: ['universidad', 'colegio', 'instituto', 'matricula', 'matrícula', 'udemy', 'coursera'] },
  { category: 'Viajes', keywords: ['latam', 'sky airline', 'jetsmart', 'booking', 'airbnb', 'despegar', 'hotel'] },
  { category: 'Servicios', keywords: ['enel', 'cge', 'aguas andinas', 'essbio', 'gtd', 'vtr', 'movistar', 'entel', 'wom', 'claro', 'gas ', 'lipigas', 'abastible', 'seguro', 'plan '] },
  { category: 'Transferencia', keywords: ['transferencia', 'transf ', 'traspaso', 'giro', 'pago cuenta', 'pac ', 'pat '] },
];

const INCOME_KEYWORDS = ['abono', 'remuneracion', 'remuneración', 'sueldo', 'deposito', 'depósito', 'devolucion', 'devolución', 'reverso'];

export function categorize(merchant: string, amount: number): Category {
  const m = merchant.toLowerCase();
  if (amount > 0) {
    if (INCOME_KEYWORDS.some((k) => m.includes(k))) return 'Ingreso';
  }
  for (const rule of RULES) {
    if (rule.keywords.some((k) => m.includes(k))) return rule.category;
  }
  if (amount > 0) return 'Ingreso';
  return 'Otros';
}

/** Normaliza el texto de comercio: recorta códigos, espacios y ruido común. */
export function normalizeMerchant(description: string): string {
  let s = (description || '').trim();
  // Quitar prefijos comunes de cartolas
  s = s.replace(/^(compra|pago|cargo|abono|transf(erencia)?)\s+(nacional|internac(ional)?|en\s+)?/i, '');
  // Colapsar espacios
  s = s.replace(/\s+/g, ' ').trim();
  // Recortar secuencias largas de dígitos (folios/tarjetas)
  s = s.replace(/\b\d{6,}\b/g, '').trim();
  return s || (description || '').trim();
}
