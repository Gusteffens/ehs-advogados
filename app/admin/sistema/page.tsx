import { requireAdmin } from "@/lib/auth";
import { SystemHealthPanel } from "@/components/admin/system-health-panel";

export const dynamic = "force-dynamic";

export default async function SistemaPage() {
  await requireAdmin();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">
          Saúde do Sistema & Integrações
        </h1>
        <p className="text-forest-600 text-sm mt-1">
          Monitore a conectividade do Supabase, Upstash Redis, envio de e-mails,
          analytics, autenticação administrativa e validade do token do Instagram.
        </p>
      </div>

      <SystemHealthPanel />
    </div>
  );
}
