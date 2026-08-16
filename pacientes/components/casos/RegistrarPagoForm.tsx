"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
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
      <div className="flex items-start gap-3 rounded-2xl border border-good/20 bg-good-bg p-4 text-sm">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-good" strokeWidth={2} />
        <div>
          <p className="font-medium text-good">Pago registrado</p>
          <p className="mt-1 text-ink-secondary">
            ${Number(pago.monto).toLocaleString("es-CL")} · {pago.fecha_pago}
          </p>
          {pago.observaciones && (
            <p className="mt-1 text-ink-muted">{pago.observaciones}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-border bg-surface-raised p-4">
      <p className="text-sm font-semibold text-ink">Registrar pago de la clínica</p>
      {error && <p className="rounded-lg bg-critical-bg px-3 py-2 text-sm text-critical">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-ink-secondary">Monto (CLP)</label>
          <input
            name="monto"
            type="number"
            min={0}
            required
            className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ink-secondary">Fecha de pago</label>
          <input
            name="fecha_pago"
            type="date"
            required
            className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-ink-secondary">Observaciones</label>
        <input
          name="observaciones"
          className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <button
        type="submit"
        disabled={enviando}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-600 disabled:opacity-60"
      >
        {enviando ? "Guardando…" : "Registrar pago"}
      </button>
    </form>
  );
}
