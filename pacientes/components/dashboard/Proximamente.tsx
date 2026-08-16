import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Proximamente({
  titulo,
  descripcion,
}: {
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold text-ink">{titulo}</h1>
      <p className="mt-2 text-sm text-ink-muted">{descripcion}</p>
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-dashed border-border-strong bg-surface-raised p-6 text-sm text-ink-muted">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" strokeWidth={2} />
        <p>
          Próximamente — mientras tanto usa{" "}
          <Link href="/casos/nuevo" className="text-brand-600 underline underline-offset-2">
            alta manual de caso
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
