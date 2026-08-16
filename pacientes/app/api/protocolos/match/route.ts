import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { AuthError, requireUser } from "@/lib/auth";
import { crearClienteAdmin } from "@/lib/supabase/server";
import { normalizarRut, esRutValido } from "@/lib/rut";

const MatchSchema = z.object({ rut: z.string().refine(esRutValido, "RUT invalido") });

export async function POST(request: NextRequest) {
  try {
    await requireUser();
  } catch (e) {
    if (e instanceof AuthError)
      return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const body = await request.json();
  const parsed = MatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "RUT invalido" }, { status: 400 });
  }

  const rut = normalizarRut(parsed.data.rut);
  const admin = crearClienteAdmin();

  const { data: paciente } = await admin
    .from("pacientes")
    .select("id")
    .eq("rut", rut)
    .maybeSingle();

  if (!paciente) {
    return NextResponse.json({ caso: null });
  }

  const { data: caso } = await admin
    .from("casos")
    .select("*, paciente:pacientes(*)")
    .eq("paciente_id", paciente.id)
    .in("estado", ["solicitud", "agendada"])
    .order("fecha_solicitud", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ caso: caso ?? null });
}
