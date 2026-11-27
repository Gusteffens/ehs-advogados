import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { CategoryFilter } from "@/components/blog/category-filter";
import { BlogSearch } from "@/components/blog/blog-search";
import { getBlogCategories, getPublishedBlogPosts } from "@/lib/data/blog";
import { SITE_CONFIG, TEAM_IMAGES } from "@/lib/site-config";
import type { BlogPostSummary } from "@/types/blog";

export const revalidate = 300;

const POSTS_PER_PAGE = 9;
const BLOG_DESCRIPTION =
  "Artigos e análises jurídicas sobre Direito Civil, Agronegócio, Ambiental e Penal pelos advogados da Erlo, Haas & Steffens.";

function normalizeSearchText(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getBadgeTextColorClass(
  hex: string | null | undefined
): "text-ink" | "text-cream" {
  if (!hex) return "text-ink";
  const cleaned = hex.trim().replace(/^#/, "");
  const normalized =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned;
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return "text-ink";
  }
  const r = Number.parseInt(normalized.slice(0, 2), 16) / 255;
  const g = Number.parseInt(normalized.slice(2, 4), 16) / 255;
  const b = Number.parseInt(normalized.slice(4, 6), 16) / 255;
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const luminance =
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return luminance > 0.35 ? "text-ink" : "text-cream";
}

function formatPostDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions
): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    ...options,
  });
}

