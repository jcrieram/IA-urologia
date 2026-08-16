export type RangoReporte = "mes" | "anio" | "todo";

const MESES_CORTOS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export function calcularRango(rango: RangoReporte, ahora: Date = new Date()) {
  if (rango === "mes") {
    const desde = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    return { desde: isoFecha(desde), hasta: null as string | null };
  }
  if (rango === "anio") {
    const desde = new Date(ahora.getFullYear(), 0, 1);
    return { desde: isoFecha(desde), hasta: null as string | null };
  }
  return { desde: null as string | null, hasta: null as string | null };
}

function isoFecha(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Cuenta casos por mes (YYYY-MM) en los ultimos `meses` meses, incluyendo meses en cero. */
export function tendenciaMensual(
  fechas: string[],
  meses: number,
  ahora: Date = new Date()
): { etiqueta: string; valor: number }[] {
  const cubetas: { clave: string; etiqueta: string }[] = [];
  for (let i = meses - 1; i >= 0; i--) {
    const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    cubetas.push({
      clave: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      etiqueta: MESES_CORTOS[d.getMonth()],
    });
  }
  const conteos = new Map(cubetas.map((c) => [c.clave, 0]));
  for (const f of fechas) {
    const clave = f.slice(0, 7);
    if (conteos.has(clave)) conteos.set(clave, (conteos.get(clave) ?? 0) + 1);
  }
  return cubetas.map((c) => ({ etiqueta: c.etiqueta, valor: conteos.get(c.clave) ?? 0 }));
}
