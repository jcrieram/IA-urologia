import SubirSolicitudForm from "@/components/solicitudes/SubirSolicitudForm";

export default function NuevaSolicitudPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Nueva solicitud</h1>
        <p className="text-sm text-ink-muted">
          Sube la foto de la solicitud de cirugía — el sistema extrae los datos automáticamente.
        </p>
      </div>
      <SubirSolicitudForm />
    </div>
  );
}
