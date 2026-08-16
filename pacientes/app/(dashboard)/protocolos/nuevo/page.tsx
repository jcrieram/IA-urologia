import SubirProtocoloForm from "@/components/protocolos/SubirProtocoloForm";

export default function NuevoProtocoloPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Subir protocolo</h1>
        <p className="text-sm text-ink-muted">
          Si el paciente ya tiene una solicitud, se completa su ficha; si no, se registra como
          caso de primer ayudante.
        </p>
      </div>
      <SubirProtocoloForm />
    </div>
  );
}
