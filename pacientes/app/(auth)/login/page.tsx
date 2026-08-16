"use client";

import { useState } from "react";
import { crearClienteNavegador } from "@/lib/supabase/client";

export default function LoginPage() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ingresarConGoogle() {
    setCargando(true);
    setError(null);
    const supabase = crearClienteNavegador();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setCargando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Gestión de pacientes quirúrgicos
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Acceso restringido al equipo del Dr. Riera.
        </p>

        <button
          onClick={ingresarConGoogle}
          disabled={cargando}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          {cargando ? "Redirigiendo…" : "Ingresar con Google"}
        </button>

        {error && (
          <p className="mt-4 text-sm text-red-600">
            No se pudo iniciar sesión: {error}
          </p>
        )}
      </div>
    </main>
  );
}
