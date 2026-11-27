import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FloatingWhatsApp } from "@/components/layout/floating-whatsapp";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { MarketingScripts } from "@/components/providers/marketing-scripts";
import { CookieConsentBanner } from "@/components/providers/cookie-consent-banner";
import { JsonLd } from "@/components/seo/JsonLd";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PostHogProvider>
      <JsonLd />
      <MarketingScripts />
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-forest-900 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-gold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-gold"
      >
        Pular para o conteúdo principal
      </a>
      <Header />
      <main id="conteudo-principal" className="min-h-screen">
        {children}
      </main>
      <Footer />
      <FloatingWhatsApp />
      <CookieConsentBanner />
    </PostHogProvider>
  );
}
