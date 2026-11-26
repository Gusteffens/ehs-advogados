import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_CONFIG } from "@/lib/site-config";
import "@fontsource/unna/400.css";
import "@fontsource/unna/700.css";
import "@fontsource/mulish/300.css";
import "@fontsource/mulish/400.css";
import "@fontsource/mulish/500.css";
import "@fontsource/mulish/600.css";
import "@fontsource/mulish/700.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: "Erlo, Haas & Steffens | Advocacia em São Miguel do Oeste",
    template: "%s | Erlo, Haas & Steffens",
  },
  description: `Escritório de advocacia especializado em Direito Civil, Penal, Agronegócio e Ambiental. Atendimento em ${SITE_CONFIG.address.city} - ${SITE_CONFIG.address.state}. ${SITE_CONFIG.oab}.`,
  keywords: [
    "advogado São Miguel do Oeste",
    "advocacia SC",
    "direito agronegócio Santa Catarina",
    "direito civil oeste catarinense",
    "direito penal São Miguel do Oeste",
    "direito ambiental SC",
    "Erlo, Haas & Steffens",
    SITE_CONFIG.oab,
    "escritório advocacia SMO",
  ],
  authors: [{ name: SITE_CONFIG.legalName }],
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
      { url: "/favicon.ico" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon-32.png",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_CONFIG.url,
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta
          name="facebook-domain-verification"
          content="kxbgdskgibhycq5k5kytetkuvyuf3t"
        />
        <link rel="preconnect" href="https://clerk.ehsadvogados.com.br" />
        <JsonLd />
      </head>
      <body className="antialiased grain-overlay">{children}</body>
    </html>
  );
}
