import Link from "next/link";
import { notFound } from "next/navigation";
import { Phone, Mail, Cake, Scissors, CircleDollarSign, Clock } from "lucide-react";
import { crearClienteAdmin } from "@/lib/supabase/server";
import { CASO_ESTADO_LABEL, type CasoEstado } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

const ESTADO_TONE: Record<CasoEstado, "neutral" | "good" | "warning" | "critical" | "brand"> = {
  solicitud: "brand",
  agendada: "brand",
  operada: "neutral",
  alta: "good",
  no_concretada: "warning",
  cerrada: "good",
};

export default async function PacienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = crearClienteAdmin();

  const { data: paciente } = await admin
    .from("pacientes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!paciente) notFound();

  const { data: casos } = await admin
    .from("casos")
    .select("*, pago:pagos(*)")
    .eq("paciente_id", id)
    .order("created_at", { ascending: false });

  const todos = casos ?? [];
  const cirugiasRealizadas = todos.filter((c) =>
    ["operada", "alta", "cerrada"].includes(c.estado)
  ).length;

  let totalPagado = 0;
  let casosPendientesPago = 0;
  for (const c of todos) {
    const pago = Array.isArray(c.pago) ? c.pago[0] : c.pago;
    if (pago) {
      totalPagado += Number(pago.monto);
    } else if (["operada", "alta", "cerrada"].includes(c.estado)) {
      casosPendientesPago += 1;
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">{paciente.nombre}</h1>
        <p className="text-sm text-ink-muted">{paciente.rut}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Casos totales" value={todos.length} icon={Clock} />
        <StatTile label="Cirugías realizadas" value={cirugiasRealizadas} icon={Scissors} />
        <StatTile
          label="Total pagado"
          value={`$${totalPagado.toLocaleString("es-CL")}`}
          icon={CircleDollarSign}
          tone="brand"
        />
        <StatTile label="Casos con pago pendiente" value={casosPendientesPago} icon={Clock} />
      </div>

      <Card>
        <CardHeader title="Datos de contacto" />
        <div className="grid grid-cols-1 gap-4 px-5 py-5 text-sm sm:grid-cols-3">
          <div className="flex items-center gap-2 text-ink-secondary">
            <Cake className="h-4 w-4 text-ink-muted" strokeWidth={2} />
            {paciente.edad ? `${paciente.edad} años` : "Edad no registrada"}
          </div>
          <div className="flex items-center gap-2 text-ink-secondary">
            <Phone className="h-4 w-4 text-ink-muted" strokeWidth={2} />
            {paciente.telefono ?? "—"}
          </div>
          <div className="flex items-center gap-2 text-ink-secondary">
            <Mail className="h-4 w-4 text-ink-muted" strokeWidth={2} />
            {paciente.email ?? "—"}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Historial de casos" subtitle={`${todos.length} en total`} />
        <ul className="divide-y divide-border">
          {todos.map((c) => {
            const pago = Array.isArray(c.pago) ? c.pago[0] : c.pago;
            return (
              <li key={c.id}>
                <Link
                  href={`/casos/${c.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-page"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {c.clinica_final ?? c.clinica_derivada ?? "Clínica sin registrar"}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      Solicitud: {c.fecha_solicitud ?? "—"} · Cirugía: {c.fecha_cirugia_real ?? "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={ESTADO_TONE[c.estado as CasoEstado]}>
                      {CASO_ESTADO_LABEL[c.estado as CasoEstado]}
                    </Badge>
                    {pago ? (
                      <Badge tone="good">Pagado</Badge>
                    ) : (
                      <Badge tone="neutral">Sin pago</Badge>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
          {todos.length === 0 && (
            <li className="px-5 py-6 text-sm text-ink-muted">
              Este paciente aún no tiene casos registrados.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}
