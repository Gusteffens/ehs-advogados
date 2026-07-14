import type { Metadata } from "next";
import PenalPageContent from "./penal-content";

export const metadata: Metadata = {
    title: "Advocacia Criminal | EHS Advocacia",
    description: "Atuação jurídica estratégica e sigilosa em investigações, prisões, inquéritos, processos criminais, recursos e assistência às vítimas.",
    alternates: {
        canonical: "https://www.ehsadvogados.com.br/penal",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function PenalPage() {
    return <PenalPageContent />;
}
