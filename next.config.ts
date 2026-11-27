import type { NextConfig } from "next";

function getSupabaseHostname(): string | null {
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (rawUrl) {
        try {
            return new URL(rawUrl).hostname;
        } catch {
            return null;
        }
    }
    return null;
}

const supabaseHostname = getSupabaseHostname();
const supabaseOrigin = supabaseHostname ? `https://${supabaseHostname}` : "";

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: "16mb",
        },
    },
    images: {
        formats: ["image/avif", "image/webp"],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        remotePatterns: supabaseHostname
            ? [
                  {
                      protocol: "https",
                      hostname: supabaseHostname,
                      pathname: "/storage/v1/object/public/**",
                  },
              ]
            : [],
    },
    compiler: {
        removeConsole: process.env.NODE_ENV === "production"
            ? { exclude: ["error", "warn"] }
            : false,
    },
    async redirects() {
        return [
            {
                source: "/proagro-negado",
                destination: "/proagro",
                permanent: true,
            },
        ];
    },
    async headers() {
        const isDevelopment = process.env.NODE_ENV !== "production";
        const facebookSources = [
            "https://facebook.com",
            "https://*.facebook.com",
            "https://*.facebook.net",
        ];
        const googleAdsAndAnalyticsSources = [
            "https://www.googletagmanager.com",
            "https://www.google-analytics.com",
            "https://ssl.google-analytics.com",
            "https://www.googleadservices.com",
            "https://*.googleadservices.com",
            "https://googleads.g.doubleclick.net",
            "https://*.doubleclick.net",
            "https://*.google.com",
            "https://*.google.com.br",
        ];
        const scriptSrc = [
            "'self'",
            isDevelopment ? "'unsafe-eval'" : "",
            "'unsafe-inline'",
            "https://www.instagram.com",
            "https://*.instagram.com",
            ...facebookSources,
            ...googleAdsAndAnalyticsSources,
            "https://static.cloudflareinsights.com",
        ].filter(Boolean).join(" ");

        const ContentSecurityPolicy = `
            default-src 'self';
            script-src ${scriptSrc};
            style-src 'self' 'unsafe-inline';
            font-src 'self';
            img-src 'self' data: blob: ${supabaseOrigin} https://*.instagram.com https://*.cdninstagram.com https://*.fbcdn.net ${facebookSources.join(" ")} https://google.com ${googleAdsAndAnalyticsSources.join(" ")};
            connect-src 'self' ${supabaseOrigin} https://*.posthog.com https://*.instagram.com ${facebookSources.join(" ")} https://analytics.google.com https://stats.g.doubleclick.net ${googleAdsAndAnalyticsSources.join(" ")} https://cloudflareinsights.com https://*.cloudflareinsights.com;
            frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://maps.google.com https://tagassistant.google.com https://*.google.com https://*.google.com.br https://*.doubleclick.net https://www.instagram.com https://*.instagram.com https://www.googletagmanager.com ${facebookSources.join(" ")};
            frame-ancestors 'self' ${facebookSources.join(" ")} https://tagassistant.google.com https://*.google.com https://*.google.com.br;
            object-src 'none';
            base-uri 'self';
            form-action 'self';
            worker-src 'self' blob:;
            ${isDevelopment ? "" : "upgrade-insecure-requests;"}
        `.replace(/\s+/g, " ").trim();

        const adminScriptSrc = [
            "'self'",
            isDevelopment ? "'unsafe-eval'" : "",
            "'unsafe-inline'",
        ].filter(Boolean).join(" ");

        const AdminContentSecurityPolicy = `
            default-src 'self';
            script-src ${adminScriptSrc};
            style-src 'self' 'unsafe-inline';
            font-src 'self';
            img-src 'self' data: blob: ${supabaseOrigin};
            connect-src 'self' ${supabaseOrigin};
            frame-src 'self';
            frame-ancestors 'none';
            object-src 'none';
            base-uri 'self';
            form-action 'self';
            worker-src 'self' blob:;
            ${isDevelopment ? "" : "upgrade-insecure-requests;"}
        `.replace(/\s+/g, " ").trim();

        const adminSecurityHeaders = [
            { key: "Content-Security-Policy", value: AdminContentSecurityPolicy },
            { key: "X-Frame-Options", value: "DENY" },
        ];

        return [
            {
                source: "/(.*)",
                headers: [
                    { key: "Content-Security-Policy", value: ContentSecurityPolicy },
                    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
                    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                ],
            },
            {
                source: "/admin/:path*",
                headers: adminSecurityHeaders,
            },
            {
                source: "/sign-in/:path*",
                headers: adminSecurityHeaders,
            },
        ];
    },
};

export default nextConfig;
