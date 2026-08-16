import Link from "next/link";
import { UserRound } from "lucide-react";
import { crearClienteAdmin } from "@/lib/supabase/server";
import { CASO_ESTADO_LABEL, type CasoEstado } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import BuscadorCasos from "@/components/casos/BuscadorCasos";

export const dynamic = "force-dynamic";

const ESTADO_TONE: Record<CasoEstado, "neutral" | "good" | "warning" | "critical" | "brand"> = {
  solicitud: "brand",
  agendada: "brand",
  operada: "neutral",
  alta: "good",
  no_concretada: "warning",
  cerrada: "good",
};

export default async function CasosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; q?: string }>;
}) {
  const { estado, q } = await searchParams;
  const admin = crearClienteAdmin();

  let pacienteIds: string[] | null = null;
  if (q) {
    const qLimpio = q.replace(/[.\s]/g, "");
    const { data: pacientesMatch } = await admin
      .from("pacientes")
      .select("id")
      .or(`nombre.ilike.%${q}%,rut.ilike.%${qLimpio}%`);
    pacienteIds = (pacientesMatch ?? []).map((p) => p.id);
    if (pacienteIds.length === 0) {
      return (
        <ListadoCasos casos={[]} estado={estado} totalLabel="0 casos" />
      );
    }
  }

  let query = admin
    .from("casos")
    .select("*, paciente:pacientes(*)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (estado) query = query.eq("estado", estado);
  if (pacienteIds) query = query.in("paciente_id", pacienteIds);

  const { data: casos } = await query;

  return (
    <ListadoCasos
      casos={casos ?? []}
      estado={estado}
      totalLabel={`${casos?.length ?? 0} casos${estado ? ` en estado "${CASO_ESTADO_LABEL[estado as CasoEstado]}"` : ""}`}
    />
  );
}

function ListadoCasos({
  casos,
  totalLabel,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  casos: any[];
  estado?: string;
  totalLabel: string;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink">Casos</h1>
          <p className="text-sm text-ink-muted">{totalLabel}</p>
        </div>
        <Link
          href="/casos/nuevo"
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-600"
        >
          + Alta manual
        </Link>
      </div>

      <BuscadorCasos />

      <div className="overflow-hidden rounded-2xl border border-border bg-surface-raised">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-page text-left text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Paciente</th>
              <th className="px-4 py-3 font-medium">RUT</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Clínica</th>
              <th className="px-4 py-3 font-medium">Fecha solicitud</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {casos.map((c) => (
              <tr key={c.id} className="transition hover:bg-page">
                <td className="px-4 py-3">
                  <Link
                    href={`/casos/${c.id}`}
                    className="flex items-center gap-2 font-medium text-ink hover:text-brand-600"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                      <UserRound className="h-3.5 w-3.5" strokeWidth={2} />
                    </span>
                    {c.paciente?.nombre ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-secondary">
                  <Link href={`/pacientes/${c.paciente_id}`} className="hover:text-brand-600 hover:underline">
                    {c.paciente?.rut ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={ESTADO_TONE[c.estado as CasoEstado]}>
                    {CASO_ESTADO_LABEL[c.estado as CasoEstado]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-ink-secondary capitalize">{c.rol}</td>
                <td className="px-4 py-3 text-ink-secondary">
                  {c.clinica_final ?? c.clinica_derivada ?? "—"}
                </td>
                <td className="px-4 py-3 text-ink-secondary">{c.fecha_solicitud ?? "—"}</td>
              </tr>
            ))}
            {casos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-muted">
                  No hay casos que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
