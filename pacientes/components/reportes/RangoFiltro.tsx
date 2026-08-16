"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { clsx } from "@/lib/clsx";

const OPCIONES = [
  { valor: "mes", label: "Mes actual" },
  { valor: "anio", label: "Año actual" },
  { valor: "todo", label: "Todo" },
] as const;

export default function RangoFiltro() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rango = searchParams.get("rango") ?? "mes";

  function elegir(valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("rango", valor);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="inline-flex rounded-lg border border-border-strong bg-surface-raised p-1">
      {OPCIONES.map((op) => (
        <button
          key={op.valor}
          onClick={() => elegir(op.valor)}
          className={clsx(
            "rounded-md px-3 py-1.5 text-sm font-medium transition",
            rango === op.valor
              ? "bg-brand-500 text-white"
              : "text-ink-secondary hover:bg-page"
          )}
        >
          {op.label}
        </button>
      ))}
    </div>
  );
}
