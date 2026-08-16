"use client";

import { useRouter } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";

export default function CerrarSesionBoton() {
  const router = useRouter();

  async function cerrarSesion() {
    const supabase = crearClienteNavegador();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={cerrarSesion}
      className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
    >
      Cerrar sesión
    </button>
  );
}
