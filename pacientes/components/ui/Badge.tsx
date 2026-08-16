import { clsx } from "@/lib/clsx";
import type { LucideIcon } from "lucide-react";

type Tone = "neutral" | "good" | "warning" | "critical" | "brand";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-page text-ink-secondary border-border",
  good: "bg-good-bg text-good border-good/20",
  warning: "bg-warning-bg text-warning border-warning/20",
  critical: "bg-critical-bg text-critical border-critical/20",
  brand: "bg-brand-100 text-brand-700 border-brand-200",
};

/**
 * Status badge: always icon + label, never color alone — warning/serious/critical
 * fall below 3:1 contrast on light surfaces by design, so meaning can't ride on hue.
 */
export function Badge({
  children,
  tone = "neutral",
  icon: Icon,
}: {
  children: React.ReactNode;
  tone?: Tone;
  icon?: LucideIcon;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        TONE_CLASSES[tone]
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />}
      {children}
    </span>
  );
}
