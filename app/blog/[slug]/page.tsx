import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar, Eye } from "lucide-react";
import { Container } from "@/components/ui/container";
import {
    getPublishedBlogPostBySlug,
    getPublishedBlogSlugs,
} from "@/lib/data/blog";
import { PostViewTracker } from "@/components/blog/post-view-tracker";
import type { BlogAuthorSummary, BlogCategorySummary } from "@/types/blog";
import { sanitizeBlogHtml } from "@/lib/sanitize-blog-html";

export const revalidate = 300;

interface PageProps {
    params: Promise<{ slug: string }>;
}

const teamImages: Record<string, string> = {
    "escritorio-ehs": "/images/logo-ehs-monogram.png",
    "alessandra-steffens": "/images/team/alessandra-steffens.webp",
    "jacson-erlo": "/images/team/jacson-erlo.webp",
    "jean-erlo": "/images/team/jean-erlo.webp",
    "luiza-haas": "/images/team/luiza-haas.webp",
    "maisa-christ": "/images/team/maisa-christ.webp",
};

export async function generateStaticParams() {
    const slugs = await getPublishedBlogSlugs();
    return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPublishedBlogPostBySlug(slug);

    if (!post) {
        return { title: "Artigo não encontrado" };
    }

    const title = post.title;
    const description = post.excerpt ?? "Artigo do Blog Jurídico do Erlo, Haas & Steffens.";

    const articleSchema = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        author: {
            "@type": "Person",
            name: post.authors?.full_name ?? "Erlo, Haas & Steffens",
        },
        publisher: {
            "@type": "Organization",
            name: "Erlo, Haas & Steffens",
            url: "https://www.ehsadvogados.com.br",
        },
        datePublished: post.published_at,
        dateModified: post.updated_at,
        ...(post.cover_image_url && { image: post.cover_image_url }),
        url: `https://www.ehsadvogados.com.br/blog/${post.slug}`,
    };

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "article",
            locale: "pt_BR",
            siteName: "Erlo, Haas & Steffens Advocacia",
            url: `https://www.ehsadvogados.com.br/blog/${post.slug}`,
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
        other: {
            "application/ld+json": JSON.stringify(articleSchema),
        },
    };
}

