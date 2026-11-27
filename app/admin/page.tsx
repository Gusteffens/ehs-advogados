import { Suspense } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Clock,
  Eye,
  FileText,
  Inbox,
  MailWarning,
  PenSquare,
  TrendingUp,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAnalyticsOverview } from "@/lib/analytics/queries";
import { KpiCard } from "@/components/admin/kpi-card";
import { cn } from "@/lib/utils";
import type {
  AnalyticsOverviewResponse,
  AnalyticsTimeseriesPoint,
} from "@/types/analytics";

export const dynamic = "force-dynamic";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function formatAdminDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "America/Sao_Paulo",
  });
}

function formatReadTime(seconds: number | undefined): string {
  if (!seconds || seconds <= 0) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

function formatShortDay(isoDate: string): string {
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}`;
}

interface EditorialAlert {
  postId: string;
  title: string;
  reasons: string[];
}

interface DashboardPostRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  published_at: string | null;
  views: number | null;
  excerpt: string | null;
  cover_image_url: string | null;
  category_id: string | null;
}

interface DashboardLeadRow {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  email_sent: boolean | null;
  created_at: string;
}

interface PostsQueryResult {
  posts: DashboardPostRow[];
  hasError: boolean;
}

function buildEditorialAlerts(posts: DashboardPostRow[]): EditorialAlert[] {
  const now = Date.now();
  const alerts: EditorialAlert[] = [];

  for (const post of posts) {
    const reasons: string[] = [];

    if (post.status === "published") {
      if (!post.excerpt || !post.excerpt.trim()) {
        reasons.push("sem resumo / meta descrição SEO");
      }
      if (!post.cover_image_url) {
        reasons.push("sem imagem de capa");
      }
      if (!post.category_id) {
        reasons.push("sem categoria");
      }
    } else if (post.status === "draft") {
      const lastTouch = post.updated_at || post.created_at;
      if (lastTouch && now - new Date(lastTouch).getTime() > SEVEN_DAYS_MS) {
        reasons.push("rascunho parado há mais de 7 dias");
      }
    }

    if (reasons.length > 0) {
      alerts.push({
        postId: post.id,
        title: post.title,
        reasons,
      });
    }
  }

  return alerts;
}

function CompactTrafficChart({
  timeseries,
  migrationReady,
}: {
  timeseries: AnalyticsTimeseriesPoint[];
  migrationReady: boolean;
}) {
  if (!timeseries.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-forest-200 bg-cream-light/60 px-6 py-10 text-center">
        <BarChart3 className="h-7 w-7 text-forest-400 mb-2" />
        <p className="text-sm font-medium text-ink">
          Sem dados diários registrados nos últimos 30 dias
        </p>
        <p className="text-xs text-forest-600 mt-1 max-w-md">
          {migrationReady
            ? "Assim que novos leitores acessarem os artigos publicados, a curva diária aparecerá aqui."
            : "Aplique a migration de analytics no Supabase para habilitar a série temporal diária anti-inflação."}
        </p>
      </div>
    );
  }

  const width = 760;
  const height = 160;
  const padX = 10;
  const padTop = 14;
  const padBottom = 10;
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;

  const maxVal = Math.max(
    1,
    ...timeseries.map((p) => Math.max(p.uniqueViews, p.rawViews))
  );

  const stepX =
    timeseries.length > 1 ? innerW / (timeseries.length - 1) : innerW;

  const uniqueCoords = timeseries.map((point, index) => {
    const x = padX + index * stepX;
    const y = padTop + innerH - (point.uniqueViews / maxVal) * innerH;
    return { x, y, point };
  });

  const linePath = uniqueCoords
    .map(
      (c, idx) =>
        `${idx === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`
    )
    .join(" ");

  const areaPath = `${linePath} L ${uniqueCoords[uniqueCoords.length - 1].x.toFixed(1)} ${(padTop + innerH).toFixed(1)} L ${uniqueCoords[0].x.toFixed(1)} ${(padTop + innerH).toFixed(1)} Z`;

  const peakPoint = timeseries.reduce(
    (best, curr) => (curr.uniqueViews > best.uniqueViews ? curr : best),
    timeseries[0]
  );

  const firstDate = formatShortDay(timeseries[0].date);
  const midDate = formatShortDay(
    timeseries[Math.floor(timeseries.length / 2)].date
  );
  const lastDate = formatShortDay(timeseries[timeseries.length - 1].date);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-forest-600">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            Views únicas diárias
          </span>
        </div>
        <span>
          Pico:{" "}
          <strong className="font-semibold text-ink">
            {peakPoint.uniqueViews}
          </strong>{" "}
          em {formatShortDay(peakPoint.date)}
        </span>
      </div>

      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-40"
          role="img"
          aria-label="Tendência de visualizações únicas nos últimos 30 dias"
        >
          <defs>
            <linearGradient id="ehsDashArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1B2D1E" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#1B2D1E" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padTop + innerH * (1 - ratio);
            return (
              <line
                key={ratio}
                x1={padX}
                x2={width - padX}
                y1={y}
                y2={y}
                stroke="#DCE5DC"
                strokeWidth="1"
                strokeDasharray="3 4"
              />
            );
          })}

          <path d={areaPath} fill="url(#ehsDashArea)" />
          <path
            d={linePath}
            fill="none"
            stroke="#1B2D1E"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {uniqueCoords.map((coord, idx) =>
            coord.point.uniqueViews > 0 &&
            (coord.point.date === peakPoint.date ||
              idx === uniqueCoords.length - 1) ? (
              <circle
                key={coord.point.date}
                cx={coord.x}
                cy={coord.y}
                r="4"
                fill="#E8D49A"
                stroke="#0D1812"
                strokeWidth="1.5"
              />
            ) : null
          )}
        </svg>
      </div>

      <div className="mt-1 flex items-center justify-between text-[11px] text-forest-500 font-medium">
        <span>{firstDate}</span>
        <span>{midDate}</span>
        <span>{lastDate}</span>
      </div>
    </div>
  );
}

/* ── Skeletons ─────────────────────────────────────────────────────────── */

function SingleKpiSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-forest-200/75 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-3 w-28 rounded bg-forest-100 animate-pulse" />
        <div className="h-9 w-9 rounded-xl bg-cream-light animate-pulse" />
      </div>
      <div className="h-8 w-20 rounded-lg bg-forest-100 animate-pulse" />
      <div className="h-3 w-40 rounded bg-cream-light animate-pulse" />
    </div>
  );
}

function TrafficChartSkeleton() {
  return (
    <section className="rounded-2xl bg-white border border-forest-200/75 p-6 shadow-xs space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="h-5 w-56 rounded bg-forest-100 animate-pulse" />
          <div className="h-3 w-72 rounded bg-cream-light animate-pulse" />
        </div>
        <div className="h-4 w-36 rounded bg-cream-light animate-pulse" />
      </div>
      <div className="h-44 w-full rounded-xl bg-cream-light/90 border border-forest-100 animate-pulse" />
    </section>
  );
}

function RecentArticlesSkeleton() {
  return (
    <section className="lg:col-span-2 rounded-2xl bg-white border border-forest-200/75 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-5 w-36 rounded bg-forest-100 animate-pulse" />
          <div className="h-3 w-48 rounded bg-cream-light animate-pulse" />
        </div>
        <div className="h-4 w-20 rounded bg-cream-light animate-pulse" />
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="h-12 w-full rounded-xl bg-cream-light/80 animate-pulse"
          />
        ))}
      </div>
    </section>
  );
}

function RecentLeadsSkeleton() {
  return (
    <section className="rounded-2xl bg-white border border-forest-200/75 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-5 w-36 rounded bg-forest-100 animate-pulse" />
          <div className="h-3 w-28 rounded bg-cream-light animate-pulse" />
        </div>
        <div className="h-4 w-20 rounded bg-cream-light animate-pulse" />
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="h-16 w-full rounded-xl bg-cream-light/80 animate-pulse"
          />
        ))}
      </div>
    </section>
  );
}

function BottomCardSkeleton() {
  return (
    <section className="rounded-2xl bg-white border border-forest-200/75 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-5 w-52 rounded bg-forest-100 animate-pulse" />
        <div className="h-4 w-20 rounded bg-cream-light animate-pulse" />
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="h-12 w-full rounded-xl bg-cream-light/80 animate-pulse"
          />
        ))}
      </div>
    </section>
  );
}

/* ── Streamed Async Sections ───────────────────────────────────────────── */

async function PostsErrorBanner({
  postsPromise,
}: {
  postsPromise: Promise<PostsQueryResult>;
}) {
  const { hasError } = await postsPromise;
  if (!hasError) return null;

  return (
    <div
      role="alert"
      className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800"
    >
      <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
      <span>
        Não foi possível carregar todos os artigos. Tente recarregar a página.
      </span>
    </div>
  );
}

async function PublishedPostsKpi({
  postsPromise,
}: {
  postsPromise: Promise<PostsQueryResult>;
}) {
  const { posts } = await postsPromise;
  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;

  return (
    <KpiCard
      label="Artigos Publicados"
      value={publishedCount}
      sublabel={`${draftCount} ${draftCount === 1 ? "rascunho" : "rascunhos"} em elaboração`}
      icon={<FileText className="h-4 w-4" />}
      href="/admin/posts"
    />
  );
}

async function ViewsKpi({
  analyticsPromise,
  postsPromise,
}: {
  analyticsPromise: Promise<AnalyticsOverviewResponse | null>;
  postsPromise: Promise<PostsQueryResult>;
}) {
  const [analytics, { posts }] = await Promise.all([
    analyticsPromise,
    postsPromise,
  ]);

  const fallbackTotalViews = posts.reduce(
    (acc, curr) => acc + (curr.views ?? 0),
    0
  );
  const uniqueViews30d = analytics
    ? analytics.summary.uniqueViews
    : fallbackTotalViews;
  const rawViews30d = analytics
    ? analytics.summary.rawViews
    : fallbackTotalViews;
  const deltaPct30d = analytics ? analytics.summary.deltaPct : null;

  return (
    <KpiCard
      label="Views Únicas (30d)"
      value={uniqueViews30d.toLocaleString("pt-BR")}
      sublabel={
        analytics
          ? `${rawViews30d.toLocaleString("pt-BR")} impressões brutas`
          : "Total acumulado no blog"
      }
      deltaPct={deltaPct30d}
      icon={<Eye className="h-4 w-4" />}
      href="/admin/analytics"
      tone="gold"
    />
  );
}

async function UnreadLeadsKpi({
  unreadLeadsPromise,
}: {
  unreadLeadsPromise: Promise<number>;
}) {
  const unreadLeadsCount = await unreadLeadsPromise;

  return (
    <KpiCard
      label="Contatos Novos"
      value={unreadLeadsCount}
      sublabel={
        unreadLeadsCount > 0
          ? "Aguardando retorno da equipe"
          : "Todos os contatos respondidos"
      }
      icon={<Inbox className="h-4 w-4" />}
      href="/admin/leads"
      tone={unreadLeadsCount > 0 ? "alert" : "forest"}
    />
  );
}

async function ReadTimeKpi({
  analyticsPromise,
}: {
  analyticsPromise: Promise<AnalyticsOverviewResponse | null>;
}) {
  const analytics = await analyticsPromise;

  return (
    <KpiCard
      label="Tempo Médio & Leitura"
      value={formatReadTime(analytics?.summary.avgReadTimeSec)}
      sublabel={
        analytics && analytics.summary.engagedSessions > 0
          ? `${Math.round(analytics.summary.completionRatePct)}% chegam a 75%+ do texto`
          : "Média de leitura engajada (30d)"
      }
      icon={<Clock className="h-4 w-4" />}
      href="/admin/analytics"
      tone="ink"
    />
  );
}

async function TrafficTrendSection({
  analyticsPromise,
}: {
  analyticsPromise: Promise<AnalyticsOverviewResponse | null>;
}) {
  const analytics = await analyticsPromise;

  return (
    <section className="rounded-2xl bg-white border border-forest-200/75 p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">
            Tendência de Audiência — 30 dias
          </h2>
          <p className="text-xs text-forest-600 mt-0.5">
            Leituras deduplicadas com filtro anti-inflação e bots
          </p>
        </div>

        <Link
          href="/admin/analytics"
          className="inline-flex items-center gap-1 text-xs font-semibold text-gold-dark hover:text-ink transition-colors no-underline"
        >
          Abrir relatório detalhado
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <CompactTrafficChart
        timeseries={analytics?.timeseries ?? []}
        migrationReady={analytics?.migrationReady ?? false}
      />
    </section>
  );
}

async function RecentArticlesSection({
  postsPromise,
}: {
  postsPromise: Promise<PostsQueryResult>;
}) {
  const { posts } = await postsPromise;
  const recentPosts = posts.slice(0, 6);

  return (
    <section className="lg:col-span-2 rounded-2xl bg-white border border-forest-200/75 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">
            Artigos Recentes
          </h2>
          <p className="text-xs text-forest-600 mt-0.5">
            Últimas publicações e rascunhos salvos
          </p>
        </div>
        <Link
          href="/admin/posts"
          className="flex items-center gap-1 text-xs text-gold-dark font-semibold hover:text-ink no-underline transition-colors"
        >
          Ver todos
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {recentPosts.length > 0 ? (
        <div className="divide-y divide-forest-100">
          {recentPosts.map((post) => (
            <Link
              key={post.id}
              href={`/admin/posts/${post.id}`}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 hover:bg-cream-light/80 -mx-2 px-2 rounded-xl transition-colors group no-underline"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink truncate group-hover:text-forest-700 transition-colors">
                  {post.title}
                </p>
                <p className="text-xs text-forest-600 mt-0.5">
                  {post.created_at
                    ? formatAdminDate(post.created_at)
                    : "Sem data"}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {(post.views ?? 0) > 0 && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs text-forest-600">
                    <Eye className="h-3.5 w-3.5 text-forest-400" />
                    {(post.views ?? 0).toLocaleString("pt-BR")}
                  </span>
                )}
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider",
                    post.status === "published"
                      ? "bg-forest-100 text-forest-800"
                      : "bg-champagne-100 text-champagne-800"
                  )}
                >
                  {post.status === "published" ? "Publicado" : "Rascunho"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-forest-600 py-6 text-center">
          Nenhum artigo encontrado. Crie o primeiro artigo do blog.
        </p>
      )}
    </section>
  );
}

async function RecentLeadsSection({
  recentLeadsPromise,
  unreadLeadsPromise,
}: {
  recentLeadsPromise: Promise<DashboardLeadRow[]>;
  unreadLeadsPromise: Promise<number>;
}) {
  const [safeLeads, unreadLeadsCount] = await Promise.all([
    recentLeadsPromise,
    unreadLeadsPromise,
  ]);

  return (
    <section className="rounded-2xl bg-white border border-forest-200/75 p-6 shadow-xs flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">
            Contatos Recentes
          </h2>
          <p className="text-xs text-forest-600 mt-0.5">
            {unreadLeadsCount > 0
              ? `${unreadLeadsCount} não lido(s)`
              : "Caixa de entrada em dia"}
          </p>
        </div>
        <Link
          href="/admin/leads"
          className="flex items-center gap-1 text-xs text-gold-dark font-semibold hover:text-ink no-underline transition-colors"
        >
          Abrir inbox
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {safeLeads.length > 0 ? (
        <div className="space-y-2.5 flex-1">
          {safeLeads.map((lead) => {
            const isNew = lead.status === "new";
            return (
              <Link
                key={lead.id}
                href="/admin/leads"
                className={cn(
                  "block rounded-xl border p-3 transition-colors no-underline",
                  isNew
                    ? "border-champagne-300 bg-champagne-50/50 hover:bg-champagne-100/60"
                    : "border-forest-100 bg-cream-light/40 hover:bg-cream/60"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-ink truncate">
                    {lead.name}
                  </span>
                  <span className="text-[11px] text-forest-500 shrink-0">
                    {formatAdminDate(lead.created_at)}
                  </span>
                </div>
                <p className="text-xs text-forest-700 truncate mt-0.5">
                  {lead.subject || lead.message}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                      isNew
                        ? "bg-ink text-gold"
                        : lead.status === "contacted"
                          ? "bg-forest-100 text-forest-700"
                          : "bg-cream text-forest-600"
                    )}
                  >
                    {isNew
                      ? "Novo"
                      : lead.status === "contacted"
                        ? "Contatado"
                        : "Arquivado"}
                  </span>

                  {!lead.email_sent && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700">
                      <MailWarning className="h-3 w-3" />
                      Falha e-mail
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <Inbox className="h-7 w-7 text-forest-300 mb-2" />
          <p className="text-sm text-forest-600">
            Nenhum lead recebido ainda.
          </p>
        </div>
      )}
    </section>
  );
}

async function TopArticlesSection({
  analyticsPromise,
  postsPromise,
}: {
  analyticsPromise: Promise<AnalyticsOverviewResponse | null>;
  postsPromise: Promise<PostsQueryResult>;
}) {
  const [analytics, { posts }] = await Promise.all([
    analyticsPromise,
    postsPromise,
  ]);

  const publishedPosts = posts.filter((p) => p.status === "published");
  const topPerforming =
    analytics && analytics.topArticles.length > 0
      ? analytics.topArticles.slice(0, 5)
      : [...publishedPosts]
          .filter((p) => (p.views ?? 0) > 0)
          .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
          .slice(0, 5)
          .map((p) => ({
            postId: p.id,
            title: p.title,
            slug: p.slug,
            categoryName: null,
            uniqueViews: p.views ?? 0,
            rawViews: p.views ?? 0,
            avgReadTimeSec: 0,
            completionRatePct: 0,
            shareClicks: 0,
            ctaClicks: 0,
          }));

  return (
    <section className="rounded-2xl bg-white border border-forest-200/75 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
          <TrendingUp className="h-4 w-4 text-gold-dark" />
          Artigos com Melhor Desempenho
        </h2>
        <span className="text-[11px] font-medium text-forest-600">
          Top 5 (30 dias)
        </span>
      </div>

      {topPerforming.length > 0 ? (
        <ol className="space-y-2">
          {topPerforming.map((item, idx) => (
            <li key={item.postId}>
              <Link
                href={`/admin/posts/${item.postId}`}
                className="flex items-center gap-3 rounded-xl p-2.5 -mx-1 hover:bg-cream-light transition-colors no-underline group"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cream text-xs font-bold text-forest-800 border border-forest-200/60">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink truncate group-hover:text-forest-700 transition-colors">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-forest-600">
                    {item.avgReadTimeSec > 0
                      ? `Leitura média: ${formatReadTime(item.avgReadTimeSec)} · ${Math.round(item.completionRatePct)}% conclusão`
                      : item.categoryName || "Artigo publicado"}
                  </p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-champagne-50 border border-champagne-200/80 px-2.5 py-1 text-xs font-semibold text-ink">
                  <Eye className="h-3.5 w-3.5 text-gold-dark" />
                  {item.uniqueViews.toLocaleString("pt-BR")}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-forest-600 py-6 text-center">
          Ainda não há artigos publicados com visualizações registradas.
        </p>
      )}
    </section>
  );
}

async function EditorialAlertsSection({
  postsPromise,
}: {
  postsPromise: Promise<PostsQueryResult>;
}) {
  const { posts } = await postsPromise;
  const editorialAlerts = buildEditorialAlerts(posts);

  return (
    <section className="rounded-2xl bg-white border border-forest-200/75 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
          <AlertTriangle className="h-4 w-4 text-champagne-700" />
          Saúde Editorial &amp; SEO
        </h2>
        <span className="inline-flex items-center rounded-full bg-cream px-2.5 py-0.5 text-[11px] font-semibold text-forest-700">
          {editorialAlerts.length}{" "}
          {editorialAlerts.length === 1 ? "pendência" : "pendências"}
        </span>
      </div>

      {editorialAlerts.length > 0 ? (
        <ul className="space-y-2">
          {editorialAlerts.slice(0, 6).map((item) => (
            <li key={item.postId}>
              <Link
                href={`/admin/posts/${item.postId}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-champagne-200 bg-champagne-50/55 px-3.5 py-2.5 hover:bg-champagne-100/70 transition-colors no-underline"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-champagne-800 mt-0.5">
                    {item.reasons.join(" · ")}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-gold-dark" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-forest-200/70 bg-forest-50/60 px-4 py-6 text-center">
          <p className="text-sm font-semibold text-forest-800">
            Tudo em dia com SEO e qualidade editorial!
          </p>
          <p className="text-xs text-forest-600 mt-1">
            Todos os artigos publicados têm capa, resumo SEO e categoria, e não
            há rascunhos parados há mais de 7 dias.
          </p>
        </div>
      )}
    </section>
  );
}

