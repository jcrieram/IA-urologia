import Link from "next/link";
import {
  FileClock,
  CalendarCheck2,
  Scissors,
  BadgeCheck,
  CheckCircle2,
  AlertTriangle,
  CircleDollarSign,
  ArrowRight,
} from "lucide-react";
import { crearClienteAdmin } from "@/lib/supabase/server";
import { CASO_ESTADO_LABEL, type CasoEstado } from "@/lib/types";
import { StatTile } from "@/components/ui/StatTile";
import { Card, CardHeader } from "@/components/ui/Card";

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

const ESTADOS_PIPELINE: { estado: CasoEstado; icon: typeof FileClock }[] = [
  { estado: "solicitud", icon: FileClock },
  { estado: "agendada", icon: CalendarCheck2 },
  { estado: "operada", icon: Scissors },
  { estado: "alta", icon: BadgeCheck },
  { estado: "cerrada", icon: CheckCircle2 },
];

export default async function DashboardPage() {
  const { conteos, noConcretadas, pagoPendiente, resumenSemanal } =
    await obtenerResumen();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink">Resumen</h1>
        <p className="text-sm text-ink-muted">Estado general del pipeline de casos.</p>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {ESTADOS_PIPELINE.map(({ estado, icon }) => (
          <StatTile
            key={estado}
            label={CASO_ESTADO_LABEL[estado]}
            value={conteos[estado] ?? 0}
            icon={icon}
          />
        ))}
      </section>

      <Card>
        <CardHeader title="Resumen semanal" subtitle="Últimos 7 días" />
        <div className="grid grid-cols-3 gap-4 px-5 py-5 text-sm">
          <div>
            <p className="text-2xl font-semibold tabular-nums text-ink">
              {resumenSemanal.solicitudes}
            </p>
            <p className="mt-0.5 text-ink-muted">Solicitudes</p>
          </div>
          <div>
            <p className="text-2xl font-semibold tabular-nums text-ink">
              {resumenSemanal.cirugias}
            </p>
            <p className="mt-0.5 text-ink-muted">Cirugías</p>
          </div>
          <div>
            <p className="text-2xl font-semibold tabular-nums text-ink">
              {resumenSemanal.pagos}
            </p>
            <p className="mt-0.5 text-ink-muted">Pagos registrados</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader
            title="No concretadas"
            subtitle="Más de 18 días desde la solicitud, sin agendar"
            action={
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-warning-bg text-xs font-semibold text-warning">
                {noConcretadas.length}
              </span>
            }
          />
          <ul className="divide-y divide-border">
            {noConcretadas.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/casos/${c.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3 text-sm transition hover:bg-page"
                >
                  <span className="flex items-center gap-2.5 text-ink">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-warning" strokeWidth={2} />
                    <span>
                      {c.paciente_nombre} <span className="text-ink-muted">· {c.paciente_rut}</span>
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted" />
                </Link>
              </li>
            ))}
            {noConcretadas.length === 0 && (
              <li className="px-5 py-6 text-sm text-ink-muted">Sin alertas.</li>
            )}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="Pago pendiente"
            subtitle="Más de 30 días desde la cirugía, sin pago"
            action={
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-critical-bg text-xs font-semibold text-critical">
                {pagoPendiente.length}
              </span>
            }
          />
          <ul className="divide-y divide-border">
            {pagoPendiente.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/casos/${c.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3 text-sm transition hover:bg-page"
                >
                  <span className="flex items-center gap-2.5 text-ink">
                    <CircleDollarSign className="h-4 w-4 shrink-0 text-critical" strokeWidth={2} />
                    <span>
                      {c.paciente_nombre} <span className="text-ink-muted">· {c.paciente_rut}</span>
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted" />
                </Link>
              </li>
            ))}
            {pagoPendiente.length === 0 && (
              <li className="px-5 py-6 text-sm text-ink-muted">Sin alertas.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
