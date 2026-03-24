import type { Metadata } from "next";
import Link from "next/link";
import {
    Briefcase, FileText, Scale, ShieldCheck, Users, Leaf,
    ArrowRight, CheckCircle,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/section-title";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Áreas de Atuação",
    description: "Atuamos em Direito Civil, Direito Penal, Agronegócio, Direito Ambiental, Direito Militar e Direito Agrário.",
};

const areas = [
    {
        id: "civil",
        icon: FileText,
        title: "Direito Civil",
        description: "Atuação abrangente em questões cíveis, incluindo contratos, responsabilidade civil, direito de família, sucessões e seguros, com orientação jurídica estratégica e atendimento personalizado para prevenção de riscos e adequada condução de demandas judiciais e extrajudiciais.",
        services: [
            "Contratos, seguros e obrigações",
            "Responsabilidade civil",
            "Direito de família e sucessões",
            "Direito securitário",
            "Inventários e partilhas",
            "Mediação e resolução de conflitos",
        ],
        gradient: "from-[#1B2D1E] to-[#1B2D1E]",
    },
    {
        id: "penal",
        icon: Scale,
        title: "Direito Penal",
        description: "Defesa técnica e estratégica em inquéritos policiais e processos criminais em todas as instâncias, com foco na proteção das garantias fundamentais do cidadão.",
        services: [
            "Defesa em inquéritos policiais",
            "Atuação em crimes dolosos e culposos",
            "Habeas corpus e liberdade provisória",
            "Crimes contra a pessoa e patrimônio",
            "Júri popular",
            "Recursos em instâncias superiores",
        ],
        gradient: "from-[#1B2D1E] to-[#0D1812]",
    },
    {
        id: "agrario",
        icon: Users,
        title: "Direito Agrário e do Agronegócio",
        description: "Assessoria jurídica especializada ao produtor rural e às empresas do agronegócio, com atuação em contratos agrários, crédito rural, Proagro, seguro rural, renegociação e prorrogação de dívidas rurais, regularização fundiária e contencioso vinculado à atividade rural.",
        services: [
            "Contratos agrários e relações no campo",
            "Crédito rural, financiamentos e garantias",
            "Proagro e seguro rural",
            "Renegociação e prorrogação de dívidas rurais",
            "Regularização fundiária e usucapião rural",
            "Litígios sobre posse, propriedade e atividade rural",
        ],
        gradient: "from-[#877249] to-[#877249]",
    },
    {
        id: "ambiental",
        icon: Leaf,
        title: "Direito Ambiental",
        description: "Assessoria em licenciamento ambiental, compliance regulatório e defesa em processos administrativos e judiciais relacionados à legislação ambiental.",
        services: [
            "Licenciamento e regularização ambiental",
            "Compliance ambiental e regulatório",
            "Defesa em autos de infração e processos administrativos",
            "Regularização de imóveis rurais e questões de CAR/SICAR",
            "Defesa em demandas e crimes ambientais",
            "Assessoria ambiental ao agronegócio",
        ],
        gradient: "from-[#3B5A3C] to-[#1B2D1E]",
    },
    {
        id: "militar",
        icon: ShieldCheck,
        title: "Direito Militar",
        description: "Atuação especializada na defesa de direitos e garantias das carreiras militares, abrangendo questões administrativas, disciplinares e judiciais.",
        services: [
            "Defesa em processos administrativos disciplinares",
            "Recursos contra punições militares",
            "Questões previdenciárias militares",
            "Acidentes em serviço e indenizações",
            "Habeas corpus em âmbito militar",
            "Assessoria em promoções e reintegração",
        ],
        gradient: "from-[#E8D49A] to-[#877249]",
    },
    {
        id: "empresarial",
        icon: Briefcase,
        title: "Direito Empresarial",
        description: "Assessoria jurídica completa para empresas, abrangendo desde a constituição societária até operações complexas de fusões, aquisições e reestruturações corporativas.",
        services: [
            "Constituição e alteração societária",
            "Fusões, aquisições e joint ventures",
            "Governança corporativa",
            "Contratos empresariais complexos",
            "Due diligence jurídica",
            "Planejamento sucessório empresarial",
        ],
        gradient: "from-[#1B2D1E] to-[#0D1812]",
    },
];


export default function AreasPage() {
    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 bg-gradient-to-b from-[#0D1812] to-[#1B2D1E] relative overflow-hidden">
                <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#E8D49A]/6 rounded-full blur-[120px]" />
                <Container className="relative">
                    <div className="max-w-3xl">
                        <span className="inline-block font-body text-sm font-semibold uppercase tracking-[0.2em] text-[#E8D49A] mb-4">
                            Áreas de Atuação
                        </span>
                        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#EEEDE5] leading-tight mb-6">
                            Soluções jurídicas
                            <span className="text-[#E8D49A]"> especializadas</span>
                        </h1>
                        <p className="text-lg text-[#EEEDE5]/70 leading-relaxed max-w-2xl">
                            Atuação multidisciplinar em diversas áreas do Direito, com equipe dedicada a cada segmento e foco em excelência técnica e atendimento qualificado.
                        </p>
                    </div>
                </Container>
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-[1] hidden md:block" style={{ height: '60px', background: 'linear-gradient(to bottom, transparent, #F5F0E8)' }} />
            </section>

            {/* Areas Detail */}
            <section className="py-20 lg:py-28">
                <Container>
                    <div className="space-y-20">
                        {areas.map((area, i) => (
                            <div
                                key={area.id}
                                id={area.id}
                                className={cn(
                                    "scroll-mt-24 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start",
                                    i % 2 !== 0 && "lg:[direction:rtl] lg:[&>*]:[direction:ltr]"
                                )}
                            >
                                {/* Info */}
                                <div>
                                    <div className={cn("inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-[#EEEDE5] mb-6", area.gradient)}>
                                        <area.icon className="h-6 w-6" />
                                    </div>
                                    <h2 className="font-display text-3xl font-bold text-[#0D1812] mb-4">{area.title}</h2>
                                    <p className="text-[#0D1812] leading-relaxed mb-8">{area.description}</p>
                                    <Link href="/contato">
                                        <Button variant="primary" className="group">
                                            Consultar sobre {area.id === "agrario" ? "Agrário e Agronegócio" : area.title.split(" ").pop()}
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Button>
                                    </Link>
                                </div>

                                {/* Services list */}
                                <div className="bg-white rounded-2xl border border-forest-100 p-7 lg:p-8 shadow-sm">
                                    <h3 className="font-display text-lg font-bold text-[#0D1812] mb-5 flex items-center gap-2">
                                        <Badge variant="accent" size="sm">Serviços</Badge>
                                    </h3>
                                    <ul className="space-y-3.5">
                                        {area.services.map((service) => (
                                            <li key={service} className="flex items-start gap-3">
                                                <CheckCircle className="h-5 w-5 text-[#877249] shrink-0 mt-0.5" />
                                                <span className="text-[#0D1812] text-[0.925rem] leading-relaxed">{service}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* CTA */}
            <section className="py-20 bg-[#1B2D1E]">
                <Container className="text-center">
                    <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#EEEDE5] mb-6">
                        Precisa de orientação jurídica?
                    </h2>
                    <p className="text-[#EEEDE5] text-lg max-w-xl mx-auto mb-8">
                        Entre em contato para uma consulta inicial. Estamos prontos para ajudar.
                    </p>
                    <Link href="/contato">
                        <Button variant="secondary" size="lg" className="group">
                            Fale Conosco
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </Container>
            </section>
        </>
    );
}
