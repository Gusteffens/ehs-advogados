import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { CategoryFilter } from "@/components/blog/category-filter";
import { BlogSearch } from "@/components/blog/blog-search";
import { Suspense } from "react";
import { getBlogCategories, getPublishedBlogPosts } from "@/lib/data/blog";
import type { BlogPostSummary } from "@/types/blog";

export const metadata: Metadata = {
    title: "Blog Jurídico",
    description:
        "Artigos e análises jurídicas sobre Direito Civil, Agronegócio, Ambiental e Penal pelos advogados da Erlo, Haas & Steffens.",
};

export const revalidate = 300;

const teamImages: Record<string, string> = {
    "alessandra-steffens": "/images/team/alessandra-steffens.png",
    "jacson-erlo": "/images/team/jacson-erlo.png",
    "jean-erlo": "/images/team/jean-erlo.png",
    "luiza-haas": "/images/team/luiza-haas.png",
    "maisa-christ": "/images/team/maisa-christ.png",
};

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

    const categoria = resolvedParams?.categoria as string | undefined;
    const searchQuery = (resolvedParams?.q as string | undefined)?.trim();
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

    return (
        <>
            <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 bg-[#0D1812] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#E8D49A]/5 rounded-full blur-[140px] pointer-events-none" />
                <div className="absolute bottom-0 left-[20%] w-px h-48 bg-gradient-to-b from-[#E8D49A]/12 to-transparent pointer-events-none" />
                <Container className="relative">
                    <span className="inline-block font-body text-sm font-semibold uppercase tracking-[0.25em] text-[#E8D49A] mb-4">
                        Blog Jurídico
                    </span>
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#EEEDE5] leading-tight mb-4 max-w-2xl">
                        Artigos e{" "}
                        <span className="text-[#E8D49A]">informações atualizadas</span>
                    </h1>
                    <p className="text-[#EEEDE5]/70 text-lg max-w-xl leading-relaxed">
                        Análises, orientações e as últimas novidades do mundo jurídico,
                        escritas por nossos especialistas.
                    </p>
                </Container>
            </section>

            <section className="py-6 bg-[#EEEDE5] sticky top-16 z-20">
                <Container>
                    <div className="flex flex-col gap-4">
                        <Suspense fallback={<div className="h-10" />}>
                            <BlogSearch
                                key={`blog-search-${searchQuery ?? ""}`}
                                currentQuery={searchQuery}
                            />
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
                <section className="pt-12 pb-10 bg-[#EEEDE5]">
                    <Container>
                        <Link
                            href={`/blog/${featuredPost.slug}`}
                            className="group grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch rounded-2xl overflow-hidden bg-white border border-[#3B5A3C]/15 shadow-sm hover:shadow-xl hover:shadow-[#0D1812]/8 transition-all duration-400 no-underline"
                        >
                            <div className="relative aspect-[16/9] lg:aspect-auto lg:min-h-[320px] bg-[#1B2D1E] overflow-hidden">
                                {featuredPost.cover_image_url ? (
                                    <Image
                                        src={featuredPost.cover_image_url}
                                        alt={featuredPost.title}
                                        fill
                                        priority
                                        className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 rounded-2xl bg-[#E8D49A]/10 flex items-center justify-center">
                                                <span className="font-display text-xl font-bold text-[#E8D49A]">
                                                    EHS
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 z-10">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8D49A] text-[#0D1812]">
                                        Em destaque
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col justify-between p-8 lg:p-10">
                                <div>
                                    {featuredPost.categories?.name && (
                                        <span className="inline-block text-xs font-semibold uppercase tracking-[0.15em] text-[#877249] mb-3">
                                            {featuredPost.categories.name}
                                        </span>
                                    )}
                                    <h2 className="font-display text-2xl lg:text-[1.85rem] font-bold text-[#0D1812] leading-snug mb-4 group-hover:text-[#3B5A3C] transition-colors">
                                        {featuredPost.title}
                                    </h2>
                                    <p className="text-[#3B5A3C]/80 leading-relaxed line-clamp-3 mb-6">
                                        {featuredPost.excerpt}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between pt-5 border-t border-[#3B5A3C]/10">
                                    <div className="flex items-center gap-3">
                                        {(() => {
                                            const authorSlug = featuredPost.authors?.slug;
                                            const photo = authorSlug
                                                ? teamImages[authorSlug]
                                                : null;

                                            return photo ? (
                                                <div className="relative h-8 w-8 rounded-full overflow-hidden shrink-0">
                                                    <Image
                                                        src={photo}
                                                        alt={
                                                            featuredPost.authors?.full_name ??
                                                            "Autor"
                                                        }
                                                        fill
                                                        className="object-cover object-top"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B2D1E] text-[#E8D49A] font-display text-xs font-bold shrink-0">
                                                    EHS
                                                </div>
                                            );
                                        })()}
                                        <div>
                                            <p className="text-[#0D1812] text-xs font-semibold leading-none">
                                                {featuredPost.authors?.full_name ?? "Equipe EHS"}
                                            </p>
                                            <p className="text-[#3B5A3C]/60 text-xs mt-0.5">
                                                {new Date(
                                                    featuredPost.published_at ||
                                                        featuredPost.created_at
                                                ).toLocaleDateString("pt-BR", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-[#3B5A3C]/60">
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
                        ? "pb-24 lg:pb-32 bg-[#EEEDE5]"
                        : "py-12 lg:py-20 bg-[#EEEDE5]"
                }
            >
                <Container>
                    {gridPosts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {gridPosts.map((post) => {
                                const authorSlug = post.authors?.slug;
                                const authorPhoto = authorSlug
                                    ? teamImages[authorSlug]
                                    : null;
                                const authorName =
                                    post.authors?.full_name ?? "Equipe EHS";

                                return (
                                    <Link
                                        key={post.slug}
                                        href={`/blog/${post.slug}`}
                                        className="group flex flex-col rounded-2xl bg-white border border-[#3B5A3C]/15 overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0D1812]/8 hover:border-[#3B5A3C]/30 transition-all duration-300 no-underline"
                                    >
                                        <div className="relative aspect-video bg-[#1B2D1E] overflow-hidden">
                                            {post.cover_image_url ? (
                                                <Image
                                                    src={post.cover_image_url}
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="font-display text-lg font-bold text-[#E8D49A]/40">
                                                        EHS
                                                    </span>
                                                </div>
                                            )}
                                            {post.categories?.name && (
                                                <div className="absolute top-3 left-3 z-10">
                                                    <span
                                                        className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-[#0D1812]"
                                                        style={{
                                                            backgroundColor:
                                                                post.categories.color_hex ??
                                                                "#E8D49A",
                                                        }}
                                                    >
                                                        {post.categories.name}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E8D49A] text-[#0D1812]">
                                                    <ArrowUpRight className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col flex-1 p-6">
                                            <h3 className="font-display font-bold text-[#0D1812] text-[1.05rem] leading-snug mb-2 group-hover:text-[#3B5A3C] transition-colors line-clamp-2">
                                                {post.title}
                                            </h3>
                                            <p className="text-[#3B5A3C]/70 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
                                                {post.excerpt}
                                            </p>

                                            <div className="flex items-center justify-between pt-4 border-t border-[#3B5A3C]/10 mt-auto">
                                                <div className="flex items-center gap-2">
                                                    {authorPhoto ? (
                                                        <div className="relative h-7 w-7 rounded-full overflow-hidden shrink-0">
                                                            <Image
                                                                src={authorPhoto}
                                                                alt={authorName}
                                                                fill
                                                                className="object-cover object-top"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1B2D1E] text-[#E8D49A] font-display text-[10px] font-bold shrink-0">
                                                            EHS
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-[#0D1812] text-xs font-semibold leading-none">
                                                            {authorName}
                                                        </p>
                                                        <p className="text-[#3B5A3C]/50 text-[10px] mt-0.5">
                                                            {new Date(
                                                                post.published_at ||
                                                                    post.created_at
                                                            ).toLocaleDateString("pt-BR", {
                                                                day: "numeric",
                                                                month: "short",
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-[#3B5A3C]/50 text-xs">
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
                            <p className="text-[#3B5A3C]/60 text-lg">
                                Nenhum artigo encontrado nesta categoria.
                            </p>
                        </div>
                    )}
                </Container>
            </section>
        </>
    );
}