export default async function ArticlePage({ params }: PageProps) {
    const { slug } = await params;
    const post = await getPublishedBlogPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const publishedDate = post.published_at
        ? new Date(post.published_at).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
          })
        : null;

    const author = post.authors as BlogAuthorSummary | null;
    const authorName = author?.full_name ?? "Equipe EHS";
    const authorSlug = author?.slug ?? null;
    const authorPhoto = authorSlug ? (teamImages[authorSlug] ?? null) : null;
    const authorPhotoFallback = "/images/logo-ehs-monogram.png";

    const category = post.categories as BlogCategorySummary | null;
    const categoryColor = category?.color_hex ?? "#E8D49A";
    const categoryName = category?.name ?? null;

    return (
        <div className="min-h-screen bg-[#EEEDE5]">
            <PostViewTracker postId={post.id} />

            <section className="pt-32 pb-20 lg:pt-40 lg:pb-24 bg-[#0D1812] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#E8D49A]/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-[35%] w-px h-32 bg-gradient-to-b from-[#E8D49A]/15 to-transparent pointer-events-none" />

                <Container className="relative">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-sm text-[#EEEDE5]/40 hover:text-[#E8D49A] transition-colors mb-10 no-underline group"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                        Voltar ao Blog
                    </Link>

                    {categoryName && (
                        <div className="mb-5">
                            <span
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-[#0D1812]"
                                style={{ backgroundColor: categoryColor }}
                            >
                                {categoryName}
                            </span>
                        </div>
                    )}

                    <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.85rem] font-bold text-[#EEEDE5] leading-tight max-w-3xl mb-8">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <div className="flex items-center gap-2.5">
                            <div className="relative h-10 w-10 rounded-full overflow-hidden shrink-0 ring-2 ring-[#E8D49A]/20">
                                <Image
                                    src={authorPhoto ?? authorPhotoFallback}
                                    alt={authorName}
                                    fill
                                    sizes="40px"
                                    className="object-cover object-center"
                                />
                            </div>
                            <span className="text-[#EEEDE5] text-sm font-medium">
                                {authorName}
                            </span>
                        </div>

                        {publishedDate && (
                            <>
                                <span className="text-[#EEEDE5]/20 text-sm">·</span>
                                <span className="flex items-center gap-1.5 text-sm text-[#EEEDE5]/50">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {publishedDate}
                                </span>
                            </>
                        )}

                        <span className="text-[#EEEDE5]/20 text-sm">·</span>
                        <span className="flex items-center gap-1.5 text-sm text-[#EEEDE5]/50">
                            <Clock className="h-3.5 w-3.5" />
                            {post.reading_time_min ?? 5} min de leitura
                        </span>

                        {typeof post.views === "number" && post.views > 0 && (
                            <>
                                <span className="text-[#EEEDE5]/20 text-sm">·</span>
                                <span className="flex items-center gap-1.5 text-sm text-[#EEEDE5]/50">
                                    <Eye className="h-3.5 w-3.5" />
                                    {post.views} {post.views === 1 ? "visualização" : "visualizações"}
                                </span>
                            </>
                        )}
                    </div>
                </Container>
            </section>

            {post.cover_image_url && (
                <section className="bg-[#EEEDE5] pt-10 pb-4">
                    <Container>
                        <div className="relative aspect-video max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-lg border border-[#3B5A3C]/10">
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

            <section className="py-12 lg:py-16 bg-[#EEEDE5]">
                <Container>
                    <article
                        className="prose-editorial max-w-2xl mx-auto"
                        dangerouslySetInnerHTML={{
                            __html: sanitizeBlogHtml(post.content ?? ""),
                        }}
                    />
                </Container>
            </section>

            <section className="pb-16 bg-[#EEEDE5]">
                <Container>
                    <div className="max-w-2xl mx-auto rounded-2xl bg-[#1B2D1E] p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row items-start gap-5">
                            <div className="relative h-20 w-20 rounded-2xl overflow-hidden shrink-0 shadow-lg ring-2 ring-[#E8D49A]/10">
                                <Image
                                    src={authorPhoto ?? authorPhotoFallback}
                                    alt={authorName}
                                    fill
                                    sizes="80px"
                                    className="object-cover object-center"
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-widest text-[#877249] mb-1">
                                    Escrito por
                                </p>
                                <h3 className="font-display text-xl font-bold text-[#EEEDE5] mb-1">
                                    {authorName}
                                </h3>
                                {author?.oab && (
                                    <p className="text-sm text-[#E8D49A] mb-3">
                                        {author.oab}
                                    </p>
                                )}
                                {author?.specialties && author.specialties.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {author.specialties.map((specialty) => (
                                            <span
                                                key={specialty}
                                                className="px-2.5 py-0.5 text-xs font-medium rounded-lg bg-[#E8D49A]/10 text-[#E8D49A] border border-[#E8D49A]/20"
                                            >
                                                {specialty}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {author?.bio && (
                                    <p className="text-[#EEEDE5]/60 text-sm leading-relaxed">
                                        {author.bio}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="py-16 bg-[#1B2D1E]">
                <Container className="text-center">
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#EEEDE5] mb-4">
                        Precisa de orientação sobre este tema?
                    </h3>
                    <p className="text-[#EEEDE5]/50 max-w-lg mx-auto mb-8">
                        Nossa equipe está pronta para ajudar. Entre em contato para uma análise
                        do seu caso.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="https://wa.me/+5549984001053?text=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20uma%20consulta%20jur%C3%ADdica."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8D49A] px-6 py-3 text-sm font-semibold text-[#0D1812] shadow-md hover:bg-[#E8D49A]/90 transition-colors no-underline"
                        >
                            Fale com um Especialista
                        </Link>
                        <Link
                            href="/blog"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EEEDE5]/20 px-6 py-3 text-sm font-medium text-[#EEEDE5] hover:bg-[#EEEDE5]/10 transition-colors no-underline"
                        >
                            Ver mais artigos
                        </Link>
                    </div>
                </Container>
            </section>
        </div>
    );
}
