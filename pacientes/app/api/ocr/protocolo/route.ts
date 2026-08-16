import { NextResponse, type NextRequest } from "next/server";
import { AuthError, requireUser } from "@/lib/auth";
import { extraerProtocolo } from "@/lib/anthropic/extract";
import { subirDocumento, extensionDesdeMimeType } from "@/lib/supabase/storage";
import { determinarRol } from "@/lib/ocr-match";

export const runtime = "nodejs";

const MIME_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  try {
    await requireUser();
  } catch (e) {
    if (e instanceof AuthError)
      return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const form = await request.formData();
  const archivo = form.get("file");
  if (!(archivo instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo de imagen." }, { status: 400 });
  }
  if (!MIME_PERMITIDOS.includes(archivo.type)) {
    return NextResponse.json({ error: "Formato de imagen no soportado." }, { status: 400 });
  }

  const buffer = Buffer.from(await archivo.arrayBuffer());
  const extension = extensionDesdeMimeType(archivo.type);

  let storagePath: string;
  try {
    storagePath = await subirDocumento("protocolos", buffer, archivo.type, extension);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "No se pudo subir la imagen." },
      { status: 500 }
    );
  }

  try {
    const extracted = await extraerProtocolo(
      buffer.toString("base64"),
      archivo.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif"
    );
    const { rol, cirujanoPrincipal } = determinarRol(extracted.cirujano, extracted.ayudante);
    return NextResponse.json({
      extracted,
      storage_path: storagePath,
      rol,
      cirujano_principal: cirujanoPrincipal,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? `No se pudieron extraer los datos: ${e.message}`
            : "No se pudieron extraer los datos de la imagen.",
        storage_path: storagePath,
      },
      { status: 502 }
    );
  }
}
