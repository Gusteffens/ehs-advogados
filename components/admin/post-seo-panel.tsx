"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Circle,
  Globe,
  RefreshCw,
  Tag,
  X,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import type { CategoryOption } from "@/types/blog";

const inputClasses =
  "w-full rounded-xl border border-forest-200 bg-white px-3.5 py-2.5 text-ink text-sm placeholder:text-forest-600/60 focus:outline-none focus:ring-2 focus:ring-champagne-500/50 focus:border-gold transition-all";

const displaySiteHost = SITE_CONFIG.url.replace(/^https?:\/\//, "");

interface PostSeoPanelProps {
  title: string;
  slug: string;
  onSlugChange: (value: string) => void;
  onRegenerateSlug: () => void;
  excerpt: string;
  onExcerptChange: (value: string) => void;
  categoryId: string;
  onCategoryChange: (value: string) => void;
  categories: CategoryOption[];
  coverUrl: string;
  wordCount: number;
  publishedAtLocal: string;
  onPublishedAtLocalChange: (value: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

interface SeoCheckItem {
  id: string;
  label: string;
  passed: boolean;
  hint: string;
}

export function PostSeoPanel({
  title,
  slug,
  onSlugChange,
  onRegenerateSlug,
  excerpt,
  onExcerptChange,
  categoryId,
  onCategoryChange,
  categories,
  coverUrl,
  wordCount,
  publishedAtLocal,
  onPublishedAtLocalChange,
  tags,
  onTagsChange,
}: PostSeoPanelProps) {
  const [tagInput, setTagInput] = useState("");

  const seoChecks = useMemo<SeoCheckItem[]>(() => {
    const titleLen = title.trim().length;
    const excerptLen = excerpt.trim().length;
    const slugClean = slug.trim();

    return [
      {
        id: "title",
        label: "Título otimizado (30–65 caracteres)",
        passed: titleLen >= 30 && titleLen <= 65,
        hint: `${titleLen} caracteres`,
      },
      {
        id: "excerpt",
        label: "Meta descrição / resumo (100–160 caracteres)",
        passed: excerptLen >= 100 && excerptLen <= 160,
        hint: `${excerptLen}/160`,
      },
      {
        id: "cover",
        label: "Imagem de capa definida",
        passed: Boolean(coverUrl),
        hint: coverUrl ? "OK" : "Ausente",
      },
      {
        id: "slug",
        label: "Slug amigável configurado",
        passed: slugClean.length >= 3 && /^[a-z0-9-]+$/.test(slugClean),
        hint: slugClean ? `/${slugClean}` : "Automático",
      },
      {
        id: "category",
        label: "Categoria jurídica selecionada",
        passed: Boolean(categoryId),
        hint: categoryId ? "OK" : "Pendente",
      },
      {
        id: "length",
        label: "Extensão editorial (≥ 300 palavras)",
        passed: wordCount >= 300,
        hint: `${wordCount} palavras`,
      },
    ];
  }, [title, excerpt, coverUrl, slug, categoryId, wordCount]);

  const passedCount = seoChecks.filter((c) => c.passed).length;
  const scorePct = Math.round((passedCount / seoChecks.length) * 100);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const addTag = (raw: string) => {
    const normalized = raw.trim().replace(/^#/, "").slice(0, 40);
    if (!normalized) return;
    if (tags.some((t) => t.toLowerCase() === normalized.toLowerCase())) {
      setTagInput("");
      return;
    }
    if (tags.length >= 12) return;
    onTagsChange([...tags, normalized]);
    setTagInput("");
  };

  const removeTag = (target: string) => {
    onTagsChange(tags.filter((t) => t !== target));
  };

  return (
    <div className="space-y-5">
      {/* Category & Publish Date */}
      <div className="rounded-2xl bg-white border border-forest-100 p-5 shadow-2xs space-y-4">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-600">
          Taxonomia & Publicação
        </span>

        {/* Category selector */}
        <div>
          <label
            htmlFor="seo-category"
            className="flex items-center justify-between text-xs font-medium text-forest-700 mb-1.5"
          >
            <span>Categoria</span>
            {selectedCategory?.color_hex && (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-forest-600">
                <span
                  className="h-2.5 w-2.5 rounded-full border border-ink/15"
                  style={{ backgroundColor: selectedCategory.color_hex }}
                />
                {selectedCategory.name}
              </span>
            )}
          </label>
          <div className="relative">
            <select
              id="seo-category"
              value={categoryId}
              onChange={(event) => onCategoryChange(event.target.value)}
              className={`${inputClasses} appearance-none pr-9`}
            >
              <option value="">Sem categoria</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-forest-600" />
          </div>
        </div>

        {/* Custom published_at picker */}
        <div>
          <label
            htmlFor="seo-published-at"
            className="flex items-center gap-1.5 text-xs font-medium text-forest-700 mb-1.5"
          >
            <CalendarClock className="h-3.5 w-3.5 text-gold-dark" />
            Data de Publicação
          </label>
          <input
            id="seo-published-at"
            type="datetime-local"
            value={publishedAtLocal}
            onChange={(event) => onPublishedAtLocalChange(event.target.value)}
            className={inputClasses}
          />
          <p className="text-[11px] text-forest-600/75 mt-1.5">
            Opcional. Se vazio, usa a data atual ao publicar e preserva a data original ao alternar status.
          </p>
        </div>

        {/* Tags */}
        <div>
          <label
            htmlFor="seo-tags"
            className="flex items-center gap-1.5 text-xs font-medium text-forest-700 mb-1.5"
          >
            <Tag className="h-3.5 w-3.5 text-gold-dark" />
            Tags (opcional)
          </label>
          <div className="flex gap-1.5">
            <input
              id="seo-tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag(tagInput);
                }
              }}
              placeholder="Digite e pressione Enter..."
              className={`${inputClasses} py-2 text-xs`}
            />
            <button
              type="button"
              onClick={() => addTag(tagInput)}
              disabled={!tagInput.trim()}
              className="shrink-0 rounded-xl border border-forest-200 bg-cream-light px-3 text-xs font-semibold text-ink hover:bg-cream disabled:opacity-40 transition-colors"
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-lg bg-cream border border-forest-200/80 px-2 py-0.5 text-[11px] font-medium text-ink"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    aria-label={`Remover tag ${tag}`}
                    className="text-forest-600 hover:text-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slug + Excerpt */}
      <div className="rounded-2xl bg-white border border-forest-100 p-5 shadow-2xs space-y-4">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-600">
          URL & Meta Descrição
        </span>

        {/* Slug */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="seo-slug"
              className="text-xs font-medium text-forest-700"
            >
              Slug da URL
            </label>
            <button
              type="button"
              onClick={onRegenerateSlug}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-gold-dark hover:text-ink transition-colors"
              title="Gerar slug a partir do título"
            >
              <RefreshCw className="h-3 w-3" />
              Gerar do título
            </button>
          </div>
          <div className="flex items-center rounded-xl border border-forest-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-champagne-500/50 focus-within:border-gold transition-all">
            <span className="px-2.5 py-2.5 text-[11px] font-medium text-forest-600/80 bg-cream/60 border-r border-forest-200 shrink-0">
              /blog/
            </span>
            <input
              id="seo-slug"
              type="text"
              value={slug}
              onChange={(event) => onSlugChange(event.target.value)}
              placeholder="url-do-artigo"
              className="flex-1 min-w-0 px-2.5 py-2.5 text-xs text-ink placeholder:text-forest-600/60 focus:outline-none"
            />
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="seo-excerpt"
              className="text-xs font-medium text-forest-700"
            >
              Resumo (Meta Description)
            </label>
            <span
              className={cn(
                "text-[11px] font-medium tabular-nums",
                excerpt.length >= 100 && excerpt.length <= 160
                  ? "text-emerald-700"
                  : excerpt.length > 160
                    ? "text-amber-700"
                    : "text-forest-600/75"
              )}
            >
              {excerpt.length}/160
            </span>
          </div>
          <textarea
            id="seo-excerpt"
            value={excerpt}
            onChange={(event) => onExcerptChange(event.target.value)}
            rows={4}
            placeholder="Resumo conciso do artigo para listagem do blog e resultados de busca no Google..."
            className={`${inputClasses} resize-none text-xs leading-relaxed`}
          />
        </div>
      </div>

      {/* Live Google SERP Preview */}
      <div className="rounded-2xl bg-primary p-5 text-cream shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold/90">
            <Globe className="h-3.5 w-3.5" />
            Prévia no Google (SERP)
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums",
              scorePct >= 80
                ? "bg-emerald-400/20 text-emerald-200"
                : scorePct >= 50
                  ? "bg-gold/20 text-gold"
                  : "bg-red-400/20 text-red-200"
            )}
          >
            SEO {scorePct}%
          </span>
        </div>

        <div className="rounded-xl bg-ink/55 border border-forest-700/70 p-3.5 space-y-1">
          <p className="text-[11px] text-emerald-300/90 truncate">
            {displaySiteHost} › blog › {slug || "url-do-artigo"}
          </p>
          <p className="text-sm font-semibold text-blue-300 line-clamp-1">
            {title || "Título do artigo"} | {SITE_CONFIG.name}
          </p>
          <p className="text-xs text-cream/70 line-clamp-2 leading-relaxed">
            {excerpt ||
              "O resumo do artigo aparecerá aqui nos resultados orgânicos do Google e ao compartilhar o link."}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-1.5 w-full rounded-full bg-forest-800 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                scorePct >= 80
                  ? "bg-emerald-400"
                  : scorePct >= 50
                    ? "bg-gold"
                    : "bg-amber-400"
              )}
              style={{ width: `${scorePct}%` }}
            />
          </div>

          <ul className="mt-3 space-y-1.5">
            {seoChecks.map((check) => (
              <li
                key={check.id}
                className="flex items-center justify-between gap-2 text-[11px]"
              >
                <span
                  className={cn(
                    "flex items-center gap-1.5 min-w-0",
                    check.passed ? "text-cream/90" : "text-cream/55"
                  )}
                >
                  {check.passed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 shrink-0 text-cream/35" />
                  )}
                  <span className="truncate">{check.label}</span>
                </span>
                <span className="shrink-0 text-[10px] text-gold/80 tabular-nums">
                  {check.hint}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
