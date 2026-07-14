import type { Metadata } from "next";
import ProagroPageContent from "./proagro-content";

export const metadata: Metadata = {
    title: "Proagro Negado | Análise Jurídica para Produtores Rurais",
    description: "Análise jurídica para produtores rurais com Proagro negado, reduzido ou glosado. Atendimento técnico em Direito do Agronegócio, crédito rural, Proagro e seguro rural.",
    alternates: {
        canonical: "https://www.ehsadvogados.com.br/proagro",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function ProagroPage() {
    return <ProagroPageContent />;
}
