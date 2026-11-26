import Script from "next/script";

const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-W7KZ6TFK";
const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-17985986753";
const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "2487931431710589";

export function MarketingScripts() {
  return (
    <>
      {/* Google Consent Mode v2 — default denied, upgraded immediately if user previously granted */}
      <Script
        id="google-consent-default"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = window.gtag || gtag;
            gtag('consent', 'default', {
              ad_storage: 'denied',
              analytics_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              wait_for_update: 500
            });
            try {
              if (localStorage.getItem('ehs_cookie_consent') === 'granted') {
                gtag('consent', 'update', {
                  ad_storage: 'granted',
                  analytics_storage: 'granted',
                  ad_user_data: 'granted',
                  ad_personalization: 'granted'
                });
              }
            } catch (e) {}
          `,
        }}
      />

      {/* Google Tag Manager (noscript) */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>

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
            })(window,document,'script','dataLayer','${gtmId}');
          `,
        }}
      />

      {/* Google Ads */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
      />
      <Script
        id="google-ads"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${googleAdsId}');
          `,
        }}
      />

      {/* Meta Pixel — revoked by default until LGPD consent */}
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
            var ehsConsent = 'denied';
            try { ehsConsent = localStorage.getItem('ehs_cookie_consent') || 'denied'; } catch (e) {}
            fbq('consent', ehsConsent === 'granted' ? 'grant' : 'revoke');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
    </>
  );
}
