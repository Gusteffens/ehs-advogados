import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  Clock,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import {
  getPublishedBlogPostBySlug,
  getPublishedBlogSlugs,
  getRelatedBlogPosts,
} from "@/lib/data/blog";
import { PostViewTracker } from "@/components/blog/post-view-tracker";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { ShareButtons } from "@/components/blog/share-buttons";
import { BlogContextualCta } from "@/components/blog/contextual-cta";
import { processBlogHtmlWithToc } from "@/lib/sanitize-blog-html";
import { SITE_CONFIG, TEAM_IMAGES } from "@/lib/site-config";
import type { BlogAuthorSummary, BlogCategorySummary } from "@/types/blog";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function formatLongDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function generateStaticParams() {
  const slugs = await getPublishedBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    return { title: "Artigo não encontrado" };
  }

  const title = post.title;
  const description =
    post.excerpt ?? `Artigo do Blog Jurídico da ${SITE_CONFIG.legalName}.`;
  const postUrl = `${SITE_CONFIG.url}/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title,
      description,
      type: "article",
      locale: "pt_BR",
      siteName: SITE_CONFIG.legalName,
      url: postUrl,
      ...(post.cover_image_url && {
        images: [
          {
            url: post.cover_image_url,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(post.cover_image_url && { images: [post.cover_image_url] }),
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const [{ html: sanitizedHtml, headings }, relatedPosts] = await Promise.all([
    Promise.resolve(processBlogHtmlWithToc(post.content ?? "")),
    getRelatedBlogPosts(post.category_id ?? null, post.id, 3),
  ]);

  const publishedDate = post.published_at
    ? formatLongDate(post.published_at)
    : null;

  const showUpdatedAt =
    Boolean(post.updated_at && post.published_at) &&
    new Date(post.updated_at!).getTime() -
      new Date(post.published_at!).getTime() >
      TWENTY_FOUR_HOURS_MS;
  const updatedDate = showUpdatedAt ? formatLongDate(post.updated_at!) : null;

  const author = post.authors as BlogAuthorSummary | null;
  const authorName = author?.full_name ?? "Equipe EHS";
  const authorSlug = author?.slug ?? null;
  const authorPhoto = authorSlug ? (TEAM_IMAGES[authorSlug] ?? null) : null;
  const authorPhotoFallback = "/images/logo-ehs-monogram.png";

  const category = post.categories as BlogCategorySummary | null;
  const categoryColor = category?.color_hex ?? "#E8D49A";
  const categoryName = category?.name ?? null;
  const categorySlug = category?.slug ?? null;

  const postUrl = `${SITE_CONFIG.url}/blog/${post.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description:
      post.excerpt ?? `Artigo do Blog Jurídico da ${SITE_CONFIG.legalName}.`,
    author: {
      "@type": "Person",
      name: author?.full_name ?? SITE_CONFIG.legalName,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.legalName,
      url: SITE_CONFIG.url,
    },
    datePublished: post.published_at,
    dateModified: post.updated_at ?? post.published_at,
    ...(post.cover_image_url && { image: post.cover_image_url }),
    url: postUrl,
  };

  const breadcrumbItems = [
    { name: "Início", item: SITE_CONFIG.url },
    { name: "Blog", item: `${SITE_CONFIG.url}/blog` },
    ...(categoryName && categorySlug
      ? [
          {
            name: categoryName,
            item: `${SITE_CONFIG.url}/blog?categoria=${encodeURIComponent(categorySlug)}`,
          },
        ]
      : []),
    { name: post.title, item: postUrl },
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };

  const hasToc = headings.length >= 2;

  return (
    <div className="min-h-screen bg-cream">
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PostViewTracker postId={post.id} />

      <section className="pt-32 pb-20 lg:pt-40 lg:pb-24 bg-ink relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-[35%] w-px h-32 bg-gradient-to-b from-gold/15 to-transparent pointer-events-none" />

        <Container className="relative">
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs text-cream/55 mb-6"
          >
            <Link
              href="/"
              className="hover:text-gold transition-colors no-underline"
            >
              Início
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-cream/30" />
            <Link
              href="/blog"
              className="hover:text-gold transition-colors no-underline"
            >
              Blog
            </Link>
            {categoryName && categorySlug && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-cream/30" />
                <Link
                  href={`/blog?categoria=${encodeURIComponent(categorySlug)}`}
                  className="hover:text-gold transition-colors no-underline"
                >
                  {categoryName}
                </Link>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5 text-cream/30" />
            <span className="text-cream/85 line-clamp-1 max-w-[260px] sm:max-w-md">
              {post.title}
            </span>
          </nav>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-cream/60 hover:text-gold transition-colors mb-8 no-underline group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Voltar ao Blog
          </Link>

          {categoryName && (
            <div className="mb-5">
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-ink"
                style={{ backgroundColor: categoryColor }}
              >
                {categoryName}
              </span>
            </div>
          )}

          <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.85rem] font-bold text-cream leading-tight max-w-3xl mb-8">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="flex items-center gap-2.5">
              <div className="relative h-10 w-10 rounded-full overflow-hidden shrink-0 ring-2 ring-gold/20">
                <Image
                  src={authorPhoto ?? authorPhotoFallback}
                  alt={authorName}
                  fill
                  sizes="40px"
                  className="object-cover object-center"
                />
              </div>
              <span className="text-cream text-sm font-medium">
                {authorName}
              </span>
            </div>

            {publishedDate && (
              <>
                <span className="text-cream/25 text-sm">·</span>
                <span className="flex items-center gap-1.5 text-sm text-cream/65">
                  <Calendar className="h-3.5 w-3.5" />
                  {publishedDate}
                </span>
              </>
            )}

            {updatedDate && (
              <>
                <span className="text-cream/25 text-sm">·</span>
                <span className="flex items-center gap-1.5 text-sm text-gold/90">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Atualizado em {updatedDate}
                </span>
              </>
            )}

            <span className="text-cream/25 text-sm">·</span>
            <span className="flex items-center gap-1.5 text-sm text-cream/65">
              <Clock className="h-3.5 w-3.5" />
              {post.reading_time_min ?? 5} min de leitura
            </span>

            {typeof post.views === "number" && post.views > 0 && (
              <>
                <span className="text-cream/25 text-sm">·</span>
                <span className="flex items-center gap-1.5 text-sm text-cream/65">
                  <Eye className="h-3.5 w-3.5" />
                  {post.views}{" "}
                  {post.views === 1 ? "visualização" : "visualizações"}
                </span>
              </>
            )}
          </div>
        </Container>
      </section>

      {post.cover_image_url && (
        <section className="bg-cream pt-10 pb-4">
          <Container>
            <div className="relative aspect-video max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-lg border border-forest-600/10">
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 896px"
              />
            </div>
          </Container>
        </section>
      )}

      <section className="py-12 lg:py-16 bg-cream">
        <Container>
          {hasToc ? (
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-10 items-start">
              <div className="min-w-0">
                <TableOfContents headings={headings} variant="mobile" />
                <article
                  data-article-content
                  className="prose-editorial max-w-2xl"
                  dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />
                <div className="mt-10 pt-6 border-t border-forest-600/15 max-w-2xl">
                  <ShareButtons postId={post.id} title={post.title} url={postUrl} />
                </div>
              </div>
              <TableOfContents headings={headings} variant="desktop" />
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <article
                data-article-content
                className="prose-editorial"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
              />
              <div className="mt-10 pt-6 border-t border-forest-600/15">
                <ShareButtons postId={post.id} title={post.title} url={postUrl} />
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* Author box */}
      <section className="pb-16 bg-cream">
        <Container>
          <div className="max-w-2xl mx-auto rounded-2xl bg-primary p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="relative h-20 w-20 rounded-2xl overflow-hidden shrink-0 shadow-lg ring-2 ring-gold/10">
                <Image
                  src={authorPhoto ?? authorPhotoFallback}
                  alt={authorName}
                  fill
                  sizes="80px"
                  className="object-cover object-center"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-gold/80 mb-1">
                  Escrito por
                </p>
                <h3 className="font-display text-xl font-bold text-cream mb-1">
                  {authorName}
                </h3>
                {author?.oab && (
                  <p className="text-sm text-gold mb-3">{author.oab}</p>
                )}
                {author?.specialties && author.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {author.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="px-2.5 py-0.5 text-xs font-medium rounded-lg bg-gold/10 text-gold border border-gold/20"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}
                {author?.bio && (
                  <p className="text-cream/75 text-sm leading-relaxed">
                    {author.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="pb-20 bg-cream">
          <Container>
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark mb-1">
                    Continue lendo
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink">
                    Artigos Relacionados
                  </h2>
                </div>
                <Link
                  href="/blog"
                  className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-forest-700 hover:text-ink no-underline transition-colors"
                >
                  Ver todos
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.id}
                    href={`/blog/${related.slug}`}
                    className="group flex flex-col rounded-2xl bg-white border border-forest-600/15 overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/8 transition-all duration-300 no-underline"
                  >
                    <div className="relative aspect-video bg-primary overflow-hidden">
                      {related.cover_image_url ? (
                        <Image
                          src={related.cover_image_url}
                          alt={related.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-display text-lg font-bold text-gold/40">
                            EHS
                          </span>
                        </div>
                      )}
                      {related.categories?.name && (
                        <div className="absolute top-3 left-3 z-10">
                          <span
                            className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-ink"
                            style={{
                              backgroundColor:
                                related.categories.color_hex ?? "#E8D49A",
                            }}
                          >
                            {related.categories.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col flex-1 p-5">
                      <h3 className="font-display font-bold text-ink text-base leading-snug mb-2 group-hover:text-forest-600 transition-colors line-clamp-2">
                        {related.title}
                      </h3>
                      {related.excerpt && (
                        <p className="text-forest-600/75 text-xs leading-relaxed line-clamp-2 mb-4 flex-1">
                          {related.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-forest-600/10 text-[11px] text-forest-600/70 mt-auto">
                        <span>
                          {formatShortDate(
                            related.published_at || related.created_at
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {related.reading_time_min ?? 5} min
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Contextual CTA */}
      <BlogContextualCta
        postId={post.id}
        postTitle={post.title}
        postSlug={post.slug}
        categorySlug={categorySlug}
        categoryName={categoryName}
      />
    </div>
  );
}
