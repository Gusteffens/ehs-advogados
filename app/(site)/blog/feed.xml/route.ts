import { getPublishedBlogPosts } from "@/lib/data/blog";
import { SITE_CONFIG } from "@/lib/site-config";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await getPublishedBlogPosts();
  const baseUrl = SITE_CONFIG.url;
  const feedUrl = `${baseUrl}/blog/feed.xml`;
  const lastBuildDate = posts[0]?.published_at
    ? new Date(posts[0].published_at).toUTCString()
    : new Date().toUTCString();

  const itemsXml = posts
    .map((post) => {
      const postUrl = `${baseUrl}/blog/${post.slug}`;
      const pubDate = new Date(post.published_at ?? post.created_at).toUTCString();
      const description =
        post.excerpt?.trim() ||
        `Artigo jurídico publicado por ${SITE_CONFIG.legalName}.`;
      const categoryXml = post.categories?.name
        ? `\n      <category>${escapeXml(post.categories.name)}</category>`
        : "";

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>${categoryXml}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`Blog Jurídico | ${SITE_CONFIG.legalName}`)}</title>
    <link>${escapeXml(`${baseUrl}/blog`)}</link>
    <description>${escapeXml(
      `Artigos e análises jurídicas da ${SITE_CONFIG.legalName} (${SITE_CONFIG.oab}) sobre Direito Civil, Penal, Agrário, Ambiental, Militar e Empresarial.`
    )}</description>
    <language>pt-BR</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
