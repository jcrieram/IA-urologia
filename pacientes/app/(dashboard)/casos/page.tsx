import Link from "next/link";
import { crearClienteAdmin } from "@/lib/supabase/server";
import { CASO_ESTADO_LABEL } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CasosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; q?: string }>;
}) {
  const { estado, q } = await searchParams;
  const admin = crearClienteAdmin();

  let query = admin
    .from("casos")
    .select("*, paciente:pacientes(*)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (estado) query = query.eq("estado", estado);
  if (q) query = query.ilike("paciente.nombre", `%${q}%`);

  const { data: casos } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Casos</h1>
          <p className="text-sm text-slate-500">
            {casos?.length ?? 0} casos {estado ? `en estado "${CASO_ESTADO_LABEL[estado as keyof typeof CASO_ESTADO_LABEL]}"` : ""}
          </p>
        </div>
        <Link
          href="/casos/nuevo"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Alta manual
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Paciente</th>
              <th className="px-4 py-3">RUT</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Clínica</th>
              <th className="px-4 py-3">Fecha solicitud</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(casos ?? []).map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/casos/${c.id}`} className="font-medium text-slate-900 hover:underline">
                    {c.paciente?.nombre ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-500">{c.paciente?.rut ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                    {CASO_ESTADO_LABEL[c.estado as keyof typeof CASO_ESTADO_LABEL]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 capitalize">{c.rol}</td>
                <td className="px-4 py-3 text-slate-500">
                  {c.clinica_final ?? c.clinica_derivada ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {c.fecha_solicitud ?? "—"}
                </td>
              </tr>
            ))}
            {(casos ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No hay casos todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
