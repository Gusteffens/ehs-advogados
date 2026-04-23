import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Tag, FileText } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/section-title";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLatestPublishedBlogPosts } from "@/lib/data/blog";

export async function BlogCtaSection() {
    const safePosts = await getLatestPublishedBlogPosts(3);

    return (
        <section className="py-24 lg:py-32 bg-[#EEEDE5] relative overflow-hidden">
            {/* Diagonal decorative line */}
            <div className="absolute top-0 left-[20%] w-px h-full bg-gradient-to-b from-transparent via-forest-200/40 to-transparent" />

            <Container className="relative">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-14">
                    <SectionTitle
                        label="Blog Jurídico"
                        title="Artigos e informações atualizadas"
                        subtitle="Acompanhe nosso blog para se manter informado sobre as últimas novidades do mundo jurídico."
                        align="left"
                        className="mb-0 lg:max-w-xl"
                    />
                    <Link href="/blog" className="mt-6 lg:mt-0 shrink-0">
                        <Button variant="outline" className="group">
                            Ver todos os artigos
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>

                {safePosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {safePosts.map((post) => (
                            <article key={post.slug}>
                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="group flex flex-col h-full rounded-2xl bg-white border border-forest-100 p-6 lg:p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-forest-900/6 hover:border-forest-200 no-underline"
                                >
                                    {/* Category */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <Badge variant="accent" size="sm">
                                            <Tag className="h-3 w-3 mr-1" />
                                            {post.categories?.name ?? "Artigo"}
                                        </Badge>
                                    </div>

                                    {/* Title */}
                                    <h3 className="font-display text-lg font-bold text-[#0D1812] mb-3 leading-snug group-hover:text-[#3B5A3C] transition-colors">
                                        {post.title}
                                    </h3>

                                    {/* Excerpt */}
                                    {post.excerpt && (
                                        <p className="text-[#3B5A3C] text-sm leading-relaxed flex-1 mb-5 line-clamp-3">
                                            {post.excerpt}
                                        </p>
                                    )}

                                    {/* Meta */}
                                    <div className="flex items-center justify-between text-xs text-[#3B5A3C] pt-4 border-t border-forest-50 mt-auto">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>{post.reading_time_min ?? 5} min de leitura</span>
                                        </div>
                                        {post.published_at && (
                                            <span>
                                                {new Date(post.published_at).toLocaleDateString("pt-BR", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        )}
                                    </div>

                                    {/* Read more indicator */}
                                    <div className="flex items-center gap-1.5 mt-4 text-sm font-medium text-[#877249] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                                        <BookOpen className="h-4 w-4" />
                                        Ler artigo
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </div>
                ) : (
                    /* Elegant empty state */
                    <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-forest-200 bg-white/50">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEEDE5] text-[#3B5A3C] mb-5">
                            <FileText className="h-7 w-7" />
                        </div>
                        <h3 className="font-display text-xl font-bold text-[#0D1812] mb-2">
                            Novos artigos em breve
                        </h3>
                        <p className="text-[#3B5A3C] text-sm max-w-xs leading-relaxed mb-6">
                            Nossa equipe está preparando conteúdo exclusivo sobre direito para você.
                        </p>
                        <Link href="/contato">
                            <Button variant="outline">Fale Conosco</Button>
                        </Link>
                    </div>
                )}
            </Container>
        </section>
    );
}
