import { ImageResponse } from "next/og";
import { getPublishedBlogPostBySlug } from "@/lib/data/blog";
import { SITE_CONFIG } from "@/lib/site-config";

export const alt = "Artigo do Blog Jurídico — Erlo, Haas & Steffens";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

function clampTitle(rawTitle: string, maxLength = 115): string {
  const normalized = rawTitle.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;

  const sliced = normalized.slice(0, maxLength - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  const boundary = lastSpace > maxLength * 0.6 ? lastSpace : maxLength - 1;
  return `${sliced.slice(0, boundary).trimEnd()}…`;
}

export default async function BlogPostOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  const title = clampTitle(post?.title ?? "Blog Jurídico");
  const categoryName = post?.categories?.name ?? "Artigo Jurídico";
  const authorName = post?.authors?.full_name ?? SITE_CONFIG.legalName;
  const titleFontSize =
    title.length > 90 ? "42px" : title.length > 60 ? "48px" : "56px";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background:
            "linear-gradient(135deg, #0D1812 0%, #1B2D1E 60%, #0D1812 100%)",
          color: "#EEEDE5",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 22px",
              borderRadius: "9999px",
              backgroundColor: "#E8D49A",
              color: "#0D1812",
              fontSize: "20px",
              fontWeight: 700,
              fontFamily: "sans-serif",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {categoryName}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "20px",
              color: "#E8D49A",
              fontFamily: "sans-serif",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            BLOG JURÍDICO
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "1020px",
            maxHeight: "260px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: titleFontSize,
              fontWeight: 700,
              lineHeight: 1.15,
              color: "#EEEDE5",
            }}
          >
            {title}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(232, 212, 154, 0.25)",
            paddingTop: "28px",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ fontSize: "22px", fontWeight: 600, color: "#E8D49A" }}>
              {authorName}
            </div>
            <div style={{ fontSize: "18px", color: "rgba(238, 237, 229, 0.72)" }}>
              {SITE_CONFIG.legalName} · {SITE_CONFIG.oab}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              border: "2px solid rgba(232, 212, 154, 0.45)",
              color: "#E8D49A",
              fontSize: "24px",
              fontWeight: 700,
              fontFamily: "Georgia, serif",
            }}
          >
            EHS
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
