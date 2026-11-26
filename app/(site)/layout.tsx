import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FloatingWhatsApp } from "@/components/layout/floating-whatsapp";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { MarketingScripts } from "@/components/providers/marketing-scripts";
import { CookieConsentBanner } from "@/components/providers/cookie-consent-banner";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
      <PostHogProvider>
        <MarketingScripts />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <FloatingWhatsApp />
        <CookieConsentBanner />
      </PostHogProvider>
    </ClerkProvider>
  );
}
