/**
 * Fonte única de verdade para os dados institucionais, áreas de atuação e equipe
 * da Erlo, Haas & Steffens Sociedade de Advocacia.
 */

export interface PracticeAreaConfig {
  id: string;
  title: string;
  shortTitle: string;
  href: string;
  description: string;
  services: readonly string[];
  gradient: string;
}

export interface TeamMemberConfig {
  slug: string;
  name: string;
  role: string;
  oab: string;
  email: string;
  image: string;
  deskImage: string;
  specialties: readonly string[];
  bio: string;
  credentials: readonly string[];
  gradient: string;
}

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.ehsadvogados.com.br"
).replace(/\/+$/, "");

const whatsappNumber = "5549984001053";
const secondaryPhoneNumber = "5549988486988";

export const SITE_CONFIG = {
  url: siteUrl,
  name: "EHS Advocacia",
  legalName: "Erlo, Haas & Steffens Sociedade de Advocacia",
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
    zipCode: "89900-000",
    full: "Rua Itaberaba, 930, sala 304, Ed. Fransozi, Centro, São Miguel do Oeste - SC, CEP 89900-000",
  },
  contact: {
    whatsapp: `https://wa.me/${whatsappNumber}`,
    whatsappWithText: `https://wa.me/${whatsappNumber}?text=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20uma%20consulta%20jur%C3%ADdica.`,
    whatsappDisplay: "+55 (49) 98400-1053",
    phone: `tel:+${whatsappNumber}`,
    secondaryPhone: `tel:+${secondaryPhoneNumber}`,
    secondaryPhoneDisplay: "(49) 98848-6988",
    officeHours: "Segunda a sexta, das 8h às 18h",
    email: "ehs.escritorio@gmail.com",
    instagram: "https://www.instagram.com/ehs.adv/",
    facebook: "https://www.facebook.com/ehs.adv",
  },
  social: {
    instagram: "https://www.instagram.com/ehs.adv/",
    facebook: "https://www.facebook.com/ehs.adv",
  },
  practiceAreas: [
    {
      id: "civil",
      title: "Direito Civil",
      shortTitle: "Civil",
      href: "/areas-de-atuacao#civil",
      description:
        "Atuação abrangente em questões cíveis, incluindo contratos, responsabilidade civil, direito de família, sucessões e seguros, com orientação jurídica estratégica e atendimento personalizado para prevenção de riscos e adequada condução de demandas judiciais e extrajudiciais.",
      services: [
        "Contratos, seguros e obrigações",
        "Responsabilidade civil",
        "Direito de família e sucessões",
        "Direito securitário",
        "Inventários e partilhas",
        "Mediação e resolução de conflitos",
      ],
      gradient: "from-forest-700 to-forest-900",
    },
    {
      id: "penal",
      title: "Direito Penal",
      shortTitle: "Penal",
      href: "/areas-de-atuacao#penal",
      description:
        "Defesa técnica e estratégica em inquéritos policiais e processos criminais em todas as instâncias, com foco na proteção das garantias fundamentais do cidadão.",
      services: [
        "Defesa em inquéritos policiais",
        "Atuação em crimes dolosos e culposos",
        "Habeas corpus e liberdade provisória",
        "Crimes contra a pessoa e patrimônio",
        "Júri popular",
        "Recursos em instâncias superiores",
      ],
      gradient: "from-forest-800 to-forest-950",
    },
    {
      id: "agrario",
      title: "Direito Agrário e do Agronegócio",
      shortTitle: "Agrário e Agronegócio",
      href: "/areas-de-atuacao#agrario",
      description:
        "Assessoria jurídica especializada ao produtor rural e às empresas do agronegócio, com atuação em contratos agrários, crédito rural, Proagro, seguro rural, renegociação e prorrogação de dívidas rurais, regularização fundiária e contencioso vinculado à atividade rural.",
      services: [
        "Contratos agrários e relações no campo",
        "Crédito rural, financiamentos e garantias",
        "Proagro e seguro rural",
        "Renegociação e prorrogação de dívidas rurais",
        "Regularização fundiária e usucapião rural",
        "Litígios sobre posse, propriedade e atividade rural",
      ],
      gradient: "from-champagne-500 to-champagne-700",
    },
    {
      id: "ambiental",
      title: "Direito Ambiental",
      shortTitle: "Ambiental",
      href: "/areas-de-atuacao#ambiental",
      description:
        "Assessoria em licenciamento ambiental, compliance regulatório e defesa em processos administrativos e judiciais relacionados à legislação ambiental.",
      services: [
        "Licenciamento e regularização ambiental",
        "Compliance ambiental e regulatório",
        "Defesa em autos de infração e processos administrativos",
        "Regularização de imóveis rurais e questões de CAR/SICAR",
        "Defesa em demandas e crimes ambientais",
        "Assessoria ambiental ao agronegócio",
      ],
      gradient: "from-forest-600 to-forest-800",
    },
    {
      id: "militar",
      title: "Direito Militar",
      shortTitle: "Militar",
      href: "/areas-de-atuacao#militar",
      description:
        "Atuação especializada na defesa de direitos e garantias das carreiras militares, abrangendo questões administrativas, disciplinares e judiciais.",
      services: [
        "Defesa em processos administrativos disciplinares",
        "Recursos contra punições militares",
        "Questões previdenciárias militares",
        "Acidentes em serviço e indenizações",
        "Habeas corpus em âmbito militar",
        "Assessoria em promoções e reintegração",
      ],
      gradient: "from-champagne-400 to-champagne-600",
    },
    {
      id: "empresarial",
      title: "Direito Empresarial",
      shortTitle: "Empresarial",
      href: "/areas-de-atuacao#empresarial",
      description:
        "Assessoria jurídica completa para empresas, abrangendo desde a constituição societária até operações complexas de fusões, aquisições e reestruturações corporativas.",
      services: [
        "Constituição e alteração societária",
        "Fusões, aquisições e joint ventures",
        "Governança corporativa",
        "Contratos empresariais complexos",
        "Due diligence jurídica",
        "Planejamento sucessório empresarial",
      ],
      gradient: "from-forest-700 to-forest-950",
    },
  ] as readonly PracticeAreaConfig[],
  team: [
    {
      slug: "alessandra-steffens",
      name: "Alessandra Franke Steffens",
      role: "Advogada",
      oab: "OAB/SC 21.390-B | OAB/RS 55.474",
      email: "alessandra@erlohaas.com.br",
      image: "/images/team/alessandra-steffens.webp",
      deskImage: "/images/team/alessandra-mesa.jpg",
      specialties: ["Direito Criminal"],
      bio: "Atuação técnica e estratégica em Direito Penal, com foco em defesa em inquéritos, processos criminais, Tribunal do Júri e garantias fundamentais.",
      credentials: [
        "Inscrição ativa em SC e RS",
        "Defesa criminal e Tribunal do Júri",
      ],
      gradient: "from-champagne-400 to-champagne-600",
    },
    {
      slug: "luiza-haas",
      name: "Luíza Klein Haas",
      role: "Advogada",
      oab: "OAB/SC 65.939",
      email: "luiza@erlohaas.com.br",
      image: "/images/team/luiza-haas.webp",
      deskImage: "/images/team/luiza-mesa.jpeg",
      specialties: [
        "Direito Civil",
        "Direito do Agronegócio",
        "Direito Ambiental",
      ],
      bio: "Assessoria consultiva e contenciosa em demandas cíveis, contratos, sucessões, relações do agronegócio e regularização ambiental.",
      credentials: [
        "Contratos, família e sucessões",
        "Consultivo e contencioso agroambiental",
      ],
      gradient: "from-champagne-400 to-champagne-700",
    },
    {
      slug: "maisa-christ",
      name: "Maísa Christ",
      role: "Advogada",
      oab: "OAB/SC 74.365",
      email: "maisa@erlohaas.com.br",
      image: "/images/team/maisa-christ.webp",
      deskImage: "/images/team/maisa-mesa.jpg",
      specialties: ["Direito Civil"],
      bio: "Atuação dedicada em Direito Civil, com foco em contratos, responsabilidade civil, direito de família, sucessões e prevenção de litígios.",
      credentials: [
        "Direito Civil e obrigações",
        "Atendimento consultivo e judicial",
      ],
      gradient: "from-forest-600 to-forest-800",
    },
    {
      slug: "jacson-erlo",
      name: "Jacson Mateus Erlo",
      role: "Advogado",
      oab: "OAB/SC 74.319",
      email: "jacson@erlohaas.com.br",
      image: "/images/team/jacson-erlo.webp",
      deskImage: "/images/team/jacson-mesa.jpeg",
      specialties: [
        "Direito do Agronegócio",
        "Direito Civil",
        "Direito Ambiental",
      ],
      bio: "Assessoria jurídica ao produtor rural e empresas do agronegócio em crédito rural, Proagro, renegociação de dívidas, contratos e questões ambientais.",
      credentials: [
        "Crédito rural, Proagro e seguro rural",
        "Contencioso cível e agroambiental",
      ],
      gradient: "from-forest-800 to-forest-950",
    },
    {
      slug: "jean-erlo",
      name: "Jean Tiago Erlo",
      role: "Advogado",
      oab: "OAB/SC 67.239 | OAB/PR 134.567",
      email: "jean@erlohaas.com.br",
      image: "/images/team/jean-erlo.webp",
      deskImage: "/images/team/jean-mesa.jpeg",
      specialties: ["Direito do Agronegócio", "Direito Ambiental"],
      bio: "Atuação especializada em Direito do Agronegócio e Ambiental, com foco em crédito rural, regularização fundiária, CAR/SICAR e defesa em autos de infração.",
      credentials: [
        "Inscrição ativa em SC e PR",
        "Agronegócio e compliance ambiental",
      ],
      gradient: "from-forest-700 to-forest-950",
    },
  ] as readonly TeamMemberConfig[],
} as const;

export const TEAM_IMAGES: Record<string, string> = {
  "escritorio-ehs": "/images/logo-ehs-monogram.png",
  ...Object.fromEntries(SITE_CONFIG.team.map((member) => [member.slug, member.image])),
};
