"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { formatearRut } from "@/lib/rut";
import type { SolicitudExtraida } from "@/lib/anthropic/schemas";

type Estado = "subiendo" | "confirmando" | "guardando";

export default function SubirSolicitudForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [estado, setEstado] = useState<"idle" | Estado>("idle");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [datos, setDatos] = useState<SolicitudExtraida | null>(null);
  const [storagePath, setStoragePath] = useState<string | null>(null);

  async function onFile(file: File) {
    setError(null);
    setEstado("subiendo");
    setPreview(URL.createObjectURL(file));

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/ocr/solicitud", { method: "POST", body: form });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "No se pudo procesar la imagen.");
      setEstado("idle");
      return;
    }

    setDatos(data.extracted);
    setStoragePath(data.storage_path);
    setEstado("confirmando");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!datos) return;
    setEstado("guardando");
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      rut: String(form.get("rut") ?? ""),
      nombre: String(form.get("nombre") ?? ""),
      edad: form.get("edad") ? Number(form.get("edad")) : null,
      telefono: String(form.get("telefono") ?? "") || null,
      email: String(form.get("email") ?? "") || null,
      rol: "cirujano" as const,
      clinica_derivada: String(form.get("clinica_derivada") ?? "") || null,
      fecha_solicitud: String(form.get("fecha_solicitud") ?? "") || null,
      foto_solicitud_path: storagePath,
    };

    const res = await fetch("/api/casos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo crear el caso.");
      setEstado("confirmando");
      return;
    }

    const { caso } = await res.json();
    router.push(`/casos/${caso.id}`);
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
              <p className="text-sm font-medium text-ink">Extrayendo datos…</p>
              <p className="text-xs text-ink-muted">Esto puede tardar unos segundos.</p>
            </>
          ) : (
            <>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                <Upload className="h-5 w-5" strokeWidth={2} />
              </span>
              <p className="text-sm font-medium text-ink">Sube la foto de la solicitud</p>
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
          <img src={preview} alt="Vista previa de la solicitud" className="w-full object-contain" />
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-border bg-surface-raised p-6 shadow-sm">
        <div className="flex items-center gap-2 rounded-lg bg-brand-100 px-3 py-2 text-sm text-brand-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2} />
          Revisa y corrige los datos antes de guardar.
        </div>

        {error && (
          <p className="rounded-lg bg-critical-bg px-3 py-2 text-sm text-critical">{error}</p>
        )}

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
          <Campo label="Clínica derivada">
            <input
              name="clinica_derivada"
              defaultValue={datos?.clinica_derivada ?? ""}
              className="input"
            />
          </Campo>
          <Campo label="Fecha de solicitud">
            <input
              name="fecha_solicitud"
              type="date"
              defaultValue={datos?.fecha_solicitud ?? ""}
              className="input"
            />
          </Campo>
        </div>

        <button
          type="submit"
          disabled={estado === "guardando"}
          className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-600 disabled:opacity-60"
        >
          {estado === "guardando" ? "Guardando…" : "Crear caso"}
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
