export type CasoEstado =
  | "solicitud"
  | "agendada"
  | "operada"
  | "alta"
  | "no_concretada"
  | "cerrada";

export type CasoRol = "cirujano" | "ayudante";

export const CASO_ESTADO_LABEL: Record<CasoEstado, string> = {
  solicitud: "Solicitud recibida",
  agendada: "Agendada",
  operada: "Operada",
  alta: "Alta post-operatoria",
  no_concretada: "No concretada",
  cerrada: "Cerrada",
};

export interface Paciente {
  id: string;
  rut: string;
  nombre: string;
  edad: number | null;
  telefono: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Caso {
  id: string;
  paciente_id: string;
  estado: CasoEstado;
  rol: CasoRol;
  cirujano_principal: string | null;
  clinica_derivada: string | null;
  clinica_final: string | null;
  fecha_solicitud: string | null;
  fecha_cirugia_programada: string | null;
  fecha_cirugia_real: string | null;
  numero_ingreso: string | null;
  fecha_alta: string | null;
  foto_solicitud_path: string | null;
  foto_protocolo_path: string | null;
  observaciones: string | null;
  created_at: string;
  updated_at: string;
}

export interface CasoConPaciente extends Caso {
  paciente: Paciente;
}

export interface Pago {
  id: string;
  caso_id: string;
  monto: number;
  fecha_pago: string;
  observaciones: string | null;
  created_at: string;
}

export interface CatalogoFonasa {
  id: string;
  codigo: string;
  tipo: string | null;
  nombre_procedimiento: string;
  monto_cirujano: number | null;
  monto_ayudante: number | null;
  vigente: boolean;
  updated_at: string;
}
