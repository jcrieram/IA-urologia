import { NextResponse, type NextRequest } from "next/server";
import { AuthError, requireUser } from "@/lib/auth";
import { crearClienteAdmin } from "@/lib/supabase/server";
import { calcularRango, type RangoReporte } from "@/lib/reportes";

const ESTADOS_REALIZADOS = ["operada", "alta", "cerrada"];

function csvEscape(valor: unknown): string {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  if (/[",\n]/.test(texto)) return `"${texto.replace(/"/g, '""')}"`;
  return texto;
}

export async function GET(request: NextRequest) {
  try {
    await requireUser();
  } catch (e) {
    if (e instanceof AuthError)
      return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const rango = (request.nextUrl.searchParams.get("rango") as RangoReporte) ?? "mes";
  const { desde } = calcularRango(rango);

  const admin = crearClienteAdmin();
  let query = admin
    .from("casos")
    .select(
      "rol, clinica_final, clinica_derivada, fecha_solicitud, fecha_cirugia_real, estado, paciente:pacientes(nombre, rut), pago:pagos(monto, fecha_pago)"
    )
    .in("estado", ESTADOS_REALIZADOS)
    .not("fecha_cirugia_real", "is", null)
    .order("fecha_cirugia_real", { ascending: true });

  if (desde) query = query.gte("fecha_cirugia_real", desde);

  const { data: casos, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const encabezados = [
    "Paciente",
    "RUT",
    "Rol",
    "Clínica",
    "Fecha solicitud",
    "Fecha cirugía",
    "Estado",
    "Pagado",
    "Monto",
    "Fecha pago",
  ];

  const filas = (casos ?? []).map((c) => {
    const paciente = Array.isArray(c.paciente) ? c.paciente[0] : c.paciente;
    const pago = Array.isArray(c.pago) ? c.pago[0] : c.pago;
    return [
      paciente?.nombre,
      paciente?.rut,
      c.rol,
      c.clinica_final ?? c.clinica_derivada,
      c.fecha_solicitud,
      c.fecha_cirugia_real,
      c.estado,
      pago ? "Sí" : "No",
      pago?.monto ?? "",
      pago?.fecha_pago ?? "",
    ];
  });

  const csv = [encabezados, ...filas]
    .map((fila) => fila.map(csvEscape).join(","))
    .join("\n");

  return new NextResponse(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="reporte-${rango}.csv"`,
    },
  });
}
