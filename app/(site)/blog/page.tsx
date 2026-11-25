import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowUpRight } from "lucide-react";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { CategoryFilter } from "@/components/blog/category-filter";
import { BlogSearch } from "@/components/blog/blog-search";
import { getBlogCategories, getPublishedBlogPosts } from "@/lib/data/blog";
import { TEAM_IMAGES } from "@/lib/site-config";
import type { BlogPostSummary } from "@/types/blog";

export const metadata: Metadata = {
  title: "Blog Jurídico",
  description:
    "Artigos e análises jurídicas sobre Direito Civil, Agronegócio, Ambiental e Penal pelos advogados da Erlo, Haas & Steffens.",
};

export const revalidate = 300;

function formatPostDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions
): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    ...options,
  });
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

  let safePosts: BlogPostSummary[] = publishedPosts;

  if (categoria) {
    safePosts = safePosts.filter((post) => post.categories?.slug === categoria);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    safePosts = safePosts.filter(
      (post) =>
        post.title.toLowerCase().includes(q) ||
        post.excerpt?.toLowerCase().includes(q)
    );
  }

  const featuredPost =
    !categoria && !searchQuery && safePosts.length > 0 ? safePosts[0] : null;
  const gridPosts = featuredPost ? safePosts.slice(1) : safePosts;

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
      <section className="pt-32 pb-28 sm:pb-36 lg:pt-40 lg:pb-40 bg-ink relative overflow-hidden">
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
        <div
          className="absolute inset-x-0 -bottom-px h-24 sm:h-32 pointer-events-none z-20 fade-to-cream"
          aria-hidden="true"
        />
      </section>

      <section className="py-6 bg-cream sticky top-16 z-20">
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

      {featuredPost && (
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
          featuredPost
            ? "pb-24 lg:pb-32 bg-cream"
            : "py-12 lg:py-20 bg-cream"
        }
      >
        <Container>
          {gridPosts.length > 0 ? (
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
                            className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-ink"
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
          ) : (
            <div className="text-center py-24">
              <p className="text-forest-600/75 text-lg">{emptyMessage}</p>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
