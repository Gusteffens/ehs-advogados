import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        formats: ["image/avif", "image/webp"],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "kypsmdjogvvvwornxmqp.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },
    compiler: {
        removeConsole: process.env.NODE_ENV === "production"
            ? { exclude: ["error", "warn"] }
            : false,
    },
    async headers() {
        const ContentSecurityPolicy = `
            default-src 'self';
            script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.ehsadvogados.com.br https://challenges.cloudflare.com;
            style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
            font-src 'self' https://fonts.gstatic.com;
            img-src 'self' data: blob: https://*.supabase.co https://img.clerk.com;
            connect-src 'self' https://*.supabase.co https://clerk.ehsadvogados.com.br https://*.posthog.com https://*.sentry.io;
            frame-ancestors 'none';
        `.replace(/\n/g, ' ').trim();

        return [
            {
                source: "/(.*)",
                headers: [
                    { key: "Content-Security-Policy", value: ContentSecurityPolicy },
                    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "X-Frame-Options", value: "DENY" },
                    { key: "X-XSS-Protection", value: "1; mode=block" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                ],
            },
        ];
    },
};

export default nextConfig;
