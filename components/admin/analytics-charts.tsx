"use client";

import { useId, useMemo, useState } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AnalyticsTimeseriesPoint,
  BreakdownItem,
  ScrollFunnel,
} from "@/types/analytics";

const NUMBER_FORMATTER = new Intl.NumberFormat("pt-BR");

export function formatNumber(n: number): string {
  return NUMBER_FORMATTER.format(Math.round(n));
}

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  if (safe < 60) return `${safe}s`;
  const mins = Math.floor(safe / 60);
  const rem = safe % 60;
  return rem === 0 ? `${mins}m` : `${mins}m ${rem}s`;
}

function formatShortDate(isoDate: string): string {
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}`;
}

function formatLongDate(isoDate: string): string {
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const date = new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2])
  );
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const SOURCE_LABELS: Record<string, string> = {
  direct: "Acesso Direto",
  organic: "Busca Orgânica",
  social: "Redes Sociais",
  referral: "Referência Externa",
  campaign: "Campanhas / UTM",
  internal: "Navegação Interna",
};

const EVENT_LABELS: Record<string, string> = {
  share_whatsapp: "Compartilhar · WhatsApp",
  share_linkedin: "Compartilhar · LinkedIn",
  share_copy: "Copiar Link do Artigo",
  cta_whatsapp: "CTA · WhatsApp",
  cta_primary: "CTA · Contato / Consulta",
  related_click: "Clique em Artigo Relacionado",
};

const DEVICE_LABELS: Record<string, string> = {
  desktop: "Desktop",
  mobile: "Mobile",
  tablet: "Tablet",
};

export function translateBreakdownLabel(
  label: string,
  kind: "source" | "event" | "device" | "raw"
): string {
  const key = label.trim().toLowerCase();
  if (kind === "source") return SOURCE_LABELS[key] ?? label;
  if (kind === "event") return EVENT_LABELS[key] ?? label;
  if (kind === "device") return DEVICE_LABELS[key] ?? label;
  return label;
}

/* ───────────────────────────────────────────────────────────────────────────
 * 1. Dual-Series Daily Area / Line Chart (Views Únicas vs Impressões Brutas)
 * ─────────────────────────────────────────────────────────────────────────── */

interface TrafficTrendChartProps {
  data: AnalyticsTimeseriesPoint[];
  height?: number;
  compact?: boolean;
}

const COMPACT_PADDING = { top: 16, right: 16, bottom: 28, left: 40 } as const;
const DEFAULT_PADDING = { top: 20, right: 20, bottom: 34, left: 46 } as const;

export function TrafficTrendChart({
  data,
  height = 280,
  compact = false,
}: TrafficTrendChartProps) {
  const uniqueGradId = useId();
  const rawGradId = useId();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showRaw, setShowRaw] = useState(true);

  const width = 760;
  const padding = compact ? COMPACT_PADDING : DEFAULT_PADDING;
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const { maxVal, yTicks, xTickIndices, uniquePoints, rawPoints, hasAnyData } =
    useMemo(() => {
      if (data.length === 0) {
        return {
          maxVal: 10,
          yTicks: [0, 5, 10],
          xTickIndices: [] as number[],
          uniquePoints: [] as Array<{ x: number; y: number }>,
          rawPoints: [] as Array<{ x: number; y: number }>,
          hasAnyData: false,
        };
      }

      let peak = 0;
      for (const pt of data) {
        peak = Math.max(peak, pt.uniqueViews, showRaw ? pt.rawViews : 0);
      }

      const hasData = peak > 0;
      const niceMax = peak === 0 ? 4 : Math.ceil(peak * 1.15);
      const step = Math.max(1, Math.ceil(niceMax / 4));
      const top = step * 4;
      const ticks = [0, step, step * 2, step * 3, top];

      const n = data.length;
      const getX = (idx: number) =>
        n === 1 ? padding.left + plotW / 2 : padding.left + (idx / (n - 1)) * plotW;
      const getY = (val: number) =>
        padding.top + plotH - (Math.min(val, top) / top) * plotH;

      const uPts = data.map((pt, i) => ({ x: getX(i), y: getY(pt.uniqueViews) }));
      const rPts = data.map((pt, i) => ({ x: getX(i), y: getY(pt.rawViews) }));

      const desiredTicks = compact ? 5 : 7;
      const tickStep = Math.max(1, Math.ceil((n - 1) / Math.max(1, desiredTicks - 1)));
      const indices: number[] = [];
      for (let i = 0; i < n; i += tickStep) {
        indices.push(i);
      }
      if (n > 1 && indices[indices.length - 1] !== n - 1) {
        indices.push(n - 1);
      }

      return {
        maxVal: top,
        yTicks: ticks,
        xTickIndices: indices,
        uniquePoints: uPts,
        rawPoints: rPts,
        hasAnyData: hasData,
      };
    }, [data, showRaw, plotW, plotH, padding, compact]);

  const buildLinePath = (pts: Array<{ x: number; y: number }>) => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    return pts
      .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");
  };

  const buildAreaPath = (pts: Array<{ x: number; y: number }>) => {
    if (pts.length < 2) return "";
    const baseline = padding.top + plotH;
    const line = buildLinePath(pts);
    const last = pts[pts.length - 1];
    const first = pts[0];
    return `${line} L ${last.x.toFixed(1)} ${baseline.toFixed(1)} L ${first.x.toFixed(1)} ${baseline.toFixed(1)} Z`;
  };

  const activeIndex =
    hoveredIndex !== null && hoveredIndex >= 0 && hoveredIndex < data.length
      ? hoveredIndex
      : null;
  const activeDatum = activeIndex !== null ? data[activeIndex] : null;
  const activeUniquePt = activeIndex !== null ? uniquePoints[activeIndex] : null;
  const activeRawPt = activeIndex !== null ? rawPoints[activeIndex] : null;

  const dedupPctForActive =
    activeDatum && activeDatum.rawViews > 0
      ? Math.max(
          0,
          Math.round(
            ((activeDatum.rawViews - activeDatum.uniqueViews) /
              activeDatum.rawViews) *
              100
          )
        )
      : 0;

  return (
    <div className="space-y-3">
      {/* Legend & Series Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-2 font-medium text-ink">
            <span className="h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-primary/20" />
            Views Únicas
          </span>
          <button
            type="button"
            onClick={() => setShowRaw((prev) => !prev)}
            className={cn(
              "inline-flex items-center gap-2 font-medium transition-opacity cursor-pointer",
              showRaw ? "text-gold-dark opacity-100" : "text-forest-400 opacity-60 line-through"
            )}
          >
            <span className="h-0.5 w-3.5 border-t-2 border-dashed border-gold-dark" />
            Impressões Brutas
          </button>
        </div>

        {!hasAnyData && (
          <span className="text-[11px] text-forest-500 italic">
            Sem visualizações registradas neste período
          </span>
        )}
      </div>

      {/* Responsive SVG Container */}
      <div
        className="relative w-full select-none"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
          role="img"
          aria-label="Gráfico diário de views únicas versus impressões brutas"
        >
          <defs>
            <linearGradient id={uniqueGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1B2D1E" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#1B2D1E" stopOpacity="0.01" />
            </linearGradient>
            <linearGradient id={rawGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#877249" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#877249" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal gridlines + Y labels */}
          {yTicks.map((tick) => {
            const y = padding.top + plotH - (tick / maxVal) * plotH;
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={y}
                  y2={y}
                  stroke={tick === 0 ? "#BDCEBE" : "#DCE5DC"}
                  strokeDasharray={tick === 0 ? undefined : "3 4"}
                  strokeWidth={1}
                />
                <text
                  x={padding.left - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-forest-600 text-[10px] font-medium"
                >
                  {formatNumber(tick)}
                </text>
              </g>
            );
          })}

          {/* X axis labels */}
          {xTickIndices.map((idx) => {
            const pt = uniquePoints[idx];
            if (!pt) return null;
            return (
              <text
                key={idx}
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                className="fill-forest-600 text-[10px] font-medium"
              >
                {formatShortDate(data[idx].date)}
              </text>
            );
          })}

          {/* Raw Impressions Area + Dashed Line */}
          {showRaw && rawPoints.length >= 2 && (
            <path d={buildAreaPath(rawPoints)} fill={`url(#${rawGradId})`} />
          )}
          {showRaw && rawPoints.length > 0 && (
            <path
              d={buildLinePath(rawPoints)}
              fill="none"
              stroke="#877249"
              strokeWidth={1.8}
              strokeDasharray="5 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Unique Views Area + Solid Line */}
          {uniquePoints.length >= 2 && (
            <path d={buildAreaPath(uniquePoints)} fill={`url(#${uniqueGradId})`} />
          )}
          {uniquePoints.length > 0 && (
            <path
              d={buildLinePath(uniquePoints)}
              fill="none"
              stroke="#1B2D1E"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Hover Crosshair & Active Markers */}
          {activeUniquePt && (
            <g className="pointer-events-none">
              <line
                x1={activeUniquePt.x}
                x2={activeUniquePt.x}
                y1={padding.top}
                y2={padding.top + plotH}
                stroke="#877249"
                strokeWidth={1}
                strokeDasharray="2 3"
              />
              {showRaw && activeRawPt && (
                <circle
                  cx={activeRawPt.x}
                  cy={activeRawPt.y}
                  r={4.5}
                  fill="#F9F8F5"
                  stroke="#877249"
                  strokeWidth={2}
                />
              )}
              <circle
                cx={activeUniquePt.x}
                cy={activeUniquePt.y}
                r={5.5}
                fill="#1B2D1E"
                stroke="#E8D49A"
                strokeWidth={2}
              />
            </g>
          )}

          {/* Invisible Interactive Hit Columns */}
          {data.map((pt, idx) => {
            const currX = uniquePoints[idx]?.x ?? padding.left;
            const prevX = idx > 0 ? uniquePoints[idx - 1].x : padding.left;
            const nextX =
              idx < data.length - 1
                ? uniquePoints[idx + 1].x
                : width - padding.right;
            const colLeft = idx === 0 ? padding.left : (prevX + currX) / 2;
            const colRight =
              idx === data.length - 1
                ? width - padding.right
                : (currX + nextX) / 2;

            return (
              <rect
                key={pt.date}
                x={colLeft}
                y={padding.top}
                width={Math.max(4, colRight - colLeft)}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(idx)}
                onClick={() => setHoveredIndex(idx)}
                className="cursor-crosshair"
              />
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {activeDatum && activeUniquePt && (
          <div
            style={{
              left: `${Math.min(Math.max((activeUniquePt.x / width) * 100, 14), 86)}%`,
            }}
            className="pointer-events-none absolute top-2 -translate-x-1/2 z-20 w-52 rounded-xl border border-gold/30 bg-ink/95 px-3.5 py-2.5 text-xs text-cream shadow-xl backdrop-blur-sm"
          >
            <p className="font-display text-sm font-bold text-gold mb-1.5">
              {formatLongDate(activeDatum.date)}
            </p>
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-cream/75">Views Únicas</span>
                <span className="font-semibold text-cream">
                  {formatNumber(activeDatum.uniqueViews)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-cream/75">Impressões Brutas</span>
                <span className="font-semibold text-gold">
                  {formatNumber(activeDatum.rawViews)}
                </span>
              </div>
              {activeDatum.ctaClicks > 0 && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-cream/75">Cliques em CTA</span>
                  <span className="font-semibold text-emerald-300">
                    {formatNumber(activeDatum.ctaClicks)}
                  </span>
                </div>
              )}
              {dedupPctForActive > 0 && (
                <div className="mt-1.5 border-t border-white/10 pt-1.5 text-[10px] text-gold/90">
                  {dedupPctForActive}% de repetições filtradas
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 2. Scroll-Depth Funnel Chart (25% / 50% / 75% / 100%)
 * ─────────────────────────────────────────────────────────────────────────── */

export function ScrollFunnelChart({ funnel }: { funnel: ScrollFunnel }) {
  const steps = [
    {
      label: "25% do artigo",
      hint: "Início da leitura",
      pct: Math.min(100, Math.max(0, Math.round(funnel.reached25Pct))),
      barClass: "bg-primary",
    },
    {
      label: "50% do artigo",
      hint: "Meio da leitura",
      pct: Math.min(100, Math.max(0, Math.round(funnel.reached50Pct))),
      barClass: "bg-forest-700",
    },
    {
      label: "75% do artigo",
      hint: "Leitura concluída",
      pct: Math.min(100, Math.max(0, Math.round(funnel.reached75Pct))),
      barClass: "bg-forest-500",
    },
    {
      label: "100% do artigo",
      hint: "Chegou ao rodapé",
      pct: Math.min(100, Math.max(0, Math.round(funnel.reached100Pct))),
      barClass: "bg-gold-dark",
    },
  ];

  const allZero = steps.every((s) => s.pct === 0);

  return (
    <div className="space-y-3.5">
      {steps.map((step) => (
        <div key={step.label} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ink">{step.label}</span>
              <span className="text-[11px] text-forest-500 hidden sm:inline">
                {step.hint}
              </span>
            </div>
            <span className="font-display text-base font-bold text-ink">
              {step.pct}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-cream border border-forest-100/80">
            <div
              style={{ width: `${step.pct}%` }}
              className={cn(
                "h-full rounded-full transition-all duration-500",
                step.barClass
              )}
            />
          </div>
        </div>
      ))}

      {allZero && (
        <p className="pt-1 text-xs text-forest-500 italic">
          Ainda não há sessões engajadas suficientes para calcular o funil de rolagem.
        </p>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 3. Reusable Breakdown Horizontal Bar List (Sources / Referrers / Events)
 * ─────────────────────────────────────────────────────────────────────────── */

interface BreakdownBarListProps {
  items: BreakdownItem[];
  kind?: "source" | "event" | "device" | "raw";
  emptyMessage?: string;
  accent?: "forest" | "gold";
}

export function BreakdownBarList({
  items,
  kind = "raw",
  emptyMessage = "Sem dados registrados neste período.",
  accent = "forest",
}: BreakdownBarListProps) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-forest-500 italic">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const displayLabel = translateBreakdownLabel(item.label, kind);
        const pct = Math.min(100, Math.max(0, Math.round(item.pct)));

        return (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-medium text-ink truncate" title={displayLabel}>
                {displayLabel}
              </span>
              <span className="shrink-0 text-forest-600 tabular-nums">
                <strong className="font-semibold text-ink">
                  {formatNumber(item.count)}
                </strong>{" "}
                <span className="text-[11px]">({pct}%)</span>
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-cream">
              <div
                style={{ width: `${Math.max(pct, item.count > 0 ? 3 : 0)}%` }}
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  accent === "gold" ? "bg-gold-dark" : "bg-primary"
                )}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 4. Device Breakdown SVG Donut + Legend (Desktop / Mobile / Tablet)
 * ─────────────────────────────────────────────────────────────────────────── */

const DEVICE_COLORS: Record<string, string> = {
  desktop: "#1B2D1E",
  mobile: "#877249",
  tablet: "#678B6A",
};

export function DeviceBreakdownChart({ devices }: { devices: BreakdownItem[] }) {
  const total = useMemo(
    () => devices.reduce((acc, item) => acc + item.count, 0),
    [devices]
  );

  const normalized = useMemo(() => {
    const order = ["mobile", "desktop", "tablet"];
    const byKey = new Map(
      devices.map((d) => [d.label.toLowerCase(), d])
    );
    return order.map((key) => {
      const existing = byKey.get(key);
      return {
        key,
        label: DEVICE_LABELS[key] ?? key,
        count: existing?.count ?? 0,
        pct: existing?.pct ?? 0,
        color: DEVICE_COLORS[key] ?? "#3B5A3C",
      };
    });
  }, [devices]);

  const radius = 44;
  const circumference = 2 * Math.PI * radius;

  const segments = useMemo(() => {
    if (total === 0) return [];
    let accumulated = 0;
    return normalized
      .filter((d) => d.count > 0)
      .map((d) => {
        const fraction = d.count / total;
        const length = fraction * circumference;
        const offset = -accumulated;
        accumulated += length;
        return { ...d, length, offset };
      });
  }, [normalized, total, circumference]);

  const renderDeviceIcon = (key: string) => {
    if (key === "mobile") return <Smartphone className="h-3.5 w-3.5" />;
    if (key === "tablet") return <Tablet className="h-3.5 w-3.5" />;
    return <Monitor className="h-3.5 w-3.5" />;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* SVG Donut */}
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#EEEDE5"
            strokeWidth="14"
          />
          {segments.map((seg) => (
            <circle
              key={seg.key}
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="14"
              strokeDasharray={`${seg.length} ${circumference - seg.length}`}
              strokeDashoffset={seg.offset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display text-xl font-bold text-ink leading-none">
            {formatNumber(total)}
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-forest-500">
            sessões
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 w-full space-y-2.5">
        {normalized.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-3 rounded-xl border border-forest-100/80 bg-cream-light/70 px-3 py-2 text-xs"
          >
            <div className="flex items-center gap-2.5">
              <span
                style={{ backgroundColor: item.color }}
                className="h-2.5 w-2.5 rounded-full shrink-0"
              />
              <span className="text-forest-700">{renderDeviceIcon(item.key)}</span>
              <span className="font-semibold text-ink">{item.label}</span>
            </div>
            <div className="tabular-nums text-right">
              <span className="font-semibold text-ink">
                {Math.round(item.pct)}%
              </span>
              <span className="ml-1.5 text-[11px] text-forest-500">
                ({formatNumber(item.count)})
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