/* ── Main Dashboard Page ───────────────────────────────────────────────── */

export default async function AdminDashboard() {
  const session = await requireAdmin();
  const supabase = createAdminClient();

  // Kick off all queries in parallel immediately without blocking initial shell paint
  const postsPromise: Promise<PostsQueryResult> = Promise.resolve(
    supabase
      .from("posts")
      .select(
        "id, title, slug, status, created_at, updated_at, published_at, views, excerpt, cover_image_url, category_id"
      )
      .order("created_at", { ascending: false })
  )
    .then((res) => ({
      posts: (res.data ?? []) as DashboardPostRow[],
      hasError: Boolean(res.error),
    }))
    .catch(() => ({ posts: [], hasError: true }));

  const unreadLeadsPromise: Promise<number> = Promise.resolve(
    supabase
      .from("contact_leads")
      .select("id", { count: "exact", head: true })
      .eq("status", "new")
  )
    .then((res) => res.count ?? 0)
    .catch(() => 0);

  const recentLeadsPromise: Promise<DashboardLeadRow[]> = Promise.resolve(
    supabase
      .from("contact_leads")
      .select("id, name, email, subject, message, status, email_sent, created_at")
      .order("created_at", { ascending: false })
      .limit(5)
  )
    .then((res) => (res.data ?? []) as DashboardLeadRow[])
    .catch(() => []);

  const analyticsPromise: Promise<AnalyticsOverviewResponse | null> =
    getAnalyticsOverview("30d").catch(() => null);

  const firstName = session.name?.split(" ")[0] || "Administrador";
  const todayLabel = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone: "America/Sao_Paulo",
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header — paints immediately */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark capitalize">
            {todayLabel}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink mt-1">
            Olá, {firstName}
          </h1>
          <p className="text-forest-600 text-sm mt-1">
            Resumo editorial, audiência dos últimos 30 dias e contatos recentes
            do escritório.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-1.5 rounded-xl border border-forest-200 bg-white px-4 py-2.5 text-xs font-semibold text-ink hover:bg-cream transition-colors no-underline"
          >
            <BarChart3 className="h-3.5 w-3.5 text-gold-dark" />
            Analytics Completo
          </Link>
          <Link
            href="/admin/posts/novo"
            className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-xs font-semibold text-gold hover:bg-primary transition-colors shadow-xs no-underline"
          >
            <PenSquare className="h-3.5 w-3.5" />
            Novo Artigo
          </Link>
        </div>
      </div>

      <Suspense fallback={null}>
        <PostsErrorBanner postsPromise={postsPromise} />
      </Suspense>

      {/* KPI Strip — fast core KPIs paint independently of heavier 30d analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <Suspense fallback={<SingleKpiSkeleton />}>
          <PublishedPostsKpi postsPromise={postsPromise} />
        </Suspense>

        <Suspense fallback={<SingleKpiSkeleton />}>
          <ViewsKpi
            analyticsPromise={analyticsPromise}
            postsPromise={postsPromise}
          />
        </Suspense>

        <Suspense fallback={<SingleKpiSkeleton />}>
          <UnreadLeadsKpi unreadLeadsPromise={unreadLeadsPromise} />
        </Suspense>

        <Suspense fallback={<SingleKpiSkeleton />}>
          <ReadTimeKpi analyticsPromise={analyticsPromise} />
        </Suspense>
      </div>

      {/* 30-day Compact Traffic Trend */}
      <Suspense fallback={<TrafficChartSkeleton />}>
        <TrafficTrendSection analyticsPromise={analyticsPromise} />
      </Suspense>

      {/* Middle Row: Recent Articles + Leads Inbox Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Suspense fallback={<RecentArticlesSkeleton />}>
          <RecentArticlesSection postsPromise={postsPromise} />
        </Suspense>

        <Suspense fallback={<RecentLeadsSkeleton />}>
          <RecentLeadsSection
            recentLeadsPromise={recentLeadsPromise}
            unreadLeadsPromise={unreadLeadsPromise}
          />
        </Suspense>
      </div>

      {/* Bottom Row: Top Performing Articles + Editorial/SEO Health Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<BottomCardSkeleton />}>
          <TopArticlesSection
            analyticsPromise={analyticsPromise}
            postsPromise={postsPromise}
          />
        </Suspense>

        <Suspense fallback={<BottomCardSkeleton />}>
          <EditorialAlertsSection postsPromise={postsPromise} />
        </Suspense>
      </div>
    </div>
  );
}
