import { Scissors, CircleDollarSign, Clock, Stethoscope } from "lucide-react";
import { crearClienteAdmin } from "@/lib/supabase/server";
import { calcularRango, tendenciaMensual, type RangoReporte } from "@/lib/reportes";
import { StatTile } from "@/components/ui/StatTile";
import { Card, CardHeader } from "@/components/ui/Card";
import { BarraHorizontal } from "@/components/reportes/BarraHorizontal";
import { TendenciaMensual } from "@/components/reportes/TendenciaMensual";
import RangoFiltro from "@/components/reportes/RangoFiltro";

export const dynamic = "force-dynamic";

const ESTADOS_REALIZADOS = ["operada", "alta", "cerrada"];

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ rango?: string }>;
}) {
  const { rango: rangoParam } = await searchParams;
  const rango = (rangoParam as RangoReporte) ?? "mes";
  const { desde } = calcularRango(rango);

  const admin = crearClienteAdmin();

  let query = admin
    .from("casos")
    .select("id, rol, clinica_final, clinica_derivada, fecha_cirugia_real, pago:pagos(monto)")
    .in("estado", ESTADOS_REALIZADOS)
    .not("fecha_cirugia_real", "is", null);

  if (desde) query = query.gte("fecha_cirugia_real", desde);

  const { data: casosRango } = await query;
  const casos = casosRango ?? [];

  let pagosRecibidos = 0;
  let casosPendientes = 0;
  const porRol: Record<string, number> = { cirujano: 0, ayudante: 0 };
  const porClinicaMap = new Map<string, number>();

  for (const c of casos) {
    porRol[c.rol] = (porRol[c.rol] ?? 0) + 1;
    const clinica = c.clinica_final ?? c.clinica_derivada ?? "Sin registrar";
    porClinicaMap.set(clinica, (porClinicaMap.get(clinica) ?? 0) + 1);

    const pago = Array.isArray(c.pago) ? c.pago[0] : c.pago;
    if (pago) pagosRecibidos += Number(pago.monto);
    else casosPendientes += 1;
  }

  const porClinica = Array.from(porClinicaMap.entries())
    .map(([etiqueta, valor]) => ({ etiqueta, valor }))
    .sort((a, b) => b.valor - a.valor);

  // Tendencia: siempre ultimos 12 meses, independiente del filtro de KPIs.
  const { data: todosCasos } = await admin
    .from("casos")
    .select("fecha_cirugia_real")
    .in("estado", ESTADOS_REALIZADOS)
    .not("fecha_cirugia_real", "is", null);

  const fechas = (todosCasos ?? []).map((c) => c.fecha_cirugia_real as string);
  const meses = tendenciaMensual(fechas, 12);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">Reportes</h1>
          <p className="text-sm text-ink-muted">
            {rango === "mes" ? "Mes actual" : rango === "anio" ? "Año actual" : "Histórico completo"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RangoFiltro />
          <a
            href={`/api/reportes/mensual?rango=${rango}&formato=csv`}
            className="rounded-lg border border-border-strong bg-surface-raised px-4 py-2 text-sm font-medium text-ink-secondary shadow-sm hover:bg-page"
          >
            Exportar CSV
          </a>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Cirugías realizadas" value={casos.length} icon={Scissors} tone="brand" />
        <StatTile
          label="Pagos recibidos"
          value={`$${pagosRecibidos.toLocaleString("es-CL")}`}
          icon={CircleDollarSign}
        />
        <StatTile label="Casos con pago pendiente" value={casosPendientes} icon={Clock} />
        <StatTile
          label="Como cirujano / ayudante"
          value={`${porRol.cirujano ?? 0} / ${porRol.ayudante ?? 0}`}
          icon={Stethoscope}
        />
      </section>

      <Card>
        <CardHeader title="Tendencia mensual" subtitle="Cirugías realizadas — últimos 12 meses" />
        <TendenciaMensual meses={meses} />
      </Card>

      <Card>
        <CardHeader title="Cirugías por clínica" subtitle="En el período seleccionado" />
        <BarraHorizontal filas={porClinica} />
      </Card>
    </div>
  );
}
