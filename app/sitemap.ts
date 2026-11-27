import type { MetadataRoute } from "next";
import { getPublishedPostSlugsForSitemap } from "@/lib/data/blog";
import { SITE_CONFIG } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, priority: 1.0, changeFrequency: "weekly" },
    { url: `${baseUrl}/sobre`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${baseUrl}/equipe`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${baseUrl}/areas-de-atuacao`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${baseUrl}/blog`, priority: 0.9, changeFrequency: "daily" },
    { url: `${baseUrl}/contato`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${baseUrl}/penal`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${baseUrl}/proagro`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${baseUrl}/seguranca`, priority: 0.8, changeFrequency: "monthly" },
    {
      url: `${baseUrl}/politica-de-privacidade`,
      priority: 0.3,
      changeFrequency: "yearly",
    },
    { url: `${baseUrl}/termos-de-uso`, priority: 0.3, changeFrequency: "yearly" },
  ];

  const posts = await getPublishedPostSlugsForSitemap();
  const postPages: MetadataRoute.Sitemap = posts.map((post) => {
    const lastModifiedSource = post.updated_at ?? post.published_at;

    return {
      url: `${baseUrl}/blog/${post.slug}`,
      ...(lastModifiedSource && {
        lastModified: new Date(lastModifiedSource),
      }),
      priority: 0.7,
      changeFrequency: "weekly" as const,
    };
  });

  return [...staticPages, ...postPages];
}
