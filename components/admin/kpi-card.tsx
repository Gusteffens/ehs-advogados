import { isValidElement } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export type KpiCardTone = "default" | "gold" | "forest" | "alert" | "ink";

export interface KpiCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  deltaPct?: number | null;
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  href?: string;
  tone?: KpiCardTone;
  className?: string;
}

function renderIcon(
  icon: KpiCardProps["icon"],
  tone: KpiCardTone
): React.ReactNode {
  if (!icon) return null;

  const iconClass = cn(
    "h-4 w-4",
    tone === "ink" ? "text-gold" : "text-ink"
  );

  if (isValidElement(icon)) {
    return icon;
  }

  if (typeof icon === "function" || typeof icon === "object") {
    const IconComponent = icon as React.ComponentType<{ className?: string }>;
    return <IconComponent className={iconClass} />;
  }

  return icon;
}

export function KpiCard({
  label,
  value,
  sublabel,
  deltaPct,
  icon,
  href,
  tone = "default",
  className,
}: KpiCardProps) {
  const isInk = tone === "ink";

  const toneStyles: Record<KpiCardTone, string> = {
    default: "bg-white border-forest-200/75 text-ink",
    gold: "bg-gradient-to-br from-white to-champagne-50/70 border-champagne-300/80 text-ink",
    forest: "bg-gradient-to-br from-white to-forest-50/80 border-forest-200 text-ink",
    alert: "bg-gradient-to-br from-white to-amber-50/60 border-amber-200/90 text-ink",
    ink: "bg-ink border-forest-800 text-cream",
  };

  const iconBadgeStyles: Record<KpiCardTone, string> = {
    default: "bg-cream text-ink border border-forest-200/60",
    gold: "bg-champagne-100 text-gold-dark border border-champagne-300/60",
    forest: "bg-forest-100/80 text-forest-800 border border-forest-200/70",
    alert: "bg-amber-100/80 text-amber-800 border border-amber-200",
    ink: "bg-primary text-gold border border-forest-700",
  };

  const hasDelta = typeof deltaPct === "number" && Number.isFinite(deltaPct);
  const roundedDelta = hasDelta ? Math.round(deltaPct * 10) / 10 : 0;

  const content = (
    <div
      className={cn(
        "relative flex h-full flex-col justify-between rounded-2xl border p-5 transition-all duration-200",
        toneStyles[tone],
        href && "group hover:-translate-y-0.5 hover:shadow-md hover:border-gold-dark/50",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.12em]",
            isInk ? "text-cream/65" : "text-forest-600"
          )}
        >
          {label}
        </span>

        {icon && (
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              iconBadgeStyles[tone]
            )}
          >
            {renderIcon(icon, tone)}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p
            className={cn(
              "font-display text-3xl font-bold tracking-tight leading-none",
              isInk ? "text-cream" : "text-ink"
            )}
          >
            {value}
          </p>
          {sublabel && (
            <p
              className={cn(
                "mt-2 text-xs leading-snug",
                isInk ? "text-cream/65" : "text-forest-600"
              )}
            >
              {sublabel}
            </p>
          )}
        </div>

        {hasDelta && (
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-0.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
              roundedDelta > 0 &&
                (isInk
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200/80"),
              roundedDelta < 0 &&
                (isInk
                  ? "bg-red-500/20 text-red-300"
                  : "bg-red-50 text-red-700 border border-red-200/80"),
              roundedDelta === 0 &&
                (isInk
                  ? "bg-forest-800 text-cream/70"
                  : "bg-cream text-forest-700 border border-forest-200/70")
            )}
          >
            {roundedDelta > 0 && <ArrowUpRight className="h-3 w-3" />}
            {roundedDelta < 0 && <ArrowDownRight className="h-3 w-3" />}
            {roundedDelta === 0 && <Minus className="h-3 w-3" />}
            {roundedDelta > 0 ? `+${roundedDelta}%` : `${roundedDelta}%`}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full no-underline">
        {content}
      </Link>
    );
  }

  return content;
}
