"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CasoEstado } from "@/lib/types";

const TRANSICIONES: Partial<Record<CasoEstado, { a: CasoEstado; label: string }[]>> = {
  solicitud: [
    { a: "agendada", label: "Marcar como agendada" },
    { a: "no_concretada", label: "Marcar como no concretada" },
  ],
  agendada: [{ a: "no_concretada", label: "Marcar como no concretada" }],
  operada: [{ a: "alta", label: "Marcar alta post-operatoria" }],
  alta: [{ a: "cerrada", label: "Cerrar caso" }],
};

export default function AccionesEstado({
  casoId,
  estado,
}: {
  casoId: string;
  estado: CasoEstado;
}) {
  const router = useRouter();
  const [cargando, setCargando] = useState<string | null>(null);

  const opciones = TRANSICIONES[estado] ?? [];
  if (opciones.length === 0) return null;

  async function cambiarEstado(nuevoEstado: CasoEstado) {
    setCargando(nuevoEstado);
    await fetch(`/api/casos/${casoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    setCargando(null);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {opciones.map((op) => (
        <button
          key={op.a}
          onClick={() => cambiarEstado(op.a)}
          disabled={cargando !== null}
          className="rounded-lg border border-border-strong bg-surface-raised px-3 py-1.5 text-sm text-ink-secondary shadow-sm hover:bg-page disabled:opacity-60"
        >
          {cargando === op.a ? "Guardando…" : op.label}
        </button>
      ))}
    </div>
  );
}
