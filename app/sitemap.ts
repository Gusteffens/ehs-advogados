import type { MetadataRoute } from "next";
import { getPublishedPostSlugsForSitemap } from "@/lib/data/blog";
import { SITE_CONFIG } from "@/lib/site-config";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;
  const staticLastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: staticLastModified, priority: 1.0, changeFrequency: "weekly" },
    { url: `${baseUrl}/sobre`, lastModified: staticLastModified, priority: 0.8, changeFrequency: "monthly" },
    { url: `${baseUrl}/equipe`, lastModified: staticLastModified, priority: 0.8, changeFrequency: "monthly" },
    { url: `${baseUrl}/areas-de-atuacao`, lastModified: staticLastModified, priority: 0.8, changeFrequency: "monthly" },
    { url: `${baseUrl}/blog`, lastModified: staticLastModified, priority: 0.9, changeFrequency: "daily" },
    { url: `${baseUrl}/contato`, lastModified: staticLastModified, priority: 0.7, changeFrequency: "monthly" },
    { url: `${baseUrl}/penal`, lastModified: staticLastModified, priority: 0.8, changeFrequency: "monthly" },
    { url: `${baseUrl}/proagro`, lastModified: staticLastModified, priority: 0.8, changeFrequency: "monthly" },
    { url: `${baseUrl}/seguranca`, lastModified: staticLastModified, priority: 0.8, changeFrequency: "monthly" },
    {
      url: `${baseUrl}/politica-de-privacidade`,
      lastModified: staticLastModified,
      priority: 0.3,
      changeFrequency: "yearly",
    },
    { url: `${baseUrl}/termos-de-uso`, lastModified: staticLastModified, priority: 0.3, changeFrequency: "yearly" },
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
