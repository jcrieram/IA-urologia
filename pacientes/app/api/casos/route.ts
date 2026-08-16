import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { AuthError, requireUser } from "@/lib/auth";
import { crearClienteAdmin } from "@/lib/supabase/server";
import { normalizarRut, esRutValido } from "@/lib/rut";

const CasoNuevoSchema = z.object({
  rut: z.string().refine(esRutValido, "RUT invalido"),
  nombre: z.string().min(1),
  edad: z.number().int().positive().nullable().optional(),
  telefono: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  rol: z.enum(["cirujano", "ayudante"]),
  cirujano_principal: z.string().nullable().optional(),
  clinica_derivada: z.string().nullable().optional(),
  clinica_final: z.string().nullable().optional(),
  fecha_solicitud: z.string().nullable().optional(),
  fecha_cirugia_real: z.string().nullable().optional(),
  numero_ingreso: z.string().nullable().optional(),
  foto_solicitud_path: z.string().nullable().optional(),
  foto_protocolo_path: z.string().nullable().optional(),
  observaciones: z.string().nullable().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireUser();
  } catch (e) {
    if (e instanceof AuthError)
      return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const estado = request.nextUrl.searchParams.get("estado");
  const q = request.nextUrl.searchParams.get("q");

  const admin = crearClienteAdmin();

  let pacienteIds: string[] | null = null;
  if (q) {
    const qLimpio = q.replace(/[.\s]/g, "");
    const { data: pacientesMatch } = await admin
      .from("pacientes")
      .select("id")
      .or(`nombre.ilike.%${q}%,rut.ilike.%${qLimpio}%`);
    pacienteIds = (pacientesMatch ?? []).map((p) => p.id);
    if (pacienteIds.length === 0) return NextResponse.json({ casos: [] });
  }

  let query = admin
    .from("casos")
    .select("*, paciente:pacientes(*)")
    .order("created_at", { ascending: false });

  if (estado) query = query.eq("estado", estado);
  if (pacienteIds) query = query.in("paciente_id", pacienteIds);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ casos: data });
}

export async function POST(request: NextRequest) {
  try {
    await requireUser();
  } catch (e) {
    if (e instanceof AuthError)
      return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const body = await request.json();
  const parsed = CasoNuevoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos invalidos", detalles: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const datos = parsed.data;
  const rut = normalizarRut(datos.rut);
  const admin = crearClienteAdmin();

  const { data: paciente, error: errorPaciente } = await admin
    .from("pacientes")
    .upsert(
      {
        rut,
        nombre: datos.nombre,
        edad: datos.edad ?? null,
        telefono: datos.telefono ?? null,
        email: datos.email ?? null,
      },
      { onConflict: "rut" }
    )
    .select()
    .single();

  if (errorPaciente) {
    return NextResponse.json({ error: errorPaciente.message }, { status: 500 });
  }

  // Si viene con datos de protocolo (fecha de cirugia), el caso nace ya operado
  // — es el flujo de "primer ayudante sin solicitud previa".
  const estadoInicial = datos.fecha_cirugia_real ? "operada" : "solicitud";

  const { data: caso, error: errorCaso } = await admin
    .from("casos")
    .insert({
      paciente_id: paciente.id,
      estado: estadoInicial,
      rol: datos.rol,
      cirujano_principal:
        datos.rol === "ayudante" ? datos.cirujano_principal ?? null : null,
      clinica_derivada: datos.clinica_derivada ?? null,
      clinica_final: datos.clinica_final ?? null,
      fecha_solicitud: datos.fecha_solicitud ?? null,
      fecha_cirugia_real: datos.fecha_cirugia_real ?? null,
      numero_ingreso: datos.numero_ingreso ?? null,
      foto_solicitud_path: datos.foto_solicitud_path ?? null,
      foto_protocolo_path: datos.foto_protocolo_path ?? null,
      observaciones: datos.observaciones ?? null,
    })
    .select("*, paciente:pacientes(*)")
    .single();

  if (errorCaso) {
    return NextResponse.json({ error: errorCaso.message }, { status: 500 });
  }

  return NextResponse.json({ caso }, { status: 201 });
}
