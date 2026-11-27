import { PostHogProvider } from "@/components/providers/posthog-provider";
import { MarketingScripts } from "@/components/providers/marketing-scripts";
import { CookieConsentBanner } from "@/components/providers/cookie-consent-banner";
import { JsonLd } from "@/components/seo/JsonLd";

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PostHogProvider>
      <JsonLd />
      <MarketingScripts />
      {children}
      <CookieConsentBanner />
    </PostHogProvider>
  );
}
