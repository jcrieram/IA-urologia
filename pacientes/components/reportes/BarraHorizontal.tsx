export function BarraHorizontal({
  filas,
}: {
  filas: { etiqueta: string; valor: number }[];
}) {
  const max = Math.max(1, ...filas.map((f) => f.valor));

  if (filas.length === 0) {
    return <p className="px-5 py-6 text-sm text-ink-muted">Sin datos en este período.</p>;
  }

  return (
    <div className="space-y-3 px-5 py-5">
      {filas.map((f) => (
        <div key={f.etiqueta} title={`${f.etiqueta}: ${f.valor}`}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-ink-secondary">{f.etiqueta}</span>
            <span className="tabular-nums font-medium text-ink">{f.valor}</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-page">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-brand-400 to-brand-600"
              style={{ width: `${Math.max(4, (f.valor / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
