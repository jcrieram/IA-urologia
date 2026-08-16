import { redirect } from "next/navigation";
import { Stethoscope } from "lucide-react";
import { AuthError, requireUser } from "@/lib/auth";
import CerrarSesionBoton from "@/components/dashboard/CerrarSesionBoton";
import { SidebarNav } from "@/components/dashboard/SidebarNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireUser();
  } catch (e) {
    if (e instanceof AuthError) redirect("/login");
    throw e;
  }

  return (
    <div className="min-h-screen bg-page">
      <div className="flex">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-surface-raised md:flex md:flex-col">
          <div className="flex items-center gap-2.5 px-5 py-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
              <Stethoscope className="h-4.5 w-4.5" strokeWidth={2} />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-ink">Pacientes</p>
              <p className="text-xs text-ink-muted">Dr. Riera · Urología</p>
            </div>
          </div>

          <SidebarNav />

          <div className="border-t border-border px-3 py-3">
            <CerrarSesionBoton />
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
