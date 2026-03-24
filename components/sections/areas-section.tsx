"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
 Briefcase,
 Users,
 FileText,
 Scale,
 ShieldCheck,
 ArrowUpRight,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/section-title";
import { cn } from "@/lib/utils";

const areas = [
 {
 icon: Briefcase,
 title: "Direito Empresarial",
 description:
 "Assessoria jurídica para empresas em questões societárias, contratuais e patrimoniais, abrangendo constituição, reorganização, governança, negociações e resolução de conflitos empresariais.",
 href: "/areas-de-atuacao#empresarial",
 color: "from-[#1B2D1E] to-[#1B2D1E]",
 iconBg: "bg-[#3B5A3C]/50 text-[#0D1812] group-hover:bg-[#3B5A3C] group-hover:text-[#EEEDE5]",
 },
 {
 icon: FileText,
 title: "Direito Civil",
 description:
 "Atuação em contratos, responsabilidade civil, direito de família, sucessões e seguros, com orientação estratégica para prevenção de riscos e solução de controvérsias judiciais e extrajudiciais.",
 href: "/areas-de-atuacao#civil",
 color: "from-[#3B5A3C] to-[#1B2D1E]",
 iconBg: "bg-[#3B5A3C]/50 text-[#3B5A3C] group-hover:bg-[#3B5A3C] group-hover:text-[#EEEDE5]",
 },
  {
 icon: ShieldCheck,
 title: "Direito Militar",
 description:
 "Defesa judicial e administrativa de militares, com atuação em processos disciplinares, questões remuneratórias, promoções, reformas, licenças e demais direitos funcionais.",
 href: "/areas-de-atuacao#militar",
 color: "from-[#E8D49A] to-[#877249]",
 iconBg: "bg-[#E8D49A]/30 text-[#877249] group-hover:bg-[#E8D49A] group-hover:text-[#0D1812]",
 },
 {
 icon: Scale,
 title: "Direito Penal",
 description:
 "Defesa técnica em investigações, inquéritos e ações penais, com acompanhamento estratégico em todas as fases do processo, sempre voltado à proteção das garantias constitucionais.",
 href: "/areas-de-atuacao#penal",
 color: "from-[#1B2D1E] to-[#0D1812]",
 iconBg: "bg-[#3B5A3C]/50 text-[#0D1812] group-hover:bg-[#1B2D1E] group-hover:text-[#877249]/70",
 },
 {
 icon: Users,
 title: "Direito Agrário e do Agronegócio",
 description:
 "Assessoria ao produtor rural e às empresas do setor em contratos, dívidas de crédito rural, Proagro, seguro rural, questões fundiárias e contencioso do agronegócio.",
 href: "/areas-de-atuacao#agrario",
 color: "from-[#877249] to-[#877249]",
 iconBg: "bg-[#E8D49A]/30 text-[#877249] group-hover:bg-[#877249] group-hover:text-[#EEEDE5]",
 },
 {
 icon: Briefcase,
 title: "Direito Ambiental",
 description:
 "Atuação em licenciamento, autuações administrativas, compliance ambiental, regularização de atividades e defesa em demandas ligadas à legislação ambiental e ao setor produtivo.",
 href: "/areas-de-atuacao#ambiental",
 color: "from-[#3B5A3C] to-[#1B2D1E]",
 iconBg: "bg-[#3B5A3C]/50 text-[#3B5A3C] group-hover:bg-[#3B5A3C] group-hover:text-[#EEEDE5]",
 },
];

const containerVariants = {
 hidden: {},
 visible: {
 transition: { staggerChildren: 0.08 },
 },
};

const cardVariants = {
 hidden: { opacity: 0, y: 30 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function AreasSection() {
 return (
 <section className="py-24 lg:py-32 bg-[#EEEDE5] relative overflow-hidden">
 {/* Decorative blobs */}
 <div className="absolute top-0 left-0 w-72 h-72 bg-[#3B5A3C]/50/50 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
 <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#E8D49A]/30/40 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />

 <Container className="relative">
 <SectionTitle
 label="Áreas de Atuação"
 title="Experiência em diversas áreas de atuação do direito"
 />

 <motion.div
 variants={containerVariants}
 initial="hidden"
 whileInView="visible"
 viewport={{ once: true, margin: "-80px" }}
 className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
 >
 {areas.map((area) => (
 <motion.div key={area.title} variants={cardVariants}>
 <Link
 href={area.href}
 className={cn(
 "group relative flex flex-col h-full p-7 rounded-2xl bg-white border border-forest-100",
 "transition-all duration-400 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-forest-900/8 hover:border-forest-200",
 "no-underline"
 )}
 >
 {/* Gradient accent on hover */}
 <div
 className={cn(
 "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-400 group-hover:opacity-[0.03]",
 area.color
 )}
 />

 <div className="relative">
 <div
 className={cn(
 "flex h-12 w-12 items-center justify-center rounded-xl mb-5 transition-all duration-300",
 area.iconBg
 )}
 >
 <area.icon className="h-5 w-5" />
 </div>

 <h3 className="font-display text-xl font-bold text-[#0D1812] mb-3 flex items-center gap-2">
 {area.title}
 <ArrowUpRight className="h-4 w-4 text-[#E8D49A] opacity-0 -translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0" />
 </h3>

 <p className="text-[#3B5A3C] text-[0.925rem] leading-relaxed">
 {area.description}
 </p>
 </div>
 </Link>
 </motion.div>
 ))}
 </motion.div>
 </Container>
 </section>
 );
}
