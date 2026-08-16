"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "@/lib/clsx";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-0.5 px-3">
      {items.map((item) => {
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