function buildBlogPageHref(
  page: number,
  categoria?: string,
  searchQuery?: string
): string {
  const params = new URLSearchParams();
  if (categoria) params.set("categoria", categoria);
  if (searchQuery) params.set("q", searchQuery);
  if (page > 1) params.set("pagina", String(page));
  const qs = params.toString();
  return qs ? `/blog?${qs}` : "/blog";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const categoria =
    typeof resolvedParams?.categoria === "string"
      ? resolvedParams.categoria
      : undefined;
  const searchQuery =
    typeof resolvedParams?.q === "string"
      ? resolvedParams.q.trim()
      : undefined;
  const rawPage =
    typeof resolvedParams?.pagina === "string"
      ? Number.parseInt(resolvedParams.pagina, 10)
      : 1;
  const page = Number.isFinite(rawPage) && rawPage > 1 ? rawPage : 1;

  const title =
    page > 1 ? `Blog Jurídico — Página ${page}` : "Blog Jurídico";
  const canonicalPath = searchQuery
    ? "/blog"
    : buildBlogPageHref(page, categoria);
  const fullUrl = `${SITE_CONFIG.url}${canonicalPath}`;

  return {
    title,
    description: BLOG_DESCRIPTION,
    alternates: {
      canonical: canonicalPath,
    },
    ...(searchQuery && {
      robots: {
        index: false,
        follow: true,
      },
    }),
    openGraph: {
      title,
      description: BLOG_DESCRIPTION,
      type: "website",
      locale: "pt_BR",
      siteName: SITE_CONFIG.legalName,
      url: fullUrl,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: BLOG_DESCRIPTION,
    },
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const [filteredCategories, publishedPosts] = await Promise.all([
    getBlogCategories(),
    getPublishedBlogPosts(),
  ]);

  const categoria =
    typeof resolvedParams?.categoria === "string"
      ? resolvedParams.categoria
      : undefined;
  const searchQuery =
    typeof resolvedParams?.q === "string"
      ? resolvedParams.q.trim()
      : undefined;
  const rawPage =
    typeof resolvedParams?.pagina === "string"
      ? Number.parseInt(resolvedParams.pagina, 10)
      : 1;

  let safePosts: BlogPostSummary[] = publishedPosts;

  if (categoria) {
    safePosts = safePosts.filter((post) => post.categories?.slug === categoria);
  }

  if (searchQuery) {
    const q = normalizeSearchText(searchQuery);
    safePosts = safePosts.filter(
      (post) =>
        normalizeSearchText(post.title).includes(q) ||
        normalizeSearchText(post.excerpt).includes(q) ||
        normalizeSearchText(post.categories?.name).includes(q) ||
        normalizeSearchText(post.authors?.full_name).includes(q)
    );
  }

  const hasFilters = Boolean(categoria || searchQuery);
  const featuredPost =
    !hasFilters && safePosts.length > 0 ? safePosts[0] : null;
  const remainingPosts = featuredPost ? safePosts.slice(1) : safePosts;

  const totalPages = Math.max(1, Math.ceil(remainingPosts.length / POSTS_PER_PAGE));
  const currentPage =
    Number.isFinite(rawPage) && rawPage >= 1
      ? Math.min(rawPage, totalPages)
      : 1;

  const showFeatured = Boolean(featuredPost && currentPage === 1);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const gridPosts = remainingPosts.slice(
    startIndex,
    startIndex + POSTS_PER_PAGE
  );

  const emptyMessage =
    searchQuery && categoria
      ? `Nenhum artigo encontrado para "${searchQuery}" nesta categoria.`
      : searchQuery
        ? `Nenhum artigo encontrado para "${searchQuery}".`
        : categoria
          ? "Nenhum artigo encontrado nesta categoria."
          : "Nenhum artigo publicado ainda.";

  return (
    <>
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 bg-ink relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-[20%] w-px h-48 bg-gradient-to-b from-gold/12 to-transparent pointer-events-none" />
        <Container className="relative">
          <span className="inline-block font-body text-sm font-semibold uppercase tracking-[0.25em] text-gold mb-4">
            Blog Jurídico
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-cream leading-tight mb-4 max-w-2xl">
            Artigos e{" "}
            <span className="text-gold">informações atualizadas</span>
          </h1>
          <p className="text-cream/75 text-lg max-w-xl leading-relaxed">
            Análises, orientações e as últimas novidades do mundo jurídico,
            escritas por nossos especialistas.
          </p>
        </Container>
      </section>

      <section className="py-5 bg-cream/95 backdrop-blur-md border-b border-forest-600/12 sticky top-[68px] z-20">
        <Container>
          <div className="flex flex-col gap-4">
            <Suspense fallback={<div className="h-10" />}>
              <BlogSearch currentQuery={searchQuery} />
            </Suspense>
            <Suspense fallback={<div className="h-10" />}>
              <CategoryFilter
                categories={filteredCategories}
                currentCategory={categoria}
              />
            </Suspense>
          </div>
        </Container>
      </section>

      {showFeatured && featuredPost && (
        <section className="pt-12 pb-10 bg-cream">
          <Container>
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch rounded-2xl overflow-hidden bg-white border border-forest-600/15 shadow-sm hover:shadow-xl hover:shadow-ink/8 transition-all duration-400 no-underline"
            >
              <div className="relative aspect-[16/9] lg:aspect-auto lg:min-h-[320px] bg-primary overflow-hidden">
                {featuredPost.cover_image_url ? (
                  <Image
                    src={featuredPost.cover_image_url}
                    alt={featuredPost.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center">
                        <span className="font-display text-xl font-bold text-gold">
                          EHS
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gold text-ink">
                    Em destaque
                  </span>
                </div>
              </div>

              <div className="flex flex-col justify-between p-8 lg:p-10">
                <div>
                  {featuredPost.categories?.name && (
                    <span className="inline-block text-xs font-semibold uppercase tracking-[0.15em] text-gold-dark mb-3">
                      {featuredPost.categories.name}
                    </span>
                  )}
                  <h2 className="font-display text-2xl lg:text-[1.85rem] font-bold text-ink leading-snug mb-4 group-hover:text-forest-600 transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-forest-600/85 leading-relaxed line-clamp-3 mb-6">
                    {featuredPost.excerpt}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-5 border-t border-forest-600/10">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const authorSlug = featuredPost.authors?.slug;
                      const photo = authorSlug
                        ? (TEAM_IMAGES[authorSlug] ?? null)
                        : null;

                      return photo ? (
                        <div className="relative h-8 w-8 rounded-full overflow-hidden shrink-0">
                          <Image
                            src={photo}
                            alt={featuredPost.authors?.full_name ?? "Autor"}
                            fill
                            sizes="32px"
                            className="object-cover object-top"
                          />
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-gold font-display text-xs font-bold shrink-0">
                          EHS
                        </div>
                      );
                    })()}
                    <div>
                      <p className="text-ink text-xs font-semibold leading-none">
                        {featuredPost.authors?.full_name ?? "Equipe EHS"}
                      </p>
                      <p className="text-forest-600/70 text-xs mt-0.5">
                        {formatPostDate(
                          featuredPost.published_at || featuredPost.created_at,
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-forest-600/70">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{featuredPost.reading_time_min || 5} min</span>
                  </div>
                </div>
              </div>
            </Link>
          </Container>
        </section>
      )}

      <section
        className={
          showFeatured
            ? "pb-24 lg:pb-32 bg-cream"
            : "py-12 lg:py-20 bg-cream"
        }
      >
        <Container>
          {gridPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridPosts.map((post) => {
                  const authorSlug = post.authors?.slug;
                  const authorPhoto = authorSlug
                    ? (TEAM_IMAGES[authorSlug] ?? null)
                    : null;
                  const authorName = post.authors?.full_name ?? "Equipe EHS";

                  return (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="group flex flex-col rounded-2xl bg-white border border-forest-600/15 overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/8 hover:border-forest-600/30 transition-all duration-300 no-underline"
                    >
                      <div className="relative aspect-video bg-primary overflow-hidden">
                        {post.cover_image_url ? (
                          <Image
                            src={post.cover_image_url}
                            alt={post.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="font-display text-lg font-bold text-gold/40">
                              EHS
                            </span>
                          </div>
                        )}
                        {post.categories?.name && (
                          <div className="absolute top-3 left-3 z-10">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${getBadgeTextColorClass(
                                post.categories.color_hex ?? "#E8D49A"
                              )}`}
                              style={{
                                backgroundColor:
                                  post.categories.color_hex ?? "#E8D49A",
                              }}
                            >
                              {post.categories.name}
                            </span>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-ink">
                            <ArrowUpRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col flex-1 p-6">
                        <h3 className="font-display font-bold text-ink text-[1.05rem] leading-snug mb-2 group-hover:text-forest-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-forest-600/75 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-forest-600/10 mt-auto">
                          <div className="flex items-center gap-2">
                            {authorPhoto ? (
                              <div className="relative h-7 w-7 rounded-full overflow-hidden shrink-0">
                                <Image
                                  src={authorPhoto}
                                  alt={authorName}
                                  fill
                                  sizes="28px"
                                  className="object-cover object-top"
                                />
                              </div>
                            ) : (
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-gold font-display text-[10px] font-bold shrink-0">
                                EHS
                              </div>
                            )}
                            <div>
                              <p className="text-ink text-xs font-semibold leading-none">
                                {authorName}
                              </p>
                              <p className="text-forest-600/65 text-[10px] mt-0.5">
                                {formatPostDate(
                                  post.published_at || post.created_at,
                                  {
                                    day: "numeric",
                                    month: "short",
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-forest-600/65 text-xs">
                            <Clock className="h-3 w-3" />
                            <span>{post.reading_time_min || 5} min</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  aria-label="Paginação do blog"
                  className="mt-12 flex items-center justify-center gap-2"
                >
                  {currentPage > 1 ? (
                    <Link
                      href={buildBlogPageHref(
                        currentPage - 1,
                        categoria,
                        searchQuery
                      )}
                      className="inline-flex items-center gap-1 rounded-xl border border-forest-200 bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-forest-50 transition-colors no-underline"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-xl border border-forest-100 bg-white/50 px-4 py-2 text-sm font-medium text-forest-300 cursor-not-allowed">
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <Link
                          key={pageNum}
                          href={buildBlogPageHref(
                            pageNum,
                            categoria,
                            searchQuery
                          )}
                          aria-current={
                            pageNum === currentPage ? "page" : undefined
                          }
                          className={
                            pageNum === currentPage
                              ? "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-cream text-sm font-semibold no-underline"
                              : "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-forest-200 bg-white text-ink text-sm font-medium hover:bg-forest-50 transition-colors no-underline"
                          }
                        >
                          {pageNum}
                        </Link>
                      )
                    )}
                  </div>

                  {currentPage < totalPages ? (
                    <Link
                      href={buildBlogPageHref(
                        currentPage + 1,
                        categoria,
                        searchQuery
                      )}
                      className="inline-flex items-center gap-1 rounded-xl border border-forest-200 bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-forest-50 transition-colors no-underline"
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-xl border border-forest-100 bg-white/50 px-4 py-2 text-sm font-medium text-forest-300 cursor-not-allowed">
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  )}
                </nav>
              )}
            </>
          ) : !showFeatured ? (
            <div className="text-center py-24">
              <p className="text-forest-600/75 text-lg">{emptyMessage}</p>
            </div>
          ) : null}
        </Container>
      </section>
    </>
  );
}
