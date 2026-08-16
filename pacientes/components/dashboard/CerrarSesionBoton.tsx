"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
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
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-ink-muted transition hover:bg-page hover:text-ink"
    >
      <LogOut className="h-4 w-4" strokeWidth={2} />
      Cerrar sesión
    </button>
  );
}
