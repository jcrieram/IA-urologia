import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { AuthError, requireUser } from "@/lib/auth";
import { crearClienteAdmin } from "@/lib/supabase/server";

const CasoUpdateSchema = z.object({
  estado: z
    .enum(["solicitud", "agendada", "operada", "alta", "no_concretada", "cerrada"])
    .optional(),
  rol: z.enum(["cirujano", "ayudante"]).optional(),
  cirujano_principal: z.string().nullable().optional(),
  clinica_final: z.string().nullable().optional(),
  fecha_cirugia_programada: z.string().nullable().optional(),
  fecha_cirugia_real: z.string().nullable().optional(),
  numero_ingreso: z.string().nullable().optional(),
  fecha_alta: z.string().nullable().optional(),
  foto_protocolo_path: z.string().nullable().optional(),
  observaciones: z.string().nullable().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireUser();
  } catch (e) {
    if (e instanceof AuthError)
      return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const { id } = await params;
  const admin = crearClienteAdmin();
  const { data: caso, error } = await admin
    .from("casos")
    .select("*, paciente:pacientes(*), pago:pagos(*), encuesta:encuestas(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!caso) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ caso });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireUser();
  } catch (e) {
    if (e instanceof AuthError)
      return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = CasoUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos invalidos", detalles: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const admin = crearClienteAdmin();
  const { data: caso, error } = await admin
    .from("casos")
    .update(parsed.data)
    .eq("id", id)
    .select("*, paciente:pacientes(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ caso });
}
