"use client";

import { useState } from "react";
import { Stethoscope } from "lucide-react";
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-900 px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60rem 40rem at 20% -10%, rgba(61,142,229,0.35), transparent 60%), radial-gradient(50rem 35rem at 100% 110%, rgba(42,120,214,0.25), transparent 55%)",
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5 text-brand-100">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
            <Stethoscope className="h-5 w-5" strokeWidth={2} />
          </span>
          <span className="text-sm font-medium tracking-wide">
            Dr. Juan Carlos Riera · Urología
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-surface-raised p-8 shadow-xl">
          <h1 className="text-xl font-semibold text-ink">
            Gestión de pacientes quirúrgicos
          </h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            Acceso restringido al equipo del Dr. Riera.
          </p>

          <button
            onClick={ingresarConGoogle}
            disabled={cargando}
            className="mt-7 flex w-full items-center justify-center gap-2.5 rounded-xl border border-border-strong bg-white px-4 py-2.5 text-sm font-medium text-ink shadow-sm transition hover:bg-page disabled:opacity-60"
          >
            <GoogleIcon className="h-4 w-4" />
            {cargando ? "Redirigiendo…" : "Ingresar con Google"}
          </button>

          {error && (
            <p className="mt-4 rounded-lg bg-critical-bg px-3 py-2 text-sm text-critical">
              No se pudo iniciar sesión: {error}
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-brand-200">
          Plataforma interna — no compartir este enlace.
        </p>
      </div>
    </main>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0012 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09A6.6 6.6 0 015.5 12c0-.73.13-1.43.34-2.09V7.06H2.18A11 11 0 001 12c0 1.77.43 3.45 1.18 4.94l3.66-2.85z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
