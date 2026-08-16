export function TendenciaMensual({
  meses,
}: {
  meses: { etiqueta: string; valor: number }[];
}) {
  const max = Math.max(1, ...meses.map((m) => m.valor));

  if (meses.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">Sin datos en este período.</p>;
  }

  return (
    <div className="px-5 py-5">
      <div className="flex h-40 items-end gap-2">
        {meses.map((m) => (
          <div
            key={m.etiqueta}
            className="group flex flex-1 flex-col items-center justify-end gap-2"
            title={`${m.etiqueta}: ${m.valor}`}
          >
            <span className="text-xs font-medium tabular-nums text-ink-secondary opacity-0 transition group-hover:opacity-100">
              {m.valor}
            </span>
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400 transition group-hover:from-brand-700 group-hover:to-brand-500"
              style={{ height: `${Math.max(3, (m.valor / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        {meses.map((m) => (
          <div key={m.etiqueta} className="flex-1 text-center text-xs text-ink-muted">
            {m.etiqueta}
          </div>
        ))}
      </div>
    </div>
  );
}
