import Link from "next/link";

export default function Proximamente({
  titulo,
  descripcion,
}: {
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="max-w-xl">
      <h1 className="text-lg font-semibold text-slate-900">{titulo}</h1>
      <p className="mt-2 text-sm text-slate-500">{descripcion}</p>
      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-400">
        Próximamente — mientras tanto usa{" "}
        <Link href="/casos/nuevo" className="text-slate-600 underline underline-offset-2">
          alta manual de caso
        </Link>
        .
      </div>
    </div>
  );
}
