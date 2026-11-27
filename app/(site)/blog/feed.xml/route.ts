import { getLatestPublishedBlogPosts } from "@/lib/data/blog";
import { SITE_CONFIG } from "@/lib/site-config";

const MAX_FEED_ITEMS = 50;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function inferImageMimeType(url: string): string {
  const cleanUrl = url.split("?")[0].toLowerCase();
  if (cleanUrl.endsWith(".png")) return "image/png";
  if (cleanUrl.endsWith(".webp")) return "image/webp";
  if (cleanUrl.endsWith(".avif")) return "image/avif";
  if (cleanUrl.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

function resolveAbsoluteUrl(url: string, baseUrl: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}

export async function GET() {
  const posts = await getLatestPublishedBlogPosts(MAX_FEED_ITEMS);
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
      const authorName = post.authors?.full_name?.trim() || SITE_CONFIG.legalName;
      const authorEmail = `${SITE_CONFIG.contact.email} (${authorName})`;
      const categoryXml = post.categories?.name
        ? `\n      <category>${escapeXml(post.categories.name)}</category>`
        : "";
      const enclosureXml = post.cover_image_url
        ? `\n      <enclosure url="${escapeXml(
            resolveAbsoluteUrl(post.cover_image_url, baseUrl)
          )}" length="0" type="${inferImageMimeType(post.cover_image_url)}" />`
        : "";

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(authorEmail)}</author>
      <dc:creator>${escapeXml(authorName)}</dc:creator>${categoryXml}${enclosureXml}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
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
