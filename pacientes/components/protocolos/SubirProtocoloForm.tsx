"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { formatearRut } from "@/lib/rut";
import type { ProtocoloExtraido } from "@/lib/anthropic/schemas";
import type { CasoConPaciente } from "@/lib/types";

type Estado = "subiendo" | "confirmando" | "guardando";

export default function SubirProtocoloForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [estado, setEstado] = useState<"idle" | Estado>("idle");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [datos, setDatos] = useState<ProtocoloExtraido | null>(null);
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [rol, setRol] = useState<"cirujano" | "ayudante">("cirujano");
  const [cirujanoPrincipal, setCirujanoPrincipal] = useState<string | null>(null);
  const [casoExistente, setCasoExistente] = useState<CasoConPaciente | null | undefined>(
    undefined
  );

  async function onFile(file: File) {
    setError(null);
    setEstado("subiendo");
    setPreview(URL.createObjectURL(file));

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/ocr/protocolo", { method: "POST", body: form });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "No se pudo procesar la imagen.");
      setEstado("idle");
      return;
    }

    setDatos(data.extracted);
    setStoragePath(data.storage_path);
    setRol(data.rol);
    setCirujanoPrincipal(data.cirujano_principal);

    const matchRes = await fetch("/api/protocolos/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rut: data.extracted.rut }),
    });
    const matchData = await matchRes.json();
    setCasoExistente(matchData.caso ?? null);
    setEstado("confirmando");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!datos) return;
    setEstado("guardando");
    setError(null);

    const form = new FormData(e.currentTarget);
    const fechaCirugia = String(form.get("fecha_cirugia_real") ?? "") || null;
    const numeroIngreso = String(form.get("numero_ingreso") ?? "") || null;
    const clinica = String(form.get("clinica_final") ?? "") || null;
    const rolFinal = (form.get("rol") as "cirujano" | "ayudante") ?? rol;
    const cirujanoPrincipalFinal =
      rolFinal === "ayudante" ? String(form.get("cirujano_principal") ?? "") || null : null;

    let res: Response;
    if (casoExistente) {
      res = await fetch(`/api/casos/${casoExistente.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: "operada",
          rol: rolFinal,
          cirujano_principal: cirujanoPrincipalFinal,
          fecha_cirugia_real: fechaCirugia,
          numero_ingreso: numeroIngreso,
          clinica_final: clinica,
          foto_protocolo_path: storagePath,
        }),
      });
    } else {
      res = await fetch("/api/casos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rut: String(form.get("rut") ?? ""),
          nombre: String(form.get("nombre") ?? ""),
          edad: form.get("edad") ? Number(form.get("edad")) : null,
          telefono: String(form.get("telefono") ?? "") || null,
          email: String(form.get("email") ?? "") || null,
          rol: rolFinal,
          cirujano_principal: cirujanoPrincipalFinal,
          clinica_final: clinica,
          fecha_cirugia_real: fechaCirugia,
          numero_ingreso: numeroIngreso,
          foto_protocolo_path: storagePath,
        }),
      });
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo guardar el caso.");
      setEstado("confirmando");
      return;
    }

    const data = await res.json();
    const casoId = data.caso.id;
    router.push(`/casos/${casoId}`);
    router.refresh();
  }

  if (estado === "idle" || estado === "subiendo") {
    return (
      <div className="space-y-4">
        {error && (
          <p className="rounded-lg bg-critical-bg px-3 py-2 text-sm text-critical">{error}</p>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={estado === "subiendo"}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border-strong bg-surface-raised px-6 py-14 text-center transition hover:border-brand-400 hover:bg-brand-100/30 disabled:opacity-70"
        >
          {estado === "subiendo" ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
              <p className="text-sm font-medium text-ink">Extrayendo datos y buscando coincidencia…</p>
            </>
          ) : (
            <>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <Upload className="h-5 w-5" strokeWidth={2} />
              </span>
              <p className="text-sm font-medium text-ink">Sube la foto del protocolo</p>
              <p className="text-xs text-ink-muted">JPG, PNG o WEBP</p>
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
          }}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {preview && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-raised">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Vista previa del protocolo" className="w-full object-contain" />
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-border bg-surface-raised p-6 shadow-sm">
        {casoExistente ? (
          <div className="flex items-start gap-2 rounded-lg bg-good-bg px-3 py-2 text-sm text-good">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
            <span>
              Caso existente encontrado: <strong>{casoExistente.paciente.nombre}</strong>. Se
              actualizará con estos datos.
            </span>
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-lg bg-warning-bg px-3 py-2 text-sm text-warning">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
            <span>
              No se encontró una solicitud previa para este RUT — se registrará como caso nuevo
              (probable primer ayudante). Revisa los datos del paciente.
            </span>
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-critical-bg px-3 py-2 text-sm text-critical">{error}</p>
        )}

        {!casoExistente && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo label="RUT *">
              <input
                name="rut"
                required
                defaultValue={datos?.rut ?? ""}
                onBlur={(e) => (e.target.value = formatearRut(e.target.value))}
                className="input"
              />
            </Campo>
            <Campo label="Nombre completo *">
              <input name="nombre" required defaultValue={datos?.nombre ?? ""} className="input" />
            </Campo>
            <Campo label="Edad">
              <input
                name="edad"
                type="number"
                min={0}
                defaultValue={datos?.edad ?? ""}
                className="input"
              />
            </Campo>
            <Campo label="Teléfono">
              <input name="telefono" defaultValue={datos?.telefono ?? ""} className="input" />
            </Campo>
            <Campo label="Email">
              <input name="email" type="email" defaultValue={datos?.email ?? ""} className="input" />
            </Campo>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Clínica">
            <input name="clinica_final" defaultValue={datos?.clinica ?? ""} className="input" />
          </Campo>
          <Campo label="Fecha de cirugía">
            <input
              name="fecha_cirugia_real"
              type="date"
              defaultValue={datos?.fecha_cirugia ?? ""}
              className="input"
            />
          </Campo>
          <Campo label="Número de ingreso">
            <input
              name="numero_ingreso"
              defaultValue={datos?.numero_ingreso ?? ""}
              className="input"
            />
          </Campo>
          <Campo label="Rol del Dr. Riera *">
            <select
              name="rol"
              value={rol}
              onChange={(e) => setRol(e.target.value as "cirujano" | "ayudante")}
              className="input"
            >
              <option value="cirujano">Cirujano</option>
              <option value="ayudante">Primer ayudante</option>
            </select>
          </Campo>
          {rol === "ayudante" && (
            <div className="sm:col-span-2">
              <Campo label="Cirujano principal (tratante) *">
                <input
                  name="cirujano_principal"
                  required
                  defaultValue={cirujanoPrincipal ?? datos?.cirujano ?? ""}
                  className="input"
                />
              </Campo>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={estado === "guardando"}
          className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-600 disabled:opacity-60"
        >
          {estado === "guardando"
            ? "Guardando…"
            : casoExistente
              ? "Actualizar caso"
              : "Crear caso"}
        </button>
      </form>

      <style jsx global>{`
        .input {
          margin-top: 0.25rem;
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--color-border-strong);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }
        .input:focus {
          outline: none;
          border-color: var(--color-brand-500);
          box-shadow: 0 0 0 1px var(--color-brand-500);
        }
      `}</style>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-ink-secondary">{label}</label>
      {children}
    </div>
  );
}
