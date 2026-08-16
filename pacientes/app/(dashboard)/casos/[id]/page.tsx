import { notFound } from "next/navigation";
import { crearClienteAdmin } from "@/lib/supabase/server";
import { CASO_ESTADO_LABEL } from "@/lib/types";
import RegistrarPagoForm from "@/components/casos/RegistrarPagoForm";
import AccionesEstado from "@/components/casos/AccionesEstado";

export const dynamic = "force-dynamic";

function Campo({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm text-slate-900">{value ?? "—"}</p>
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
          <h1 className="text-lg font-semibold text-slate-900">{caso.paciente.nombre}</h1>
          <p className="text-sm text-slate-500">{caso.paciente.rut}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
          {CASO_ESTADO_LABEL[caso.estado as keyof typeof CASO_ESTADO_LABEL]}
        </span>
      </div>

      <AccionesEstado casoId={caso.id} estado={caso.estado} />

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Datos del paciente</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Campo label="Edad" value={caso.paciente.edad} />
          <Campo label="Teléfono" value={caso.paciente.telefono} />
          <Campo label="Email" value={caso.paciente.email} />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Datos de la cirugía</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
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
          <div className="mt-4">
            <Campo label="Observaciones" value={caso.observaciones} />
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-900">Pago (honorario clínica)</h2>
        <RegistrarPagoForm casoId={caso.id} pago={pago} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-2 text-sm font-semibold text-slate-900">Encuesta post-alta</h2>
        <p className="text-sm text-slate-500">
          {encuesta?.respondida_at
            ? `Respondida el ${new Date(encuesta.respondida_at).toLocaleDateString("es-CL")}`
            : encuesta?.enviada_at
              ? "Enviada, esperando respuesta."
              : "Aún no se ha enviado."}
        </p>
      </section>
    </div>
  );
}
