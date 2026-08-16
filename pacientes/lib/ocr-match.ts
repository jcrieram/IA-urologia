function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * Heuristica para saber si un nombre extraido de un protocolo corresponde
 * al Dr. Riera (para decidir si su rol fue 'cirujano' o 'ayudante'). Siempre
 * queda editable por el usuario en el formulario de confirmacion — esto solo
 * pre-llena un valor razonable.
 */
export function esDrRiera(nombre: string | null | undefined): boolean {
  if (!nombre) return false;
  const n = normalizar(nombre);
  return n.includes("riera") && n.includes("juan") && n.includes("carlos");
}

/**
 * A partir de los campos 'cirujano' y 'ayudante' extraidos de un protocolo,
 * determina el rol del Dr. Riera y quien es el cirujano principal a registrar
 * cuando el rol es 'ayudante'.
 */
export function determinarRol(
  cirujano: string | null | undefined,
  ayudante: string | null | undefined
): { rol: "cirujano" | "ayudante"; cirujanoPrincipal: string | null } {
  if (esDrRiera(cirujano)) return { rol: "cirujano", cirujanoPrincipal: null };
  if (esDrRiera(ayudante)) return { rol: "ayudante", cirujanoPrincipal: cirujano ?? null };
  // Ambiguo: no se detecto el nombre en ninguno de los dos campos.
  // Se asume cirujano por defecto (caso mas comun); el usuario lo corrige si hace falta.
  return { rol: "cirujano", cirujanoPrincipal: null };
}
