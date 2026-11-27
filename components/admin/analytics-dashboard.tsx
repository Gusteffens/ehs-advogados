"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  BookOpenCheck,
  ChevronRight,
  Clock,
  Compass,
  ExternalLink,
  Eye,
  FileEdit,
  Info,
  Loader2,
  MousePointerClick,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import {
  BreakdownBarList,
  DeviceBreakdownChart,
  formatDuration,
  formatNumber,
  ScrollFunnelChart,
  TrafficTrendChart,
} from "@/components/admin/analytics-charts";
import { KpiCard } from "@/components/admin/kpi-card";
import { useToast } from "@/components/admin/toast-provider";
import { cn, getErrorMessage } from "@/lib/utils";
import type {
  AnalyticsOverviewResponse,
  AnalyticsRange,
  PostAnalyticsResponse,
  TopArticleMetric,
} from "@/types/analytics";

const RANGE_OPTIONS: Array<{ value: AnalyticsRange; label: string }> = [
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
];

export function AnalyticsDashboard({
  initialData,
}: {
  initialData: AnalyticsOverviewResponse;
}) {
  const { toast } = useToast();

  const [range, setRange] = useState<AnalyticsRange>(initialData.range);
  const [data, setData] = useState<AnalyticsOverviewResponse>(initialData);
  const [isLoadingRange, setIsLoadingRange] = useState(false);
  const [articleSearch, setArticleSearch] = useState("");

  // Per-article drilldown state
  const [selectedArticle, setSelectedArticle] = useState<TopArticleMetric | null>(
    null
  );
  const [postDetail, setPostDetail] = useState<PostAnalyticsResponse | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const overviewAbortRef = useRef<AbortController | null>(null);
  const detailAbortRef = useRef<AbortController | null>(null);

  const handleRangeChange = async (nextRange: AnalyticsRange) => {
    if (nextRange === range && !isLoadingRange) return;

    overviewAbortRef.current?.abort();
    const controller = new AbortController();
    overviewAbortRef.current = controller;

    setRange(nextRange);
    setIsLoadingRange(true);

    try {
      const res = await fetch(`/api/admin/analytics/overview?range=${nextRange}`, {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(`Falha ao carregar métricas (${res.status})`);
      }
      const json = (await res.json()) as AnalyticsOverviewResponse;
      setData(json);
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === "AbortError") return;
      toast.error("Erro ao atualizar período", getErrorMessage(err));
    } finally {
      if (overviewAbortRef.current === controller) {
        setIsLoadingRange(false);
      }
    }
  };

  // Load per-article drilldown whenever selectedArticle or range changes
  useEffect(() => {
    if (!selectedArticle) {
      setPostDetail(null);
      setDetailError(null);
      return;
    }

    detailAbortRef.current?.abort();
    const controller = new AbortController();
    detailAbortRef.current = controller;

    setIsLoadingDetail(true);
    setDetailError(null);

    fetch(
      `/api/admin/analytics/posts/${encodeURIComponent(selectedArticle.postId)}?range=${range}`,
      {
        signal: controller.signal,
        cache: "no-store",
      }
    )
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Não foi possível carregar os dados do artigo (${res.status}).`);
        }
        return (await res.json()) as PostAnalyticsResponse;
      })
      .then((json) => {
        setPostDetail(json);
      })
      .catch((err: unknown) => {
        if ((err as { name?: string })?.name === "AbortError") return;
        const msg = getErrorMessage(err);
        setDetailError(msg);
        toast.error("Erro no detalhamento do artigo", msg);
      })
      .finally(() => {
        if (detailAbortRef.current === controller) {
          setIsLoadingDetail(false);
        }
      });

    return () => controller.abort();
  }, [selectedArticle, range, toast]);

  // Close drilldown drawer on Escape + lock body scroll
  useEffect(() => {
    if (!selectedArticle) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedArticle(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedArticle]);

  const { summary } = data;

  const dedupSavings = useMemo(() => {
    if (summary.rawViews <= 0) {
      return { filteredCount: 0, filteredPct: 0 };
    }
    const filteredCount = Math.max(0, summary.rawViews - summary.uniqueViews);
    const filteredPct = Math.round((filteredCount / summary.rawViews) * 100);
    return { filteredCount, filteredPct };
  }, [summary.rawViews, summary.uniqueViews]);

  const totalInteractions = summary.ctaClicks + summary.shareClicks;

  const filteredArticles = useMemo(() => {
    const q = articleSearch.trim().toLowerCase();
    if (!q) return data.topArticles;
    return data.topArticles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.categoryName?.toLowerCase().includes(q) ?? false) ||
        a.slug.toLowerCase().includes(q)
    );
  }, [data.topArticles, articleSearch]);

  return (
    <div className="space-y-6">
      {/* Header + Range Switcher */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-dark mb-1">
            Inteligência Editorial
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
            Analytics dos Artigos
          </h1>
          <p className="mt-1 text-sm text-forest-600">
            Métricas reais de leitura com deduplicação diária anti-inflação, sem cookies e em conformidade com a LGPD.
          </p>
        </div>

        {/* Range Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {isLoadingRange && (
            <Loader2 className="h-4 w-4 animate-spin text-gold-dark" />
          )}
          <div
            role="group"
            aria-label="Selecionar período de análise"
            className="inline-flex rounded-xl border border-forest-200 bg-white p-1 shadow-xs"
          >
            {RANGE_OPTIONS.map((opt) => {
              const active = range === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isLoadingRange}
                  onClick={() => handleRangeChange(opt.value)}
                  className={cn(
                    "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer disabled:opacity-60",
                    active
                      ? "bg-primary text-cream shadow-xs"
                      : "text-forest-700 hover:bg-cream hover:text-ink"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Non-blocking Migration Banner */}
      {!data.migrationReady && (
        <div className="rounded-2xl border border-champagne-400/70 bg-champagne-50/90 p-5 text-sm text-ink shadow-xs">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-champagne-200/80 text-gold-dark">
              <Info className="h-4 w-4" />
            </div>
            <div className="space-y-1.5">
              <p className="font-display text-base font-bold text-ink">
                Ative a telemetria completa aplicando a migration 003
              </p>
              <p className="text-xs text-forest-700 leading-relaxed">
                As tabelas analíticas ainda não foram criadas no Supabase. Aplique o arquivo{" "}
                <code className="rounded bg-white px-1.5 py-0.5 border border-champagne-300 font-mono text-[11px] text-ink">
                  supabase/migrations/003_article_analytics.sql
                </code>{" "}
                no SQL Editor do Supabase para liberar séries temporais anti-inflação, funil de rolagem (25%–100%), tempo real de leitura, fontes de tráfego e cliques em CTAs. Abaixo, os totais históricos básicos de <code className="font-mono text-[11px]">posts.views</code> continuam sendo exibidos normalmente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Strip */}
      <section
        aria-label="Indicadores principais"
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 transition-opacity duration-200",
          isLoadingRange && "opacity-65"
        )}
      >
        <KpiCard
          tone="ink"
          label="Views Únicas"
          value={formatNumber(summary.uniqueViews)}
          deltaPct={summary.deltaPct}
          sublabel={
            summary.prevUniqueViews > 0
              ? `vs ${formatNumber(summary.prevUniqueViews)} no período anterior`
              : "1 visita única / leitor / dia"
          }
          icon={Eye}
        />

        <KpiCard
          tone="gold"
          label="Impressões Brutas"
          value={formatNumber(summary.rawViews)}
          sublabel={
            dedupSavings.filteredCount > 0
              ? `${dedupSavings.filteredPct}% deduplicadas (${formatNumber(dedupSavings.filteredCount)} anti-inflação)`
              : "100% visitas únicas qualificadas"
          }
          icon={ShieldCheck}
        />

        <KpiCard
          tone="default"
          label="Tempo Médio"
          value={formatDuration(summary.avgReadTimeSec)}
          sublabel={
            summary.engagedSessions > 0
              ? `${formatNumber(summary.engagedSessions)} sessões engajadas`
              : "Tempo ativo com aba visível"
          }
          icon={Clock}
        />

        <KpiCard
          tone="forest"
          label="Conclusão (75%+)"
          value={`${Math.round(summary.completionRatePct)}%`}
          sublabel="Leitores que alcançaram 75%+"
          icon={BookOpenCheck}
        />

        <KpiCard
          tone="default"
          label="CTAs & Shares"
          value={formatNumber(totalInteractions)}
          sublabel={`${formatNumber(summary.ctaClicks)} CTAs · ${formatNumber(summary.shareClicks)} compartilhamentos`}
          icon={MousePointerClick}
        />
      </section>

      {/* Main Timeseries Chart */}
      <section
        className={cn(
          "rounded-2xl border border-forest-100 bg-white p-5 sm:p-6 shadow-xs transition-opacity duration-200",
          isLoadingRange && "opacity-65"
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">
              Evolução Diária de Audiência
            </h2>
            <p className="text-xs text-forest-600 mt-0.5">
              Comparativo entre leitores únicos qualificados e impressões brutas registradas no período.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full border border-forest-200 bg-forest-50 px-3 py-1 text-[11px] font-semibold text-forest-700">
            <Sparkles className="h-3.5 w-3.5 text-gold-dark" />
            Filtro anti-bots &amp; admins ativo
          </span>
        </div>

        <TrafficTrendChart data={data.timeseries} />
      </section>

      {/* Middle Row: Scroll Funnel + Devices */}
      <div
        className={cn(
          "grid grid-cols-1 lg:grid-cols-2 gap-6 transition-opacity duration-200",
          isLoadingRange && "opacity-65"
        )}
      >
        <section className="rounded-2xl border border-forest-100 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                Funil de Profundidade de Leitura
              </h2>
              <p className="text-xs text-forest-600 mt-0.5">
                Percentual de sessões engajadas que atingiram cada marco do texto.
              </p>
            </div>
            <BarChart3 className="h-4 w-4 text-gold-dark shrink-0" />
          </div>
          <ScrollFunnelChart funnel={data.scrollFunnel} />
        </section>

        <section className="rounded-2xl border border-forest-100 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                Dispositivos dos Leitores
              </h2>
              <p className="text-xs text-forest-600 mt-0.5">
                Distribuição de sessões entre Mobile, Desktop e Tablet.
              </p>
            </div>
            <Activity className="h-4 w-4 text-gold-dark shrink-0" />
          </div>
          <DeviceBreakdownChart devices={data.devices} />
        </section>
      </div>

      {/* Acquisition Row: Traffic Sources + Top Referrers */}
      <div
        className={cn(
          "grid grid-cols-1 lg:grid-cols-2 gap-6 transition-opacity duration-200",
          isLoadingRange && "opacity-65"
        )}
      >
        <section className="rounded-2xl border border-forest-100 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                Fontes de Tráfego
              </h2>
              <p className="text-xs text-forest-600 mt-0.5">
                Classificação automática por origem, buscadores e parâmetros UTM.
              </p>
            </div>
            <Compass className="h-4 w-4 text-gold-dark shrink-0" />
          </div>
          <BreakdownBarList
            items={data.trafficSources}
            kind="source"
            accent="forest"
            emptyMessage="Nenhuma fonte de tráfego registrada neste período."
          />
        </section>

        <section className="rounded-2xl border border-forest-100 bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                Principais Referenciadores
              </h2>
              <p className="text-xs text-forest-600 mt-0.5">
                Domínios externos que enviaram leitores aos artigos jurídicos.
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-gold-dark shrink-0" />
          </div>
          <BreakdownBarList
            items={data.topReferrers}
            kind="raw"
            accent="gold"
            emptyMessage="Nenhum domínio referenciador registrado neste período."
          />
        </section>
      </div>

      {/* Top Articles Performance Table */}
      <section className="rounded-2xl border border-forest-100 bg-white shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-forest-100 px-5 sm:px-6 py-4">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">
              Desempenho por Artigo
            </h2>
            <p className="text-xs text-forest-600 mt-0.5">
              Clique em qualquer artigo para abrir o detalhamento completo com série diária, funil e eventos.
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-forest-500 pointer-events-none" />
            <input
              type="search"
              value={articleSearch}
              onChange={(e) => setArticleSearch(e.target.value)}
              placeholder="Filtrar artigos..."
              aria-label="Filtrar artigos por título ou categoria"
              className="w-full rounded-xl border border-forest-200 bg-cream-light/60 pl-8 pr-3 py-1.5 text-xs text-ink placeholder:text-forest-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-champagne-500/40 focus:border-gold-dark"
            />
          </div>
        </div>

        {filteredArticles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-forest-100 bg-cream-light/90 text-[11px] font-semibold uppercase tracking-wider text-forest-600">
                  <th className="py-3 pl-5 sm:pl-6 pr-3">Artigo</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Views Únicas</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Brutas</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Tempo Médio</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Conclusão</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">CTAs / Shares</th>
                  <th className="py-3 pl-2 pr-5 sm:pr-6 text-right">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-100/80 text-sm">
                {filteredArticles.map((article, idx) => (
                  <tr
                    key={article.postId}
                    onClick={() => setSelectedArticle(article)}
                    className="group hover:bg-cream-light/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 pl-5 sm:pl-6 pr-3 min-w-[240px]">
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-cream text-[10px] font-bold text-forest-700">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-display text-base font-bold text-ink group-hover:text-primary transition-colors line-clamp-1">
                            {article.title}
                          </p>
                          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-forest-500">
                            {article.categoryName && (
                              <span className="rounded bg-forest-50 px-1.5 py-0.5 font-medium text-forest-700">
                                {article.categoryName}
                              </span>
                            )}
                            <span className="truncate">/blog/{article.slug}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right font-semibold text-ink tabular-nums">
                      {formatNumber(article.uniqueViews)}
                    </td>

                    <td className="py-3.5 px-3 text-right text-xs text-forest-600 tabular-nums">
                      {formatNumber(article.rawViews)}
                    </td>

                    <td className="py-3.5 px-3 text-right text-xs text-ink tabular-nums">
                      {formatDuration(article.avgReadTimeSec)}
                    </td>

                    <td className="py-3.5 px-3 text-right tabular-nums">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold",
                          article.completionRatePct >= 50
                            ? "bg-forest-50 text-forest-800"
                            : "bg-cream text-forest-700"
                        )}
                      >
                        {Math.round(article.completionRatePct)}%
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right text-xs text-forest-700 tabular-nums whitespace-nowrap">
                      <span className="font-semibold text-ink">
                        {formatNumber(article.ctaClicks)}
                      </span>{" "}
                      / {formatNumber(article.shareClicks)}
                    </td>

                    <td className="py-3.5 pl-2 pr-5 sm:pr-6 text-right">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-forest-200 bg-white text-forest-700 group-hover:border-gold-dark group-hover:bg-cream group-hover:text-ink transition-colors">
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-xs text-forest-600">
            {articleSearch.trim()
              ? "Nenhum artigo corresponde à busca."
              : "Nenhum dado de desempenho por artigo disponível ainda."}
          </div>
        )}
      </section>

      {/* Per-Article Drilldown Slide-Over Panel */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-ink/50 backdrop-blur-[2px] animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="article-drilldown-title"
          onClick={() => setSelectedArticle(null)}
        >
          <aside
            className="relative flex h-full w-full max-w-2xl flex-col bg-cream-light border-l border-forest-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 w-full bg-gradient-to-r from-primary via-gold-dark to-gold shrink-0" />

            {/* Drawer Header */}
            <div className="flex items-start justify-between gap-4 border-b border-forest-100 bg-white px-6 py-5 shrink-0">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-dark">
                    Raio-X do Artigo
                  </span>
                  {selectedArticle.categoryName && (
                    <span className="rounded bg-cream px-2 py-0.5 text-[10px] font-semibold text-forest-700">
                      {selectedArticle.categoryName}
                    </span>
                  )}
                </div>
                <h2
                  id="article-drilldown-title"
                  className="font-display text-xl sm:text-2xl font-bold text-ink leading-snug"
                >
                  {selectedArticle.title}
                </h2>
                <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs">
                  <Link
                    href={`/blog/${selectedArticle.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 font-semibold text-forest-700 hover:text-gold-dark no-underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ver artigo no site
                  </Link>
                  <Link
                    href={`/admin/posts/${selectedArticle.postId}`}
                    className="inline-flex items-center gap-1 font-semibold text-forest-700 hover:text-gold-dark no-underline"
                  >
                    <FileEdit className="h-3.5 w-3.5" />
                    Editar no CMS
                  </Link>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                aria-label="Fechar detalhamento do artigo"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-forest-200 bg-white text-forest-700 hover:bg-cream hover:text-ink transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Range bar inside drilldown */}
            <div className="flex items-center justify-between gap-3 border-b border-forest-100 bg-cream/50 px-6 py-2.5 shrink-0">
              <span className="text-[11px] font-medium text-forest-600">
                Período analisado
              </span>
              <div className="inline-flex rounded-lg border border-forest-200 bg-white p-0.5">
                {RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleRangeChange(opt.value)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer",
                      range === opt.value
                        ? "bg-primary text-cream"
                        : "text-forest-700 hover:bg-cream"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Detail Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {isLoadingDetail ? (
                <div className="flex flex-col items-center justify-center py-20 text-forest-600 gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-gold-dark" />
                  <p className="text-xs font-medium">
                    Carregando telemetria detalhada do artigo…
                  </p>
                </div>
              ) : detailError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
                  {detailError}
                </div>
              ) : postDetail ? (
                <>
                  {/* 4 compact KPI tiles */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-forest-200 bg-ink p-3.5 text-cream">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-cream/65">
                        Views Únicas
                      </p>
                      <p className="mt-1 font-display text-2xl font-bold text-cream">
                        {formatNumber(postDetail.summary.uniqueViews)}
                      </p>
                      <p className="mt-0.5 text-[10px] text-gold">
                        Total histórico: {formatNumber(postDetail.post.views)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-forest-100 bg-white p-3.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-forest-600">
                        Impressões Brutas
                      </p>
                      <p className="mt-1 font-display text-2xl font-bold text-ink">
                        {formatNumber(postDetail.summary.rawViews)}
                      </p>
                      <p className="mt-0.5 text-[10px] text-forest-500">
                        Total histórico: {formatNumber(postDetail.post.rawViews)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-forest-100 bg-white p-3.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-forest-600">
                        Tempo Médio
                      </p>
                      <p className="mt-1 font-display text-2xl font-bold text-ink">
                        {formatDuration(postDetail.summary.avgReadTimeSec)}
                      </p>
                      <p className="mt-0.5 text-[10px] text-forest-500">
                        {formatNumber(postDetail.summary.engagedSessions)} sessões
                      </p>
                    </div>
                    <div className="rounded-xl border border-forest-100 bg-white p-3.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-forest-600">
                        Conclusão 75%+
                      </p>
                      <p className="mt-1 font-display text-2xl font-bold text-primary">
                        {Math.round(postDetail.summary.completionRatePct)}%
                      </p>
                      <p className="mt-0.5 text-[10px] text-forest-500">
                        {formatNumber(
                          postDetail.summary.ctaClicks +
                            postDetail.summary.shareClicks
                        )}{" "}
                        interações
                      </p>
                    </div>
                  </div>

                  {/* Per-article timeseries */}
                  <div className="rounded-2xl border border-forest-100 bg-white p-4 sm:p-5">
                    <h3 className="font-display text-base font-bold text-ink mb-3">
                      Leituras Diárias do Artigo
                    </h3>
                    <TrafficTrendChart
                      data={postDetail.timeseries}
                      height={220}
                      compact
                    />
                  </div>

                  {/* Per-article Scroll Funnel */}
                  <div className="rounded-2xl border border-forest-100 bg-white p-4 sm:p-5">
                    <h3 className="font-display text-base font-bold text-ink mb-3">
                      Funil de Leitura (Rolagem)
                    </h3>
                    <ScrollFunnelChart funnel={postDetail.scrollFunnel} />
                  </div>

                  {/* Per-article Events Breakdown */}
                  <div className="rounded-2xl border border-forest-100 bg-white p-4 sm:p-5">
                    <h3 className="font-display text-base font-bold text-ink mb-3">
                      Eventos (CTAs &amp; Compartilhamentos)
                    </h3>
                    <BreakdownBarList
                      items={postDetail.eventsBreakdown}
                      kind="event"
                      accent="gold"
                      emptyMessage="Nenhum clique em CTA ou compartilhamento registrado neste período."
                    />
                  </div>

                  {/* Per-article Sources & Referrers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-forest-100 bg-white p-4">
                      <h3 className="font-display text-base font-bold text-ink mb-3">
                        Fontes de Tráfego
                      </h3>
                      <BreakdownBarList
                        items={postDetail.trafficSources}
                        kind="source"
                        emptyMessage="Sem fontes registradas."
                      />
                    </div>
                    <div className="rounded-2xl border border-forest-100 bg-white p-4">
                      <h3 className="font-display text-base font-bold text-ink mb-3">
                        Referenciadores
                      </h3>
                      <BreakdownBarList
                        items={postDetail.topReferrers}
                        kind="raw"
                        accent="gold"
                        emptyMessage="Sem referenciadores externos."
                      />
                    </div>
                  </div>

                  {/* Per-article Devices */}
                  <div className="rounded-2xl border border-forest-100 bg-white p-4 sm:p-5">
                    <h3 className="font-display text-base font-bold text-ink mb-3">
                      Dispositivos
                    </h3>
                    <DeviceBreakdownChart devices={postDetail.devices} />
                  </div>
                </>
              ) : null}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
