import { crearClienteAnthropic, MODELO_OCR } from "./client";
import {
  HERRAMIENTA_SOLICITUD,
  HERRAMIENTA_PROTOCOLO,
  SolicitudExtraidaSchema,
  ProtocoloExtraidoSchema,
  type SolicitudExtraida,
  type ProtocoloExtraido,
} from "./schemas";

type MediaType = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

async function llamarHerramienta(
  base64: string,
  mediaType: MediaType,
  herramienta: typeof HERRAMIENTA_SOLICITUD | typeof HERRAMIENTA_PROTOCOLO,
  instrucciones: string
) {
  const anthropic = crearClienteAnthropic();

  const respuesta = await anthropic.messages.create({
    model: MODELO_OCR,
    max_tokens: 1024,
    tools: [herramienta],
    tool_choice: { type: "tool", name: herramienta.name },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: base64 },
          },
          { type: "text", text: instrucciones },
        ],
      },
    ],
  });

  const bloque = respuesta.content.find(
    (b): b is Extract<typeof b, { type: "tool_use" }> => b.type === "tool_use"
  );
  if (!bloque) {
    throw new Error("El modelo no devolvio datos estructurados.");
  }
  return bloque.input;
}

export async function extraerSolicitud(
  base64: string,
  mediaType: MediaType
): Promise<SolicitudExtraida> {
  const input = await llamarHerramienta(
    base64,
    mediaType,
    HERRAMIENTA_SOLICITUD,
    "Esta es una foto de una solicitud/orden de cirugia urologica chilena. Extrae los datos exactamente como aparecen escritos, sin inventar ni completar campos que no esten visibles (usa null). El RUT debe incluir el guion antes del digito verificador."
  );
  return SolicitudExtraidaSchema.parse(input);
}

export async function extraerProtocolo(
  base64: string,
  mediaType: MediaType
): Promise<ProtocoloExtraido> {
  const input = await llamarHerramienta(
    base64,
    mediaType,
    HERRAMIENTA_PROTOCOLO,
    "Esta es una foto de un protocolo operatorio chileno (documento emitido despues de una cirugia). El formato varia segun la clinica. Extrae los datos exactamente como aparecen, sin inventar ni completar campos que no esten visibles (usa null). Presta especial atencion a distinguir el campo 'Cirujano' del campo 'Ayudante' — son personas distintas. El RUT debe incluir el guion antes del digito verificador."
  );
  return ProtocoloExtraidoSchema.parse(input);
}
