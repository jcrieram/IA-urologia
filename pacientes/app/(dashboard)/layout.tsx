import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  FilePlus2,
  FileScan,
  BookOpen,
  FileStack,
  BarChart3,
  Settings,
  Stethoscope,
} from "lucide-react";
import { AuthError, requireUser } from "@/lib/auth";
import CerrarSesionBoton from "@/components/dashboard/CerrarSesionBoton";

const NAV = [
  { href: "/", label: "Resumen", icon: LayoutDashboard },
  { href: "/casos", label: "Casos", icon: ClipboardList },
  { href: "/solicitudes/nueva", label: "Nueva solicitud", icon: FilePlus2 },
  { href: "/protocolos/nuevo", label: "Subir protocolo", icon: FileScan },
  { href: "/catalogo", label: "Catálogo Fonasa", icon: BookOpen },
  { href: "/plantillas", label: "Plantillas", icon: FileStack },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

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
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
              <Stethoscope className="h-4.5 w-4.5" strokeWidth={2} />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-ink">Pacientes</p>
              <p className="text-xs text-ink-muted">Dr. Riera · Urología</p>
            </div>
          </div>

          <nav className="flex-1 space-y-0.5 px-3">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-secondary transition hover:bg-page hover:text-ink"
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border px-3 py-3">
            <CerrarSesionBoton />
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
