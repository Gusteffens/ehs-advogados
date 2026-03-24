export function JsonLd() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "LegalService",
        name: "Erlo, Haas & Steffens Sociedade de Advocacia",
        description:
            "Escritório de advocacia especializado em Direito Civil, Penal, Agronegócio e Ambiental",
        url: "https://www.ehsadvogados.com.br",
        logo: "https://www.ehsadvogados.com.br/images/logo-ehs-monogram.png",
        image: "https://www.ehsadvogados.com.br/og-image.png",
        telephone: "+55-49-98400-1053",
        email: "ehs.escritorio@gmail.com",
        foundingDate: "2022",
        address: {
            "@type": "PostalAddress",
            streetAddress: "Rua Itaberaba, 930, Sala 304, Ed. Fransozi",
            addressLocality: "São Miguel do Oeste",
            addressRegion: "SC",
            postalCode: "89900-000",
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
        sameAs: [
            "https://www.instagram.com/ehs.adv/",
            "https://www.facebook.com/ehs.adv",
        ],
        areaServed: {
            "@type": "State",
            name: "Santa Catarina",
        },
        hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Áreas de Atuação",
            itemListElement: [
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Direito Civil" } },
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Direito Penal" } },
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Direito do Agronegócio" } },
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Direito Ambiental" } },
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Direito Militar" } },
                { "@type": "Offer", itemOffered: { "@type": "Service", name: "Direito Agrário" } },
            ],
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
