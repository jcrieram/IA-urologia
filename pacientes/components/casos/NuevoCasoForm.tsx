"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatearRut } from "@/lib/rut";

export default function NuevoCasoForm() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rol, setRol] = useState<"cirujano" | "ayudante">("cirujano");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      rut: String(form.get("rut") ?? ""),
      nombre: String(form.get("nombre") ?? ""),
      edad: form.get("edad") ? Number(form.get("edad")) : null,
      telefono: String(form.get("telefono") ?? "") || null,
      email: String(form.get("email") ?? "") || null,
      rol,
      cirujano_principal: String(form.get("cirujano_principal") ?? "") || null,
      clinica_derivada: String(form.get("clinica_derivada") ?? "") || null,
      fecha_solicitud: String(form.get("fecha_solicitud") ?? "") || null,
      observaciones: String(form.get("observaciones") ?? "") || null,
    };

    const res = await fetch("/api/casos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo crear el caso.");
      setEnviando(false);
      return;
    }

    const { caso } = await res.json();
    router.push(`/casos/${caso.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-border bg-surface-raised p-6 shadow-sm">
      {error && (
        <p className="rounded-lg bg-critical-bg px-3 py-2 text-sm text-critical">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-ink-secondary">RUT *</label>
          <input
            name="rut"
            required
            placeholder="12.345.678-9"
            onBlur={(e) => (e.target.value = formatearRut(e.target.value))}
            className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-secondary">Nombre completo *</label>
          <input name="nombre" required className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-secondary">Edad</label>
          <input name="edad" type="number" min={0} className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-secondary">Teléfono</label>
          <input name="telefono" className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-secondary">Email</label>
          <input name="email" type="email" className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-secondary">Clínica derivada</label>
          <input name="clinica_derivada" className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-secondary">Fecha de solicitud</label>
          <input name="fecha_solicitud" type="date" className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-secondary">Rol del Dr. Riera *</label>
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value as "cirujano" | "ayudante")}
            className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="cirujano">Cirujano</option>
            <option value="ayudante">Primer ayudante</option>
          </select>
        </div>
        {rol === "ayudante" && (
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-ink-secondary">
              Cirujano principal (tratante) *
            </label>
            <input
              name="cirujano_principal"
              required
              className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        )}
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-ink-secondary">Observaciones</label>
          <textarea name="observaciones" rows={2} className="mt-1 w-full rounded-lg border border-border-strong px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
        </div>
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-600 disabled:opacity-60"
      >
        {enviando ? "Guardando…" : "Crear caso"}
      </button>
    </form>
  );
}
