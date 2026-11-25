import type { Metadata } from "next";
import Script from "next/script";
import { PostHogProvider } from "@/components/providers/posthog-provider";
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

const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "2487931431710589";

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
      <body className="antialiased grain-overlay">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W7KZ6TFK"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* Meta Pixel (noscript) */}
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>

        {/* Meta Pixel */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />

        {/* Google Tag Manager */}
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-W7KZ6TFK');
            `,
          }}
        />
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=AW-17985986753"
        />
        <Script
          id="google-ads"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-17985986753');
            `,
          }}
        />

        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
