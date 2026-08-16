import { nanoid } from "nanoid";
import { crearClienteAdmin } from "./server";

/** Sube un archivo al bucket privado 'documentos' y devuelve su path interno. */
export async function subirDocumento(
  carpeta: "solicitudes" | "protocolos",
  archivo: Buffer,
  contentType: string,
  extension: string
): Promise<string> {
  const admin = crearClienteAdmin();
  const path = `${carpeta}/${nanoid()}.${extension}`;

  const { error } = await admin.storage
    .from("documentos")
    .upload(path, archivo, { contentType, upsert: false });

  if (error) throw new Error(`No se pudo subir el archivo: ${error.message}`);
  return path;
}

export function extensionDesdeMimeType(mime: string): string {
  const mapa: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return mapa[mime] ?? "bin";
}
