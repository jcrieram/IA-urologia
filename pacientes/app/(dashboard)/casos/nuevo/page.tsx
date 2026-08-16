import NuevoCasoForm from "@/components/casos/NuevoCasoForm";

export default function NuevoCasoPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Alta manual de caso</h1>
        <p className="text-sm text-ink-muted">
          Respaldo sin OCR — úsalo si no tienes la foto de la solicitud a mano.
        </p>
      </div>
      <NuevoCasoForm />
    </div>
  );
}
