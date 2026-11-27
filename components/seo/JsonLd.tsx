import { SITE_CONFIG } from "@/lib/site-config";

export function JsonLd() {
  const legalServiceId = `${SITE_CONFIG.url}/#legalservice`;
  const websiteId = `${SITE_CONFIG.url}/#website`;
  const telephone = SITE_CONFIG.contact.phone.replace(/^tel:/, "");

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LegalService",
        "@id": legalServiceId,
        name: SITE_CONFIG.legalName,
        alternateName: SITE_CONFIG.name,
        description:
          "Escritório de advocacia especializado em Direito Civil, Penal, Agronegócio, Ambiental, Militar e Empresarial.",
        url: SITE_CONFIG.url,
        logo: `${SITE_CONFIG.url}/images/logo-ehs-monogram.png`,
        image: `${SITE_CONFIG.url}/og-image.png`,
        telephone,
        email: SITE_CONFIG.contact.email,
        foundingDate: String(SITE_CONFIG.founded),
        address: {
          "@type": "PostalAddress",
          streetAddress: `${SITE_CONFIG.address.street}, ${SITE_CONFIG.address.building}`,
          addressLocality: SITE_CONFIG.address.city,
          addressRegion: SITE_CONFIG.address.state,
          postalCode: SITE_CONFIG.address.zipCode,
          addressCountry: "BR",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: "-26.7268",
          longitude: "-53.5172",
        },
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "08:00",
          closes: "18:00",
        },
        sameAs: [SITE_CONFIG.social.instagram, SITE_CONFIG.social.facebook],
        areaServed: {
          "@type": "State",
          name: "Santa Catarina",
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Áreas de Atuação",
          itemListElement: SITE_CONFIG.practiceAreas.map((area) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: area.title,
            },
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: SITE_CONFIG.url,
        name: SITE_CONFIG.legalName,
        alternateName: SITE_CONFIG.name,
        inLanguage: "pt-BR",
        publisher: {
          "@id": legalServiceId,
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
