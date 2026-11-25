import { UserProfile } from "@clerk/nextjs";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  await requireAdmin();

  return (
    <div className="max-w-3xl mx-auto pt-28 lg:pt-0">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-ink mb-1">
          Meu Perfil
        </h1>
        <p className="text-forest-600 text-sm">
          Gerencie suas informações de conta e configurações.
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-forest-100 p-6 overflow-hidden">
        <UserProfile
          appearance={{
            elements: {
              rootBox: "w-full",
              cardBox: "w-full shadow-none border-0",
              card: "shadow-none border-0",
              navbarMobileMenuButton: "text-forest-600",
              headerTitle: "font-display text-ink",
              headerSubtitle: "text-forest-600",
              formButtonPrimary:
                "bg-gold hover:bg-gold-dark text-ink hover:text-cream shadow-none rounded-xl",
              formFieldInput:
                "rounded-xl border-forest-200 focus:ring-champagne-500/50 focus:border-gold",
              formFieldLabel: "text-forest-600 text-sm",
            },
          }}
        />
      </div>
    </div>
  );
}
