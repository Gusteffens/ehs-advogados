import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Unna, Mulish, Outfit } from "next/font/google";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { SiteShell } from "@/components/layout/site-shell";
import { JsonLd } from "@/components/seo/JsonLd";
import "./globals.css";

const unna = Unna({
    variable: "--font-unna",
    subsets: ["latin"],
    display: "swap",
    weight: ["400", "700"],
});

const mulish = Mulish({
    variable: "--font-mulish",
    subsets: ["latin"],
    display: "swap",
    weight: ["300", "400", "500", "600", "700"],
});

const outfit = Outfit({
    variable: "--font-outfit",
    subsets: ["latin"],
    display: "swap",
    weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
    metadataBase: new URL("https://www.ehsadvogados.com.br"),
    title: {
        default: "Erlo, Haas & Steffens | Advocacia em São Miguel do Oeste",
        template: "%s | Erlo, Haas & Steffens",
    },
    description:
        "Escritório de advocacia especializado em Direito Civil, Penal, Agronegócio e Ambiental. Atendimento em São Miguel do Oeste - SC. OAB/SC 8487.",
    keywords: [
        "advogado São Miguel do Oeste",
        "advocacia SC",
        "direito agronegócio Santa Catarina",
        "direito civil oeste catarinense",
        "direito penal São Miguel do Oeste",
        "direito ambiental SC",
        "Erlo, Haas Steffens",
        "OAB SC 8487",
        "escritório advocacia SMO",
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
        title: "Erlo, Haas & Steffens | Advocacia em São Miguel do Oeste",
        description:
            "Escritório de advocacia especializado em Direito Civil, Penal, Agronegócio e Ambiental em São Miguel do Oeste - SC.",
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
        description: "Escritório de advocacia em São Miguel do Oeste - SC.",
        images: ["/og-image.png"],
    },
    alternates: {
        canonical: "https://www.ehsadvogados.com.br",
    },
    verification: {
        google: "", // preencher após verificar no Google Search Console
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
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <JsonLd />
            </head>
            <body
                className={`${unna.variable} ${mulish.variable} ${outfit.variable} antialiased grain-overlay`}
            >
                <ClerkProvider dynamic signInUrl="/sign-in" signUpUrl="/sign-up">
                    <PostHogProvider>
                        <SiteShell>{children}</SiteShell>
                    </PostHogProvider>
                </ClerkProvider>
            </body>
        </html>
    );
}
