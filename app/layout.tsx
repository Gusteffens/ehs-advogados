import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { SiteShell } from "@/components/layout/site-shell";
import { JsonLd } from "@/components/seo/JsonLd";
import "@fontsource/unna/400.css";
import "@fontsource/unna/700.css";
import "@fontsource/mulish/300.css";
import "@fontsource/mulish/400.css";
import "@fontsource/mulish/500.css";
import "@fontsource/mulish/600.css";
import "@fontsource/mulish/700.css";
import "@fontsource/outfit/300.css";
import "@fontsource/outfit/400.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";
import "./globals.css";

export const metadata: Metadata = {
    metadataBase: new URL("https://www.ehsadvogados.com.br"),
    title: {
        default: "Erlo, Haas & Steffens | Advocacia em SÃ£o Miguel do Oeste",
        template: "%s | Erlo, Haas & Steffens",
    },
    description:
        "EscritÃ³rio de advocacia especializado em Direito Civil, Penal, AgronegÃ³cio e Ambiental. Atendimento em SÃ£o Miguel do Oeste - SC. OAB/SC 8487.",
    keywords: [
        "advogado SÃ£o Miguel do Oeste",
        "advocacia SC",
        "direito agronegÃ³cio Santa Catarina",
        "direito civil oeste catarinense",
        "direito penal SÃ£o Miguel do Oeste",
        "direito ambiental SC",
        "Erlo, Haas Steffens",
        "OAB SC 8487",
        "escritÃ³rio advocacia SMO",
    ],
    authors: [{ name: "Erlo, Haas & Steffens Sociedade de Advocacia" }],
    creator: "Erlo, Haas & Steffens",
    publisher: "Erlo, Haas & Steffens",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: [
            { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
            { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
            { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
        ],
        apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
        shortcut: "/favicon-32.png",
    },
    openGraph: {
        type: "website",
        locale: "pt_BR",
        url: "https://www.ehsadvogados.com.br",
        siteName: "Erlo, Haas & Steffens Advocacia",
        title: "Erlo, Haas & Steffens | Advocacia em SÃ£o Miguel do Oeste",
        description:
            "EscritÃ³rio de advocacia especializado em Direito Civil, Penal, AgronegÃ³cio e Ambiental em SÃ£o Miguel do Oeste - SC.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Erlo, Haas & Steffens Advocacia",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Erlo, Haas & Steffens | Advocacia",
        description: "EscritÃ³rio de advocacia em SÃ£o Miguel do Oeste - SC.",
        images: ["/og-image.png"],
    },
    alternates: {
        canonical: "https://www.ehsadvogados.com.br",
    },
    verification: {
        google: "", // preencher apÃ³s verificar no Google Search Console
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <head>
                <link rel="preconnect" href="https://clerk.ehsadvogados.com.br" />
                <JsonLd />
            </head>
            <body className="antialiased grain-overlay">
                <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
                    <PostHogProvider>
                        <SiteShell>{children}</SiteShell>
                    </PostHogProvider>
                </ClerkProvider>
            </body>
        </html>
    );
}
