"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  FilePlus2,
  FileScan,
  BookOpen,
  FileStack,
  BarChart3,
  Settings,
} from "lucide-react";
import { clsx } from "@/lib/clsx";

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

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-0.5 px-3">
      {NAV.map((item) => {
        const activo =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
              activo
                ? "bg-brand-100 font-medium text-brand-700"
                : "text-ink-secondary hover:bg-page hover:text-ink"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={activo ? 2.5 : 2} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
