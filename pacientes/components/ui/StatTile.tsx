import { clsx } from "@/lib/clsx";
import type { LucideIcon } from "lucide-react";

export type StatColor =
  | "brand"
  | "orange"
  | "aqua"
  | "magenta"
  | "violet"
  | "good"
  | "warning"
  | "neutral";

const CHIP_CLASSES: Record<StatColor, string> = {
  brand: "bg-brand-100 text-brand-700",
  orange: "bg-cat-orange-bg text-cat-orange",
  aqua: "bg-cat-aqua-bg text-cat-aqua",
  magenta: "bg-cat-magenta-bg text-cat-magenta",
  violet: "bg-cat-violet-bg text-cat-violet",
  good: "bg-good-bg text-good",
  warning: "bg-warning-bg text-warning",
  neutral: "bg-page text-ink-muted",
};

export function StatTile({
  label,
  value,
  icon: Icon,
  color = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  color?: StatColor;
}) {
  return (
    <div className="group rounded-2xl border border-border bg-surface-raised p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-ink-muted">{label}</p>
        {Icon && (
          <span
            className={clsx(
              "flex h-8 w-8 items-center justify-center rounded-xl transition group-hover:scale-105",
              CHIP_CLASSES[color]
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={2.25} />
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}
