import type { MetadataRoute } from "next";
import { hasPublicSupabaseEnv } from "@/lib/supabase/public";

interface SitemapPost {
    slug: string;
    updated_at: string | null;
    published_at: string | null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticPages: MetadataRoute.Sitemap = [
        { url: "https://www.ehsadvogados.com.br", priority: 1.0, changeFrequency: "weekly" },
        { url: "https://www.ehsadvogados.com.br/sobre", priority: 0.8, changeFrequency: "monthly" },
        { url: "https://www.ehsadvogados.com.br/equipe", priority: 0.8, changeFrequency: "monthly" },
        { url: "https://www.ehsadvogados.com.br/areas-de-atuacao", priority: 0.8, changeFrequency: "monthly" },
        { url: "https://www.ehsadvogados.com.br/blog", priority: 0.9, changeFrequency: "daily" },
        { url: "https://www.ehsadvogados.com.br/contato", priority: 0.7, changeFrequency: "monthly" },
    ];

    if (!hasPublicSupabaseEnv()) {
        return staticPages;
    }

    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/posts?select=slug,updated_at,published_at&status=eq.published`,
            {
                headers: {
                    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
                },
                next: { revalidate: 3600 },
            }
        );
        if (res.ok) {
            const posts = (await res.json()) as SitemapPost[];
            const postPages: MetadataRoute.Sitemap = posts.map((post) => {
                const lastModifiedSource = post.updated_at ?? post.published_at;

                return {
                    url: `https://www.ehsadvogados.com.br/blog/${post.slug}`,
                    ...(lastModifiedSource && {
                        lastModified: new Date(lastModifiedSource),
                    }),
                    priority: 0.7,
                    changeFrequency: "weekly" as const,
                };
            });
            return [...staticPages, ...postPages];
        }
    } catch {
        // fallback to static pages only
    }

    return staticPages;
}
