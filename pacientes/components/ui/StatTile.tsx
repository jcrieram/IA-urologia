import { clsx } from "@/lib/clsx";
import type { LucideIcon } from "lucide-react";

export function StatTile({
  label,
  value,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  tone?: "neutral" | "brand";
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-raised p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-ink-muted">{label}</p>
        {Icon && (
          <Icon
            className={clsx(
              "h-4 w-4",
              tone === "brand" ? "text-brand-500" : "text-ink-muted"
            )}
            strokeWidth={2}
          />
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}
