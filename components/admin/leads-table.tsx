"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Archive,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Inbox,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  bulkDeleteLeads,
  bulkUpdateLeadsStatus,
  deleteLead,
  updateLeadStatus,
} from "@/app/actions/admin-leads";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  buildWhatsAppReplyHref,
  LeadDetailDrawer,
} from "@/components/admin/lead-detail-drawer";
import { useToast } from "@/components/admin/toast-provider";
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
  gclid: string | null;
  fbclid: string | null;
  source_page: string | null;
  email_sent: boolean;
  created_at: string;
}

const PAGE_SIZE = 15;

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Novo",
  contacted: "Contatado",
  archived: "Arquivado",
};

const STATUS_BADGE_CLASSES: Record<LeadStatus, string> = {
  new: "bg-champagne-200/85 text-champagne-900 border border-champagne-400/50",
  contacted: "bg-forest-100 text-forest-800 border border-forest-200",
  archived: "bg-forest-50 text-forest-500 border border-forest-100",
};

function formatCompactDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeCsvCell(value: string | boolean | null | undefined): string {
  const str = value == null ? "" : String(value);
  let sanitized = str.replace(/\r?\n/g, " ");
  if (/^[=+\-@\t\r]/.test(sanitized)) {
    sanitized = `'${sanitized}`;
  }
  if (/[",;\n]/.test(sanitized)) {
    return `"${sanitized.replace(/"/g, '""')}"`;
  }
  return sanitized;
}

function exportLeadsToCsv(items: AdminLeadItem[]) {
  const headers = [
    "Data",
    "Nome",
    "E-mail",
    "Telefone",
    "Assunto",
    "Status",
    "E-mail Enviado",
    "Mensagem",
    "Página de Origem",
    "UTM Source",
    "UTM Medium",
    "UTM Campaign",
    "GCLID",
    "FBCLID",
  ];

  const rows = items.map((lead) => [
    formatCompactDate(lead.created_at),
    lead.name,
    lead.email,
    lead.phone ?? "",
    lead.subject ?? "",
    STATUS_LABELS[lead.status],
    lead.email_sent ? "Sim" : "Falha",
    lead.message,
    lead.source_page ?? "",
    lead.utm_source ?? "",
    lead.utm_medium ?? "",
    lead.utm_campaign ?? "",
    lead.gclid ?? "",
    lead.fbclid ?? "",
  ]);

  const csvBody = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ].join("\r\n");

  // UTF-8 BOM for clean Portuguese accent handling in Microsoft Excel
  const blob = new Blob(["\uFEFF" + csvBody], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `ehs-leads-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function LeadsTable({
  leads,
  emailNotificationsEnabled = false,
}: {
  leads: AdminLeadItem[];
  emailNotificationsEnabled?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LeadStatus>("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const counts = useMemo(() => {
    const acc = { all: leads.length, new: 0, contacted: 0, archived: 0, failedEmail: 0 };
    for (const lead of leads) {
      if (lead.status === "new") acc.new += 1;
      else if (lead.status === "contacted") acc.contacted += 1;
      else acc.archived += 1;
      if (!lead.email_sent) acc.failedEmail += 1;
    }
    return acc;
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((lead) => {
      if (statusFilter !== "all" && lead.status !== statusFilter) return false;
      if (!q) return true;
      return (
        lead.name.toLowerCase().includes(q) ||
        lead.email.toLowerCase().includes(q) ||
        (lead.phone?.toLowerCase().includes(q) ?? false) ||
        (lead.subject?.toLowerCase().includes(q) ?? false) ||
        lead.message.toLowerCase().includes(q) ||
        (lead.utm_source?.toLowerCase().includes(q) ?? false) ||
        (lead.utm_campaign?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [leads, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredLeads.slice(start, start + PAGE_SIZE);
  }, [filteredLeads, currentPage]);

  const activeLead = useMemo(
    () => (activeLeadId ? leads.find((item) => item.id === activeLeadId) ?? null : null),
    [leads, activeLeadId]
  );

  const pageIds = useMemo(() => paginatedLeads.map((l) => l.id), [paginatedLeads]);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const somePageSelected =
    pageIds.some((id) => selectedIds.has(id)) && !allPageSelected;

  const toggleSelectAllPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStatusChange = (leadId: string, nextStatus: LeadStatus) => {
    setUpdatingId(leadId);
    startTransition(async () => {
      try {
        const res = await updateLeadStatus(leadId, nextStatus);
        if (!res.ok) {
          toast.error("Erro ao atualizar status", res.error);
        } else {
          toast.success(
            "Status atualizado",
            `Lead marcado como "${STATUS_LABELS[nextStatus]}".`
          );
          router.refresh();
        }
      } catch (err: unknown) {
        toast.error("Erro ao atualizar status", getErrorMessage(err));
      } finally {
        setUpdatingId(null);
      }
    });
  };

  const handleBulkStatus = (nextStatus: LeadStatus) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    startTransition(async () => {
      try {
        const res = await bulkUpdateLeadsStatus(ids, nextStatus);
        if (!res.ok) {
          toast.error("Erro na ação em lote", res.error);
        } else {
          toast.success(
            `${ids.length} ${ids.length === 1 ? "lead atualizado" : "leads atualizados"}`,
            `Status alterado para "${STATUS_LABELS[nextStatus]}".`
          );
          setSelectedIds(new Set());
          router.refresh();
        }
      } catch (err: unknown) {
        toast.error("Erro na ação em lote", getErrorMessage(err));
      }
    });
  };

  const handleSingleDelete = async (leadId: string): Promise<boolean> => {
    setIsDeleting(true);
    try {
      const res = await deleteLead(leadId);
      if (!res.ok) {
        toast.error("Erro ao excluir lead", res.error);
        return false;
      }
      toast.success("Lead excluído", "O registro foi removido permanentemente.");
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(leadId);
        return next;
      });
      router.refresh();
      return true;
    } catch (err: unknown) {
      toast.error("Erro ao excluir lead", getErrorMessage(err));
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setBulkDeleteError(null);
    setIsDeleting(true);

    startTransition(async () => {
      try {
        const res = await bulkDeleteLeads(ids);
        if (!res.ok) {
          setBulkDeleteError(res.error ?? "Não foi possível excluir os leads.");
          toast.error("Erro ao excluir leads", res.error);
        } else {
          toast.success(
            `${ids.length} ${ids.length === 1 ? "lead excluído" : "leads excluídos"}`,
            "Os registros selecionados foram removidos."
          );
          setSelectedIds(new Set());
          if (activeLeadId && ids.includes(activeLeadId)) {
            setActiveLeadId(null);
          }
          setBulkDeleteOpen(false);
          router.refresh();
        }
      } catch (err: unknown) {
        const msg = getErrorMessage(err);
        setBulkDeleteError(msg);
        toast.error("Erro ao excluir leads", msg);
      } finally {
        setIsDeleting(false);
      }
    });
  };

  const handleExportCsv = () => {
    const targets =
      selectedIds.size > 0
        ? leads.filter((l) => selectedIds.has(l.id))
        : filteredLeads;

    if (targets.length === 0) {
      toast.info("Nada para exportar", "Nenhum lead corresponde ao filtro atual.");
      return;
    }

    exportLeadsToCsv(targets);
    toast.success(
      "CSV exportado",
      `${targets.length} ${targets.length === 1 ? "registro exportado" : "registros exportados"} com suporte a Excel (UTF-8).`
    );
  };

  const filterTabs: Array<{
    key: "all" | LeadStatus;
    label: string;
    count: number;
  }> = [
    { key: "all", label: "Todos", count: counts.all },
    { key: "new", label: "Novos", count: counts.new },
    { key: "contacted", label: "Contatados", count: counts.contacted },
    { key: "archived", label: "Arquivados", count: counts.archived },
  ];

  const rangeStart = filteredLeads.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filteredLeads.length);

  return (
    <div className="space-y-6 pb-20">
      {/* Compact Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-forest-100 bg-white px-4 py-3.5 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-forest-600">
            Total Recebido
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-ink">
            {counts.all}
          </p>
        </div>
        <div className="rounded-2xl border border-champagne-300/80 bg-champagne-50/70 px-4 py-3.5 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-champagne-800">
            Novos (Aguardando)
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-ink">
            {counts.new}
          </p>
        </div>
        <div className="rounded-2xl border border-forest-100 bg-white px-4 py-3.5 shadow-xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-forest-600">
            Contatados
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-primary">
            {counts.contacted}
          </p>
        </div>
        {emailNotificationsEnabled ? (
          <div
            className={cn(
              "rounded-2xl border px-4 py-3.5 shadow-xs",
              counts.failedEmail > 0
                ? "border-red-200 bg-red-50/60"
                : "border-forest-100 bg-white"
            )}
          >
            <p
              className={cn(
                "text-[11px] font-semibold uppercase tracking-wider",
                counts.failedEmail > 0 ? "text-red-700" : "text-forest-600"
              )}
            >
              Falhas de E-mail
            </p>
            <p
              className={cn(
                "mt-1 font-display text-2xl font-bold",
                counts.failedEmail > 0 ? "text-red-700" : "text-ink"
              )}
            >
              {counts.failedEmail}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-forest-100 bg-white px-4 py-3.5 shadow-xs">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-forest-600">
              Arquivados
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-forest-700">
              {counts.archived}
            </p>
          </div>
        )}
      </div>

      {/* Controls: Status Tabs + Search + Export CSV */}
      <div className="rounded-2xl border border-forest-100 bg-white p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status filter tabs */}
          <div
            className="flex items-center gap-1.5 flex-wrap"
            role="tablist"
            aria-label="Filtrar leads por status"
          >
            {filterTabs.map((tab) => {
              const active = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setStatusFilter(tab.key);
                    setPage(1);
                  }}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                    active
                      ? "bg-primary text-cream shadow-xs"
                      : "bg-cream-light text-forest-700 border border-forest-100 hover:bg-cream hover:text-ink"
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                      active
                        ? "bg-white/15 text-gold"
                        : "bg-white text-forest-600 border border-forest-100"
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-forest-200 bg-cream-light px-3.5 py-2 text-xs font-semibold text-ink hover:bg-cream hover:border-gold-dark transition-colors shrink-0 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-gold-dark" />
            <span>
              {selectedIds.size > 0
                ? `Exportar CSV (${selectedIds.size})`
                : "Exportar CSV"}
            </span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-forest-600 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nome, e-mail, telefone, assunto ou mensagem..."
            aria-label="Buscar leads"
            className="w-full rounded-xl border border-forest-200/90 bg-cream-light/60 pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-forest-600/65 focus:bg-white focus:outline-none focus:ring-2 focus:ring-champagne-500/40 focus:border-gold-dark transition-all"
          />
        </div>
      </div>

      {/* Leads Inbox Table */}
      {paginatedLeads.length > 0 ? (
        <div className="rounded-2xl border border-forest-100 bg-white shadow-xs overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-forest-100 bg-cream-light/90 text-[11px] font-semibold uppercase tracking-wider text-forest-600">
                  <th className="w-11 py-3.5 pl-4 pr-2">
                    <input
                      type="checkbox"
                      checked={allPageSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = somePageSelected;
                      }}
                      onChange={toggleSelectAllPage}
                      aria-label="Selecionar todos os leads desta página"
                      className="h-4 w-4 rounded border-forest-300 text-primary focus:ring-gold-dark accent-primary cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-3">Contato</th>
                  <th className="py-3.5 px-3">Assunto &amp; Mensagem</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">E-mail</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-3 whitespace-nowrap">Data</th>
                  <th className="py-3.5 pl-3 pr-4 text-right whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-100/80 text-sm">
                {paginatedLeads.map((lead) => {
                  const selected = selectedIds.has(lead.id);
                  const isRowUpdating = isPending && updatingId === lead.id;
                  const whatsappHref = buildWhatsAppReplyHref(lead);

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setActiveLeadId(lead.id)}
                      className={cn(
                        "group transition-colors cursor-pointer",
                        selected
                          ? "bg-champagne-50/70"
                          : lead.status === "new"
                            ? "bg-white hover:bg-cream-light/80"
                            : "bg-white/70 hover:bg-cream-light/70"
                      )}
                    >
                      <td
                        className="py-3.5 pl-4 pr-2 align-top"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleSelectOne(lead.id)}
                          aria-label={`Selecionar ${lead.name}`}
                          className="mt-1 h-4 w-4 rounded border-forest-300 text-primary focus:ring-gold-dark accent-primary cursor-pointer"
                        />
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-3 align-top min-w-[200px]">
                        <div className="flex items-center gap-2">
                          {lead.status === "new" && (
                            <span
                              className="h-2 w-2 rounded-full bg-gold-dark shrink-0"
                              title="Lead novo"
                            />
                          )}
                          <span className="font-display text-base font-bold text-ink group-hover:text-primary transition-colors">
                            {lead.name}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-col gap-0.5 text-xs text-forest-600">
                          <span className="inline-flex items-center gap-1.5 truncate max-w-[230px]">
                            <Mail className="h-3 w-3 shrink-0 text-forest-400" />
                            <span className="truncate">{lead.email}</span>
                          </span>
                          {lead.phone && (
                            <span className="inline-flex items-center gap-1.5">
                              <Phone className="h-3 w-3 shrink-0 text-forest-400" />
                              {lead.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Subject & Preview */}
                      <td className="py-3.5 px-3 align-top max-w-md">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          {lead.subject && (
                            <span className="inline-flex items-center rounded-md bg-cream px-2 py-0.5 text-[11px] font-semibold text-forest-800">
                              {lead.subject}
                            </span>
                          )}
                          {lead.utm_source && (
                            <span className="inline-flex items-center rounded-md bg-forest-50 px-1.5 py-0.5 text-[10px] font-medium text-forest-600">
                              {lead.utm_source}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-forest-700/90 line-clamp-2 leading-relaxed">
                          {lead.message}
                        </p>
                      </td>

                      {/* Email delivery status */}
                      <td className="py-3.5 px-3 align-top whitespace-nowrap">
                        {lead.email_sent ? (
                          <span
                            title="E-mail de notificação enviado com sucesso"
                            className="inline-flex items-center gap-1 rounded-lg bg-forest-50 px-2.5 py-1 text-[11px] font-medium text-forest-700 border border-forest-100"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-forest-600" />
                            Enviado
                          </span>
                        ) : emailNotificationsEnabled ? (
                          <span
                            title="Falha ao enviar notificação por e-mail"
                            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 border border-red-200"
                          >
                            <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                            Falha
                          </span>
                        ) : (
                          <span
                            title="Notificações por e-mail desativadas — lead salvo no painel"
                            className="inline-flex items-center gap-1 rounded-lg bg-cream px-2.5 py-1 text-[11px] font-medium text-forest-600 border border-forest-100"
                          >
                            <Inbox className="h-3.5 w-3.5 text-forest-500" />
                            No painel
                          </span>
                        )}
                      </td>

                      {/* Inline status select */}
                      <td
                        className="py-3.5 px-3 align-top whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1.5">
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
                            className={cn(
                              "rounded-lg px-2.5 py-1 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-champagne-500/40 disabled:opacity-50 cursor-pointer",
                              STATUS_BADGE_CLASSES[lead.status]
                            )}
                          >
                            <option value="new">Novo</option>
                            <option value="contacted">Contatado</option>
                            <option value="archived">Arquivado</option>
                          </select>
                          {isRowUpdating && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-forest-600" />
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3 align-top whitespace-nowrap text-xs text-forest-600">
                        {formatCompactDate(lead.created_at)}
                      </td>

                      {/* Quick Actions */}
                      <td
                        className="py-3.5 pl-3 pr-4 align-top whitespace-nowrap text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="inline-flex items-center gap-1.5">
                          {whatsappHref && (
                            <a
                              href={whatsappHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Responder no WhatsApp"
                              aria-label={`Responder ${lead.name} no WhatsApp`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-gold hover:bg-forest-800 transition-colors"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setActiveLeadId(lead.id)}
                            title="Ver detalhes"
                            aria-label={`Ver detalhes de ${lead.name}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-forest-200 bg-white text-forest-700 hover:bg-cream hover:text-ink transition-colors cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-forest-100">
            {paginatedLeads.map((lead) => {
              const selected = selectedIds.has(lead.id);
              return (
                <div
                  key={lead.id}
                  onClick={() => setActiveLeadId(lead.id)}
                  className={cn(
                    "p-4 transition-colors cursor-pointer",
                    selected ? "bg-champagne-50/70" : "bg-white hover:bg-cream-light/60"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selected}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleSelectOne(lead.id)}
                      aria-label={`Selecionar ${lead.name}`}
                      className="mt-1 h-4 w-4 rounded border-forest-300 text-primary accent-primary shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-base font-bold text-ink truncate">
                          {lead.name}
                        </h3>
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider shrink-0",
                            STATUS_BADGE_CLASSES[lead.status]
                          )}
                        >
                          {STATUS_LABELS[lead.status]}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-forest-600">
                        <span className="truncate">{lead.email}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatCompactDate(lead.created_at)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {lead.subject && (
                          <span className="rounded-md bg-cream px-2 py-0.5 text-[10px] font-semibold text-forest-800">
                            {lead.subject}
                          </span>
                        )}
                        {lead.email_sent ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-forest-50 px-2 py-0.5 text-[10px] font-medium text-forest-700">
                            <CheckCircle2 className="h-3 w-3 text-forest-600" />
                            E-mail enviado
                          </span>
                        ) : emailNotificationsEnabled ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                            Falha no e-mail
                          </span>
                        ) : null}
                      </div>

                      <p className="text-xs text-forest-700 line-clamp-2 leading-relaxed">
                        {lead.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-forest-100 bg-cream-light/60 px-4 py-3 text-xs text-forest-600">
            <span>
              Mostrando <strong className="text-ink">{rangeStart}–{rangeEnd}</strong> de{" "}
              <strong className="text-ink">{filteredLeads.length}</strong>{" "}
              {filteredLeads.length === 1 ? "lead" : "leads"}
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-forest-200 bg-white px-2.5 py-1.5 font-medium text-forest-700 hover:bg-cream disabled:opacity-40 cursor-pointer disabled:cursor-default"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Anterior
                </button>
                <span className="px-2 font-medium text-ink">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-forest-200 bg-white px-2.5 py-1.5 font-medium text-forest-700 hover:bg-cream disabled:opacity-40 cursor-pointer disabled:cursor-default"
                >
                  Próxima
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-forest-100 bg-white px-6 py-14 text-center shadow-xs">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-cream text-gold-dark">
            <Inbox className="h-5 w-5" />
          </div>
          <p className="font-display text-lg font-bold text-ink">
            {search.trim() || statusFilter !== "all"
              ? "Nenhum lead encontrado"
              : "Caixa de leads vazia"}
          </p>
          <p className="mt-1 text-xs text-forest-600 max-w-sm mx-auto">
            {search.trim() || statusFilter !== "all"
              ? "Tente ajustar o termo de busca ou trocar a aba de status."
              : "Os contatos enviados pelo formulário do site aparecerão aqui automaticamente."}
          </p>
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div
          role="region"
          aria-label="Ações em lote para leads selecionados"
          className="fixed bottom-5 left-1/2 lg:left-[calc(50%+8rem)] -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl rounded-2xl border border-gold/30 bg-ink px-4 py-3 text-cream shadow-2xl animate-slide-up"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-lg bg-gold px-2 text-xs font-bold text-ink">
                {selectedIds.size}
              </span>
              <span className="text-xs font-medium text-cream/90">
                {selectedIds.size === 1 ? "lead selecionado" : "leads selecionados"}
              </span>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-cream/70 hover:bg-white/10 hover:text-cream transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
                Limpar
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleBulkStatus("contacted")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-cream border border-forest-600 hover:bg-forest-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-gold" />
                Marcar Contatado
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleBulkStatus("archived")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-cream hover:bg-white/20 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Archive className="h-3.5 w-3.5 text-gold" />
                Arquivar
              </button>
              <button
                type="button"
                disabled={isPending || isDeleting}
                onClick={() => {
                  setBulkDeleteError(null);
                  setBulkDeleteOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Lead Detail Drawer */}
      <LeadDetailDrawer
        key={activeLead?.id ?? "closed"}
        lead={activeLead}
        emailNotificationsEnabled={emailNotificationsEnabled}
        isUpdatingStatus={isPending && updatingId === activeLead?.id}
        isDeleting={isDeleting}
        onClose={() => setActiveLeadId(null)}
        onStatusChange={handleStatusChange}
        onDelete={handleSingleDelete}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        open={bulkDeleteOpen}
        title={`Excluir ${selectedIds.size} ${selectedIds.size === 1 ? "lead" : "leads"}?`}
        description="Os registros selecionados serão removidos permanentemente do banco de dados. Esta ação não pode ser desfeita."
        confirmLabel="Excluir selecionados"
        cancelLabel="Cancelar"
        isPending={isDeleting}
        error={bulkDeleteError}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />
    </div>
  );
}
