import Link from "next/link";
import { crearClienteAdmin } from "@/lib/supabase/server";
import { CASO_ESTADO_LABEL, type CasoEstado } from "@/lib/types";

export const dynamic = "force-dynamic";

async function obtenerResumen() {
  const admin = crearClienteAdmin();

  const [{ data: casos }, { data: noConcretadas }, { data: pagoPendiente }] =
    await Promise.all([
      admin.from("casos").select("estado"),
      admin.from("v_no_concretada").select("id, paciente_nombre, paciente_rut, fecha_solicitud"),
      admin
        .from("v_pago_pendiente")
        .select("id, paciente_nombre, paciente_rut, fecha_cirugia_real"),
    ]);

  const conteos: Record<string, number> = {};
  for (const c of casos ?? []) {
    conteos[c.estado] = (conteos[c.estado] ?? 0) + 1;
  }

  const hoy = new Date();
  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - 7);
  const isoInicioSemana = inicioSemana.toISOString().slice(0, 10);

  const [{ count: solicitudesSemana }, { count: cirugiasSemana }, { count: pagosSemana }] =
    await Promise.all([
      admin
        .from("casos")
        .select("id", { count: "exact", head: true })
        .gte("fecha_solicitud", isoInicioSemana),
      admin
        .from("casos")
        .select("id", { count: "exact", head: true })
        .gte("fecha_cirugia_real", isoInicioSemana),
      admin
        .from("pagos")
        .select("id", { count: "exact", head: true })
        .gte("fecha_pago", isoInicioSemana),
    ]);

  return {
    conteos,
    noConcretadas: noConcretadas ?? [],
    pagoPendiente: pagoPendiente ?? [],
    resumenSemanal: {
      solicitudes: solicitudesSemana ?? 0,
      cirugias: cirugiasSemana ?? 0,
      pagos: pagosSemana ?? 0,
    },
  };
}

const ESTADOS_PIPELINE: CasoEstado[] = [
  "solicitud",
  "agendada",
  "operada",
  "alta",
  "cerrada",
];

export default async function DashboardPage() {
  const { conteos, noConcretadas, pagoPendiente, resumenSemanal } =
    await obtenerResumen();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Resumen</h1>
        <p className="text-sm text-slate-500">Estado general del pipeline de casos.</p>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {ESTADOS_PIPELINE.map((estado) => (
          <div
            key={estado}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <p className="text-2xl font-semibold text-slate-900">
              {conteos[estado] ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {CASO_ESTADO_LABEL[estado]}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900">Resumen semanal</h2>
        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xl font-semibold text-slate-900">
              {resumenSemanal.solicitudes}
            </p>
            <p className="text-slate-500">Solicitudes (7 días)</p>
          </div>
          <div>
            <p className="text-xl font-semibold text-slate-900">
              {resumenSemanal.cirugias}
            </p>
            <p className="text-slate-500">Cirugías (7 días)</p>
          </div>
          <div>
            <p className="text-xl font-semibold text-slate-900">
              {resumenSemanal.pagos}
            </p>
            <p className="text-slate-500">Pagos registrados (7 días)</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-sm font-semibold text-amber-900">
            No concretadas (&gt;18 días sin agendar) · {noConcretadas.length}
          </h2>
          <ul className="mt-3 space-y-2">
            {noConcretadas.map((c) => (
              <li key={c.id} className="text-sm">
                <Link
                  href={`/casos/${c.id}`}
                  className="text-amber-900 underline underline-offset-2"
                >
                  {c.paciente_nombre} · {c.paciente_rut}
                </Link>
              </li>
            ))}
            {noConcretadas.length === 0 && (
              <li className="text-sm text-amber-700">Sin alertas.</li>
            )}
          </ul>
        </section>

        <section className="rounded-xl border border-red-200 bg-red-50 p-4">
          <h2 className="text-sm font-semibold text-red-900">
            Pago pendiente (&gt;30 días post-cirugía) · {pagoPendiente.length}
          </h2>
          <ul className="mt-3 space-y-2">
            {pagoPendiente.map((c) => (
              <li key={c.id} className="text-sm">
                <Link
                  href={`/casos/${c.id}`}
                  className="text-red-900 underline underline-offset-2"
                >
                  {c.paciente_nombre} · {c.paciente_rut}
                </Link>
              </li>
            ))}
            {pagoPendiente.length === 0 && (
              <li className="text-sm text-red-700">Sin alertas.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
