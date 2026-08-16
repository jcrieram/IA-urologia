"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Pago } from "@/lib/types";

export default function RegistrarPagoForm({
  casoId,
  pago,
}: {
  casoId: string;
  pago: Pago | null;
}) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      monto: Number(form.get("monto")),
      fecha_pago: String(form.get("fecha_pago")),
      observaciones: String(form.get("observaciones") ?? "") || null,
    };

    const res = await fetch(`/api/casos/${casoId}/pago`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo registrar el pago.");
      setEnviando(false);
      return;
    }

    setEnviando(false);
    router.refresh();
  }

  if (pago) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
        <p className="font-medium text-emerald-900">Pago registrado</p>
        <p className="mt-1 text-emerald-800">
          ${Number(pago.monto).toLocaleString("es-CL")} · {pago.fecha_pago}
        </p>
        {pago.observaciones && (
          <p className="mt-1 text-emerald-700">{pago.observaciones}</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-900">Registrar pago de la clínica</p>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-600">Monto (CLP)</label>
          <input
            name="monto"
            type="number"
            min={0}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Fecha de pago</label>
          <input
            name="fecha_pago"
            type="date"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600">Observaciones</label>
        <input name="observaciones" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <button
        type="submit"
        disabled={enviando}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {enviando ? "Guardando…" : "Registrar pago"}
      </button>
    </form>
  );
}
