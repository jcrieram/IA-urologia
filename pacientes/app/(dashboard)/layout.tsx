import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError, requireUser } from "@/lib/auth";
import CerrarSesionBoton from "@/components/dashboard/CerrarSesionBoton";

const NAV = [
  { href: "/", label: "Resumen" },
  { href: "/casos", label: "Casos" },
  { href: "/solicitudes/nueva", label: "Nueva solicitud" },
  { href: "/protocolos/nuevo", label: "Subir protocolo" },
  { href: "/catalogo", label: "Catálogo Fonasa" },
  { href: "/plantillas", label: "Plantillas" },
  { href: "/reportes", label: "Reportes" },
  { href: "/configuracion", label: "Configuración" },
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
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white p-4 md:block">
          <p className="mb-6 px-2 text-sm font-semibold text-slate-900">
            Pacientes · Dr. Riera
          </p>
          <nav className="space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 border-t border-slate-200 pt-4">
            <CerrarSesionBoton />
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
