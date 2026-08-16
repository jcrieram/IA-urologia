/** Umbrales de alerta interna (solo visibles dentro de la plataforma). */

export const DIAS_ALERTA_NO_CONCRETADA = 18;
export const DIAS_ALERTA_PAGO_PENDIENTE = 30;

function diasDesde(fecha: string | Date, ahora: Date): number {
  const inicio = typeof fecha === "string" ? new Date(fecha) : fecha;
  const ms = ahora.getTime() - inicio.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/** Un caso en estado 'solicitud' sin agendar hace mas de 18 dias. */
export function esNoConcretada(
  fechaSolicitud: string | null,
  estado: string,
  ahora: Date = new Date()
): boolean {
  if (estado !== "solicitud" || !fechaSolicitud) return false;
  return diasDesde(fechaSolicitud, ahora) > DIAS_ALERTA_NO_CONCRETADA;
}

/** Un caso operado hace mas de 30 dias sin pago registrado. */
export function esPagoPendiente(
  fechaCirugiaReal: string | null,
  estado: string,
  tienePago: boolean,
  ahora: Date = new Date()
): boolean {
  if (tienePago) return false;
  if (!["operada", "alta", "cerrada"].includes(estado)) return false;
  if (!fechaCirugiaReal) return false;
  return diasDesde(fechaCirugiaReal, ahora) > DIAS_ALERTA_PAGO_PENDIENTE;
}
