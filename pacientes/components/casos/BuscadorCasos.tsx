"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { CASO_ESTADO_LABEL, type CasoEstado } from "@/lib/types";

const ESTADOS: CasoEstado[] = [
  "solicitud",
  "agendada",
  "operada",
  "alta",
  "no_concretada",
  "cerrada",
];

export default function BuscadorCasos() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const estado = searchParams.get("estado") ?? "";

  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) params.set("q", q);
      else params.delete("q");
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function cambiarEstado(nuevoEstado: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nuevoEstado) params.set("estado", nuevoEstado);
    else params.delete("estado");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o RUT…"
          className="w-64 rounded-lg border border-border-strong bg-surface-raised py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <select
        value={estado}
        onChange={(e) => cambiarEstado(e.target.value)}
        className="rounded-lg border border-border-strong bg-surface-raised px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        <option value="">Todos los estados</option>
        {ESTADOS.map((e) => (
          <option key={e} value={e}>
            {CASO_ESTADO_LABEL[e]}
          </option>
        ))}
      </select>
    </div>
  );
}
