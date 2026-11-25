import { ClerkProvider, SignIn } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function SignInPage() {
  return (
    <ClerkProvider signInUrl="/sign-in">
      <div className="min-h-screen flex flex-col md:flex-row bg-ink md:bg-cream">
        {/* LADO ESQUERDO - hidden on mobile */}
        <div className="hidden md:flex flex-1 flex-col justify-center items-center bg-ink relative overflow-hidden p-12 lg:p-24 border-r border-forest-600/20">
          {/* Radial Gradient Decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-forest-600/20 via-ink to-ink pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center max-w-sm text-center">
            <Image
              src="/images/logo-ehs-monogram.png"
              alt="Erlo, Haas & Steffens"
              width={180}
              height={108}
              className="object-contain mb-8"
              priority
            />
            <h2 className="text-cream font-display text-2xl md:text-3xl font-bold leading-snug">
              Acesso exclusivo para
              <span className="block text-gold">advogados do escritório</span>
            </h2>
            <p className="mt-6 text-cream/65 text-sm leading-relaxed">
              Este sistema é restrito à administração interna da firma Erlo, Haas
              & Steffens Advocacia. Se você é um cliente, por favor, entre em
              contato através dos nossos canais oficiais.
            </p>
          </div>
        </div>

        {/* LADO DIREITO - the auth panel */}
        <div className="flex-1 flex flex-col justify-center relative min-h-screen overflow-y-auto bg-ink md:bg-cream">
          <div className="absolute top-6 left-6 md:top-10 md:left-10 z-10">
            <Link
              href="/"
              className="flex items-center gap-2 text-cream/75 hover:text-gold md:text-ink/70 md:hover:text-ink transition-colors text-sm font-medium no-underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao site
            </Link>
          </div>

          <div className="w-full max-w-[440px] mx-auto flex flex-col px-6 pt-20 pb-12 md:py-16">
            <div className="mb-8 text-center md:text-left">
              {/* Show logo only on mobile */}
              <div className="md:hidden flex justify-center mb-6">
                <Image
                  src="/images/logo-ehs-monogram.png"
                  alt="Erlo, Haas & Steffens"
                  width={140}
                  height={84}
                  className="object-contain drop-shadow-lg"
                />
              </div>
              <h1 className="font-display text-4xl font-bold text-gold md:text-ink tracking-tight">
                Área Restrita
              </h1>
              <p className="text-cream/75 md:text-forest-600 mt-2 text-base md:font-medium">
                Faça login para acessar o painel
              </p>
            </div>

            <div className="w-full rounded-2xl bg-cream p-6 shadow-2xl md:rounded-none md:bg-transparent md:p-0 md:shadow-none">
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
                    borderRadius: "0.75rem",
                  },
                  elements: {
                    rootBox: "w-full max-w-[420px]",
                    cardBox: "w-full shadow-none border-0",
                    card: "w-full shadow-none bg-cream p-0 border-0",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    footer: "bg-cream p-0",
                    formButtonPrimary:
                      "bg-ink hover:bg-primary text-gold font-semibold py-3.5 shadow-md rounded-xl",
                    socialButtonsBlockButton:
                      "border-forest-300 text-ink bg-white hover:bg-cream-light rounded-xl",
                    dividerLine: "bg-forest-200",
                    dividerText: "text-forest-600",
                    footerActionLink: "text-ink font-semibold",
                    formFieldInput:
                      "border-forest-200 rounded-xl px-4 py-3 focus:border-gold focus:ring-champagne-500/40",
                    formFieldLabel: "font-medium text-ink",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </ClerkProvider>
  );
}
