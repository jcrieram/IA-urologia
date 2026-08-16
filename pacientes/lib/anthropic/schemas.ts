import { z } from "zod";

/** Herramienta forzada para extraccion de la foto de solicitud de cirugia. */
export const HERRAMIENTA_SOLICITUD = {
  name: "extraer_solicitud",
  description:
    "Extrae los datos del paciente y la cirugia desde una foto de una solicitud/orden quirurgica.",
  input_schema: {
    type: "object" as const,
    properties: {
      nombre: { type: "string", description: "Nombre completo del paciente" },
      rut: { type: "string", description: "RUT del paciente tal como aparece, con guion" },
      edad: { type: ["number", "null"], description: "Edad en anios si aparece, o null" },
      telefono: { type: ["string", "null"] },
      email: { type: ["string", "null"] },
      clinica_derivada: {
        type: ["string", "null"],
        description: "Nombre de la clinica/centro donde se solicita operar, segun membrete o sello",
      },
      fecha_solicitud: {
        type: ["string", "null"],
        description: "Fecha de la solicitud en formato YYYY-MM-DD",
      },
      codigo_fonasa: {
        type: ["string", "null"],
        description: "Codigo Fonasa/prestacion principal si aparece explicito (ej. 1902021)",
      },
      diagnostico: { type: ["string", "null"], description: "Diagnostico quirurgico si aparece" },
    },
    required: ["nombre", "rut"],
  },
};

export const SolicitudExtraidaSchema = z.object({
  nombre: z.string(),
  rut: z.string(),
  edad: z.number().nullable().optional(),
  telefono: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  clinica_derivada: z.string().nullable().optional(),
  fecha_solicitud: z.string().nullable().optional(),
  codigo_fonasa: z.string().nullable().optional(),
  diagnostico: z.string().nullable().optional(),
});

export type SolicitudExtraida = z.infer<typeof SolicitudExtraidaSchema>;

/** Herramienta forzada para extraccion de la foto de protocolo operatorio. */
export const HERRAMIENTA_PROTOCOLO = {
  name: "extraer_protocolo",
  description:
    "Extrae los datos del paciente y la cirugia desde una foto de un protocolo operatorio (documento emitido despues de la cirugia).",
  input_schema: {
    type: "object" as const,
    properties: {
      nombre: { type: "string" },
      rut: { type: "string" },
      edad: { type: ["number", "null"] },
      telefono: { type: ["string", "null"] },
      email: { type: ["string", "null"] },
      clinica: {
        type: ["string", "null"],
        description: "Clinica/hospital donde se realizo la cirugia, segun membrete",
      },
      fecha_cirugia: { type: ["string", "null"], description: "Fecha de la cirugia YYYY-MM-DD" },
      numero_ingreso: {
        type: ["string", "null"],
        description:
          "Numero de admision/ingreso/cuenta asignado por la clinica (puede aparecer como N Admision, N Cuenta, N Ficha, etc.)",
      },
      codigo_fonasa: { type: ["string", "null"], description: "Codigo Fonasa/prestacion principal" },
      cirujano: {
        type: ["string", "null"],
        description: "Nombre completo de quien aparece como Cirujano / 1er Cirujano en el documento",
      },
      ayudante: {
        type: ["string", "null"],
        description: "Nombre completo de quien aparece como Ayudante en el documento, si figura",
      },
    },
    required: ["nombre", "rut"],
  },
};

export const ProtocoloExtraidoSchema = z.object({
  nombre: z.string(),
  rut: z.string(),
  edad: z.number().nullable().optional(),
  telefono: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  clinica: z.string().nullable().optional(),
  fecha_cirugia: z.string().nullable().optional(),
  numero_ingreso: z.string().nullable().optional(),
  codigo_fonasa: z.string().nullable().optional(),
  cirujano: z.string().nullable().optional(),
  ayudante: z.string().nullable().optional(),
});

export type ProtocoloExtraido = z.infer<typeof ProtocoloExtraidoSchema>;
