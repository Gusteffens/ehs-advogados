"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Calendar,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Search,
} from "lucide-react";
import { updateLeadStatus } from "@/app/actions/blog";
import { cn, getErrorMessage } from "@/lib/utils";

export type LeadStatus = "new" | "contacted" | "archived";

export interface AdminLeadItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: LeadStatus;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  source_page: string | null;
  email_sent: boolean;
  created_at: string;
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Novo",
  contacted: "Contatado",
  archived: "Arquivado",
};

const STATUS_BADGE_CLASSES: Record<LeadStatus, string> = {
  new: "bg-champagne-200/80 text-champagne-900",
  contacted: "bg-forest-100 text-forest-800",
  archived: "bg-forest-50 text-forest-500",
};

function formatLeadDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildWhatsAppReplyHref(lead: AdminLeadItem): string | null {
  if (!lead.phone) return null;
  const digits = lead.phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  const greeting = `Olá ${lead.name}, recebemos seu contato no site da Erlo, Haas & Steffens Advocacia${
    lead.subject ? ` sobre "${lead.subject}"` : ""
  }. Como podemos ajudar?`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(greeting)}`;
}

export function LeadsTable({ leads }: { leads: AdminLeadItem[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LeadStatus>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const counts = useMemo(() => {
    const acc = { all: leads.length, new: 0, contacted: 0, archived: 0 };
    for (const lead of leads) {
      if (lead.status === "new") acc.new += 1;
      else if (lead.status === "contacted") acc.contacted += 1;
      else acc.archived += 1;
    }
    return acc;
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((lead) => {
      if (statusFilter !== "all" && lead.status !== statusFilter) return false;
      if (q) {
        return (
          lead.name.toLowerCase().includes(q) ||
          lead.email.toLowerCase().includes(q) ||
          (lead.subject?.toLowerCase().includes(q) ?? false) ||
          lead.message.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [leads, search, statusFilter]);

  const handleStatusChange = (leadId: string, nextStatus: LeadStatus) => {
    setActionError(null);
    setUpdatingId(leadId);
    startTransition(async () => {
      try {
        const res = await updateLeadStatus(leadId, nextStatus);
        if (res?.error) {
          setActionError(res.error);
        } else {
          router.refresh();
        }
      } catch (err: unknown) {
        setActionError(getErrorMessage(err));
      } finally {
        setUpdatingId(null);
      }
    });
  };

  const filterButtons: Array<{
    key: "all" | LeadStatus;
    label: string;
    count: number;
  }> = [
    { key: "all", label: "Todos", count: counts.all },
    { key: "new", label: "Novos", count: counts.new },
    { key: "contacted", label: "Contatados", count: counts.contacted },
    { key: "archived", label: "Arquivados", count: counts.archived },
  ];

  return (
    <>
      {actionError && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Search + status filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-forest-600 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail, assunto ou mensagem..."
            aria-label="Buscar leads"
            className="w-full rounded-xl border border-forest-200 bg-white pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-forest-600/70 focus:outline-none focus:ring-2 focus:ring-champagne-500/50 focus:border-gold transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Filtrar leads">
          {filterButtons.map((btn) => {
            const active = statusFilter === btn.key;
            return (
              <button
                key={btn.key}
                type="button"
                onClick={() => setStatusFilter(btn.key)}
                aria-pressed={active}
                className={cn(
                  "rounded-xl px-3.5 py-2.5 text-xs font-medium transition-colors whitespace-nowrap",
                  active
                    ? "bg-primary text-cream shadow-xs"
                    : "border border-forest-200 bg-white text-forest-700 hover:bg-cream"
                )}
              >
                {btn.label} ({btn.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Leads cards */}
      {filteredLeads.length > 0 ? (
        <div className="space-y-4">
          {filteredLeads.map((lead) => {
            const whatsappHref = buildWhatsAppReplyHref(lead);
            const isRowUpdating = isPending && updatingId === lead.id;

            return (
              <div
                key={lead.id}
                className="rounded-2xl bg-white border border-forest-100 p-5 sm:p-6 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-display text-lg font-bold text-ink">
                        {lead.name}
                      </h3>
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider",
                          STATUS_BADGE_CLASSES[lead.status]
                        )}
                      >
                        {STATUS_LABELS[lead.status]}
                      </span>
                      {lead.subject && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-medium bg-cream text-forest-700">
                          {lead.subject}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-forest-600">
                      <a
                        href={`mailto:${lead.email}`}
                        className="inline-flex items-center gap-1 hover:text-ink no-underline"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {lead.email}
                      </a>
                      {lead.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {lead.phone}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatLeadDate(lead.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {whatsappHref && (
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-cream hover:bg-forest-800 transition-colors no-underline"
                      >
                        <MessageCircle className="h-3.5 w-3.5 text-gold" />
                        Responder no WhatsApp
                      </a>
                    )}
                    <div className="relative inline-flex items-center">
                      <select
                        value={lead.status}
                        disabled={isRowUpdating}
                        aria-label={`Alterar status de ${lead.name}`}
                        onChange={(e) =>
                          handleStatusChange(
                            lead.id,
                            e.target.value as LeadStatus
                          )
                        }
                        className="rounded-xl border border-forest-200 bg-cream/50 px-3 py-2 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-champagne-500/40 disabled:opacity-50"
                      >
                        <option value="new">Novo</option>
                        <option value="contacted">Contatado</option>
                        <option value="archived">Arquivado</option>
                      </select>
                      {isRowUpdating && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-forest-600 ml-1.5" />
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-ink/85 leading-relaxed whitespace-pre-line bg-cream/40 rounded-xl p-4 border border-forest-100/70">
                  {lead.message}
                </p>

                {(lead.utm_source || lead.utm_campaign || lead.source_page) && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-forest-600/80">
                    {lead.source_page && (
                      <span className="rounded-md bg-forest-50 px-2 py-0.5">
                        Origem: {lead.source_page}
                      </span>
                    )}
                    {lead.utm_source && (
                      <span className="rounded-md bg-forest-50 px-2 py-0.5">
                        utm_source: {lead.utm_source}
                      </span>
                    )}
                    {lead.utm_campaign && (
                      <span className="rounded-md bg-forest-50 px-2 py-0.5">
                        utm_campaign: {lead.utm_campaign}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-forest-100 px-6 py-12 text-center text-sm text-forest-600">
          {search.trim() || statusFilter !== "all"
            ? "Nenhum lead encontrado com os filtros selecionados."
            : "Nenhum lead registrado ainda."}
        </div>
      )}
    </>
  );
}
