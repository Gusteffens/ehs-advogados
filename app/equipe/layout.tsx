import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Nossa Equipe",
    description: "Conheça os advogados da Erlo, Haas & Steffens: especialistas em Direito Civil, Penal, Agronegócio e Ambiental.",
};

export default function EquipeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
