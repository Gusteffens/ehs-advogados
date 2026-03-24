import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function SignInPage() {
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-[#0D1812] md:bg-[#EEEDE5]">
            {/* LADO ESQUERDO - hidden on mobile */}
            <div className="hidden md:flex flex-1 flex-col justify-center items-center bg-[#0D1812] relative overflow-hidden p-12 lg:p-24 border-r border-[#3B5A3C]/20">
                {/* Radial Gradient Decoration */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#3B5A3C]/20 via-[#0D1812] to-[#0D1812] pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center max-w-sm text-center">
                    <Image
                        src="/images/logo-ehs-monogram.png"
                        alt="Erlo, Haas & Steffens"
                        width={180}
                        height={108}
                        className="object-contain mb-8"
                        priority
                    />
                    <h2 className="text-[#EEEDE5] font-display text-2xl md:text-3xl font-bold leading-snug">
                        Acesso exclusivo para
                        <span className="block text-[#E8D49A]">advogados do escritório</span>
                    </h2>
                    <p className="mt-6 text-[#EEEDE5]/60 text-sm leading-relaxed">
                        Este sistema é restrito à administração interna da firma Erlo, Haas & Steffens Advocacia. Se você é um cliente, por favor, entre em contato através dos nossos canais oficiais.
                    </p>
                </div>
            </div>

            {/* LADO DIREITO - the auth panel (scrollable, full height) */}
            <div className="flex-1 flex flex-col justify-center relative min-h-screen overflow-y-auto bg-[#0D1812] md:bg-[#EEEDE5]">
                <div className="absolute top-6 left-6 md:top-10 md:left-10 z-10">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-[#EEEDE5]/70 hover:text-[#E8D49A] md:text-[#0D1812]/60 md:hover:text-[#0D1812] transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar ao site
                    </Link>
                </div>

                <div className="w-full max-w-[440px] mx-auto flex flex-col px-6 py-12 md:py-16">
                    <div className="mb-8 text-center md:text-left">
                        {/* Show logo only on mobile */}
                        <div className="md:hidden flex justify-center mb-8">
                            <Image
                                src="/images/logo-ehs-monogram.png"
                                alt="Erlo, Haas & Steffens"
                                width={140}
                                height={84}
                                className="object-contain drop-shadow-lg"
                            />
                        </div>
                        <h1 className="font-display text-4xl font-bold text-[#E8D49A] md:text-[#0D1812] tracking-tight">
                            Área Restrita
                        </h1>
                        <p className="text-[#EEEDE5]/70 md:text-[#3B5A3C] mt-2 text-base md:font-medium">
                            Faça login para acessar o painel
                        </p>
                    </div>

                    <div className="w-full">
                        <SignIn
                            forceRedirectUrl="/admin"
                            appearance={{
                                variables: {
                                    colorPrimary: "#E8D49A",
                                    colorBackground: "#EEEDE5",
                                    colorText: "#0D1812",
                                    colorTextSecondary: "#3B5A3C",
                                    colorInputBackground: "#FFFFFF",
                                    colorInputText: "#0D1812",
                                    colorNeutral: "#3B5A3C",
                                    borderRadius: "0.5rem",
                                },
                                elements: {
                                    rootBox: {
                                        width: "100%",
                                        maxWidth: "420px",
                                    },
                                    card: {
                                        width: "100%",
                                        boxShadow: "none",
                                        backgroundColor: "#EEEDE5",
                                        padding: "0",
                                        border: "none",
                                    },
                                    headerTitle: { display: "none" },
                                    headerSubtitle: { display: "none" },
                                    footer: { backgroundColor: "#EEEDE5", padding: "0" },
                                    formButtonPrimary: {
                                        backgroundColor: "#0D1812",
                                        color: "#E8D49A",
                                        fontWeight: "600",
                                        padding: "0.875rem",
                                        boxShadow: "0 4px 14px 0 rgba(13, 24, 18, 0.39)",
                                    },
                                    socialButtonsBlockButton: {
                                        borderColor: "#3B5A3C",
                                        color: "#0D1812",
                                        backgroundColor: "transparent",
                                    },
                                    dividerLine: { backgroundColor: "#3B5A3C" },
                                    dividerText: { color: "#3B5A3C" },
                                    footerActionLink: { color: "#0D1812", fontWeight: "600" },
                                    formFieldInput: {
                                        borderColor: "rgba(59, 90, 60, 0.2)",
                                        padding: "0.75rem 1rem",
                                    },
                                    formFieldLabel: {
                                        fontWeight: "500",
                                    },
                                },
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
