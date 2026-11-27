import { AlertCircle, Info } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  LeadsTable,
  type AdminLeadItem,
  type LeadStatus,
} from "@/components/admin/leads-table";

export const dynamic = "force-dynamic";

function isMissingTableError(
  error: { code?: string; message?: string } | null
): boolean {
  if (!error) return false;
  const code = error.code ?? "";
  const msg = (error.message ?? "").toLowerCase();
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    (msg.includes("contact_leads") &&
      (msg.includes("does not exist") || msg.includes("could not find")))
  );
}

export default async function AdminLeadsPage() {
  await requireAdmin();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("contact_leads")
    .select(
      "id, name, email, phone, subject, message, status, utm_source, utm_medium, utm_campaign, gclid, fbclid, source_page, email_sent, created_at"
    )
    .order("created_at", { ascending: false });

  const tableMissing = isMissingTableError(error);
  const emailNotificationsEnabled = Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.CONTACT_EMAIL?.trim()
  );

  const leads: AdminLeadItem[] = (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    status: (row.status === "contacted" || row.status === "archived"
      ? row.status
      : "new") as LeadStatus,
    utm_source: row.utm_source,
    utm_medium: row.utm_medium,
    utm_campaign: row.utm_campaign,
    gclid: row.gclid,
    fbclid: row.fbclid,
    source_page: row.source_page,
    email_sent: Boolean(row.email_sent),
    created_at: row.created_at,
  }));

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-dark mb-1">
          Relacionamento &amp; Triagem
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">
          Caixa de Leads
        </h1>
        <p className="mt-1 text-sm text-forest-600">
          Gerencie contatos recebidos pelo formulário do site, acompanhe entregas de e-mail e responda clientes rapidamente.
        </p>
      </header>

      {tableMissing ? (
        <div className="rounded-2xl border border-champagne-300 bg-champagne-50 p-6 text-sm text-ink space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <Info className="h-4 w-4 text-gold-dark shrink-0" />
            <span>Tabela de leads ainda não criada no Supabase</span>
          </div>
          <p className="text-forest-700 leading-relaxed">
            Para habilitar o histórico de leads no painel administrativo, aplique
            a migration{" "}
            <code className="px-1.5 py-0.5 rounded bg-white border border-forest-100 text-xs">
              supabase/migrations/002_contact_leads.sql
            </code>{" "}
            no SQL Editor do Supabase. Enquanto isso, os contatos do formulário
            continuam sendo enviados normalmente por e-mail.
          </p>
        </div>
      ) : error ? (
        <div
          role="alert"
          className="mb-6 flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>
            Não foi possível carregar os leads. Tente recarregar a página.
          </span>
        </div>
      ) : (
        <LeadsTable
          leads={leads}
          emailNotificationsEnabled={emailNotificationsEnabled}
        />
      )}
    </div>
  );
}
