/**
 * Dados centralizados do escritório Erlo, Haas & Steffens
 * Atualize aqui para refletir em todo o site.
 */
export const SITE_CONFIG = {
    name: "Erlo, Haas & Steffens",
    shortName: "EHS",
    founded: 2022,
    oab: "OAB/SC 8487",
    cnpj: "48.624.064/0001-90",
    address: {
        street: "Rua Itaberaba, 930, sala 304",
        building: "Ed. Fransozi",
        neighborhood: "Centro",
        city: "São Miguel do Oeste",
        state: "SC",
        full: "Rua Itaberaba, 930, sala 304, Ed. Fransozi, Centro, São Miguel do Oeste - SC",
    },
    contact: {
        whatsapp: "https://wa.me/+5549984001053",
        whatsappDisplay: "+55 (49) 98400-1053",
        phone: "tel:+5549984001053",
        instagram: "https://www.instagram.com/ehs.adv/",
        facebook: "https://www.facebook.com/ehs.adv",
    },
} as const;
