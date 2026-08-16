import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRound } from "lucide-react";
import { crearClienteAdmin } from "@/lib/supabase/server";
import { CASO_ESTADO_LABEL, type CasoEstado } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import RegistrarPagoForm from "@/components/casos/RegistrarPagoForm";
import AccionesEstado from "@/components/casos/AccionesEstado";

export const dynamic = "force-dynamic";

const ESTADO_TONE: Record<CasoEstado, "neutral" | "good" | "warning" | "critical" | "brand"> = {
  solicitud: "brand",
  agendada: "brand",
  operada: "neutral",
  alta: "good",
  no_concretada: "warning",
  cerrada: "good",
};

function Campo({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-0.5 text-sm text-ink">{value ?? "—"}</p>
    </div>
  );
}

export default async function CasoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = crearClienteAdmin();

  const { data: caso } = await admin
    .from("casos")
    .select("*, paciente:pacientes(*), pago:pagos(*), encuesta:encuestas(*)")
    .eq("id", id)
    .maybeSingle();

  if (!caso) notFound();

  const pago = Array.isArray(caso.pago) ? caso.pago[0] ?? null : caso.pago;
  const encuesta = Array.isArray(caso.encuesta) ? caso.encuesta[0] ?? null : caso.encuesta;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/pacientes/${caso.paciente_id}`}
            className="flex items-center gap-2 text-lg font-semibold text-ink hover:text-brand-600"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <UserRound className="h-4 w-4" strokeWidth={2} />
            </span>
            {caso.paciente.nombre}
          </Link>
          <p className="mt-1 text-sm text-ink-muted">{caso.paciente.rut}</p>
        </div>
        <Badge tone={ESTADO_TONE[caso.estado as CasoEstado]}>
          {CASO_ESTADO_LABEL[caso.estado as CasoEstado]}
        </Badge>
      </div>

      <AccionesEstado casoId={caso.id} estado={caso.estado} />

      <Card>
        <CardHeader title="Datos del paciente" />
        <div className="grid grid-cols-2 gap-4 px-5 py-5 sm:grid-cols-3">
          <Campo label="Edad" value={caso.paciente.edad} />
          <Campo label="Teléfono" value={caso.paciente.telefono} />
          <Campo label="Email" value={caso.paciente.email} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Datos de la cirugía" />
        <div className="grid grid-cols-2 gap-4 px-5 py-5 sm:grid-cols-3">
          <Campo label="Rol" value={caso.rol === "cirujano" ? "Cirujano" : "Primer ayudante"} />
          {caso.rol === "ayudante" && (
            <Campo label="Cirujano principal" value={caso.cirujano_principal} />
          )}
          <Campo label="Clínica derivada" value={caso.clinica_derivada} />
          <Campo label="Clínica final" value={caso.clinica_final} />
          <Campo label="Fecha solicitud" value={caso.fecha_solicitud} />
          <Campo label="Fecha cirugía programada" value={caso.fecha_cirugia_programada} />
          <Campo label="Fecha cirugía real" value={caso.fecha_cirugia_real} />
          <Campo label="Número de ingreso" value={caso.numero_ingreso} />
          <Campo label="Fecha de alta" value={caso.fecha_alta} />
        </div>
        {caso.observaciones && (
          <div className="border-t border-border px-5 py-4">
            <Campo label="Observaciones" value={caso.observaciones} />
          </div>
        )}
      </Card>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-ink">Pago (honorario clínica)</h2>
        <RegistrarPagoForm casoId={caso.id} pago={pago} />
      </div>

      <Card>
        <CardHeader title="Encuesta post-alta" />
        <p className="px-5 py-5 text-sm text-ink-muted">
          {encuesta?.respondida_at
            ? `Respondida el ${new Date(encuesta.respondida_at).toLocaleDateString("es-CL")}`
            : encuesta?.enviada_at
              ? "Enviada, esperando respuesta."
              : "Aún no se ha enviado."}
        </p>
      </Card>
    </div>
  );
}
