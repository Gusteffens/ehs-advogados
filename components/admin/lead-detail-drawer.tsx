"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  Compass,
  Copy,
  ExternalLink,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/site-config";
import { useToast } from "@/components/admin/toast-provider";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import type { AdminLeadItem, LeadStatus } from "@/components/admin/leads-table";

interface LeadDetailDrawerProps {
  lead: AdminLeadItem | null;
  emailNotificationsEnabled?: boolean;
  isUpdatingStatus: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onStatusChange: (leadId: string, status: LeadStatus) => Promise<void> | void;
  onDelete: (leadId: string) => Promise<boolean>;
}

const STATUS_OPTIONS: Array<{
  value: LeadStatus;
  label: string;
  activeClass: string;
}> = [
  {
    value: "new",
    label: "Novo",
    activeClass: "bg-champagne-200 text-champagne-900 border-champagne-400/70 shadow-xs",
  },
  {
    value: "contacted",
    label: "Contatado",
    activeClass: "bg-primary text-cream border-primary shadow-xs",
  },
  {
    value: "archived",
    label: "Arquivado",
    activeClass: "bg-forest-100 text-forest-800 border-forest-300 shadow-xs",
  },
];

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function buildWhatsAppReplyHref(lead: AdminLeadItem): string | null {
  if (!lead.phone) return null;
  const digits = lead.phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  const greeting = `Olá ${lead.name}, recebemos seu contato no site da ${SITE_CONFIG.legalName}${
    lead.subject ? ` sobre "${lead.subject}"` : ""
  }. Como podemos ajudar?`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(greeting)}`;
}

export function LeadDetailDrawer({
  lead,
  emailNotificationsEnabled = false,
  isUpdatingStatus,
  isDeleting,
  onClose,
  onStatusChange,
  onDelete,
}: LeadDetailDrawerProps) {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<"email" | "phone" | "message" | null>(null);
  const [whatsappOpened, setWhatsappOpened] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!lead) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !confirmDeleteOpen && !isDeleting) {
        onClose();
      }
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lead, confirmDeleteOpen, isDeleting, onClose]);

  if (!lead) return null;

  const whatsappHref = buildWhatsAppReplyHref(lead);
  const hasAttribution = Boolean(
    lead.source_page ||
      lead.utm_source ||
      lead.utm_medium ||
      lead.utm_campaign ||
      lead.gclid ||
      lead.fbclid
  );

  const handleCopy = async (
    field: "email" | "phone" | "message",
    value: string,
    label: string
  ) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      toast.info(`${label} copiado`, value.length > 60 ? `${value.slice(0, 60)}…` : value);
      window.setTimeout(() => {
        setCopiedField((curr) => (curr === field ? null : curr));
      }, 2000);
    } catch {
      toast.error("Não foi possível copiar", "Permita o acesso à área de transferência.");
    }
  };

  const handleConfirmDelete = async () => {
    setDeleteError(null);
    const deleted = await onDelete(lead.id);
    if (deleted) {
      setConfirmDeleteOpen(false);
      onClose();
    } else {
      setDeleteError("Não foi possível excluir este lead. Tente novamente.");
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex justify-end bg-ink/45 backdrop-blur-[2px] animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-drawer-title"
        onClick={() => {
          if (!isDeleting) onClose();
        }}
      >
        <aside
          className="relative flex h-full w-full max-w-xl flex-col bg-cream-light border-l border-forest-200/80 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          {/* Top hairline gold accent */}
          <div className="h-1 w-full bg-gradient-to-r from-primary via-gold-dark to-gold shrink-0" />

          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-forest-100 bg-white/80 px-6 py-5 shrink-0">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {lead.subject && (
                  <span className="inline-flex items-center rounded-md bg-cream px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-forest-700 border border-forest-100">
                    {lead.subject}
                  </span>
                )}
                {lead.email_sent ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-forest-50 px-2 py-0.5 text-[11px] font-medium text-forest-700 border border-forest-200/70">
                    <CheckCircle2 className="h-3 w-3 text-forest-600" />
                    E-mail entregue
                  </span>
                ) : emailNotificationsEnabled ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 border border-red-200">
                    <AlertTriangle className="h-3 w-3 text-red-600" />
                    Falha no envio de e-mail
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md bg-cream px-2 py-0.5 text-[11px] font-medium text-forest-600 border border-forest-200/70">
                    Salvo no painel
                  </span>
                )}
              </div>
              <h2
                id="lead-drawer-title"
                className="font-display text-2xl font-bold text-ink truncate"
              >
                {lead.name}
              </h2>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-forest-600">
                <Calendar className="h-3.5 w-3.5 text-gold-dark" />
                Recebido em {formatFullDate(lead.created_at)}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar detalhes do lead"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-forest-200/80 bg-white text-forest-700 hover:bg-cream hover:text-ink transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Email failure notice (only when Resend notifications are actually enabled) */}
            {!lead.email_sent && emailNotificationsEnabled && (
              <div className="rounded-xl border border-red-200/90 bg-red-50/80 px-4 py-3 text-xs text-red-900 leading-relaxed">
                <p className="font-semibold mb-0.5">
                  Notificação por e-mail não entregue
                </p>
                <p className="text-red-800/90">
                  O contato foi salvo com segurança no banco de dados, mas o disparo automático via Resend falhou. Responda diretamente ao cliente abaixo.
                </p>
              </div>
            )}

            {/* Quick Status Switcher */}
            <section className="rounded-2xl border border-forest-100 bg-white p-4">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-forest-600">
                  Status do Atendimento
                </span>
                {isUpdatingStatus && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-forest-600">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Salvando…
                  </span>
                )}
              </div>
              <div
                className="grid grid-cols-3 gap-2"
                role="group"
                aria-label="Alterar status do lead"
              >
                {STATUS_OPTIONS.map((option) => {
                  const active = lead.status === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={isUpdatingStatus || active}
                      onClick={() => onStatusChange(lead.id, option.value)}
                      className={cn(
                        "rounded-xl border px-3 py-2 text-xs font-semibold transition-all cursor-pointer disabled:cursor-default",
                        active
                          ? option.activeClass
                          : "border-forest-100 bg-cream-light text-forest-700 hover:border-forest-300 hover:bg-cream"
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Contact Actions & WhatsApp */}
            <section className="rounded-2xl border border-forest-100 bg-white p-4 space-y-3">
              <span className="block text-[11px] font-semibold uppercase tracking-widest text-forest-600">
                Canais de Contato
              </span>

              {/* Email row */}
              <div className="flex items-center justify-between gap-3 rounded-xl bg-cream-light px-3.5 py-2.5 border border-forest-100/80">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Mail className="h-4 w-4 text-gold-dark shrink-0" />
                  <a
                    href={`mailto:${lead.email}?subject=${encodeURIComponent(
                      lead.subject ? `Re: ${lead.subject}` : `Retorno — ${SITE_CONFIG.legalName}`
                    )}`}
                    className="text-sm font-medium text-ink hover:text-gold-dark truncate no-underline"
                  >
                    {lead.email}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("email", lead.email, "E-mail")}
                  className="inline-flex items-center gap-1 rounded-lg border border-forest-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-forest-700 hover:bg-cream hover:text-ink transition-colors shrink-0"
                >
                  {copiedField === "email" ? (
                    <>
                      <Check className="h-3 w-3 text-forest-600" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copiar
                    </>
                  )}
                </button>
              </div>

              {/* Phone row */}
              {lead.phone ? (
                <div className="flex items-center justify-between gap-3 rounded-xl bg-cream-light px-3.5 py-2.5 border border-forest-100/80">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Phone className="h-4 w-4 text-gold-dark shrink-0" />
                    <a
                      href={`tel:${lead.phone.replace(/\D/g, "")}`}
                      className="text-sm font-medium text-ink hover:text-gold-dark truncate no-underline"
                    >
                      {lead.phone}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy("phone", lead.phone!, "Telefone")}
                    className="inline-flex items-center gap-1 rounded-lg border border-forest-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-forest-700 hover:bg-cream hover:text-ink transition-colors shrink-0"
                  >
                    {copiedField === "phone" ? (
                      <>
                        <Check className="h-3 w-3 text-forest-600" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-forest-600/80 italic px-1">
                  Telefone não informado pelo cliente.
                </p>
              )}

              {/* WhatsApp Reply CTA */}
              {whatsappHref && (
                <div className="pt-1 space-y-2">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setWhatsappOpened(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-cream hover:bg-forest-800 transition-colors no-underline shadow-xs"
                  >
                    <MessageCircle className="h-4 w-4 text-gold" />
                    <span>Responder no WhatsApp com saudação</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                  </a>

                  {lead.status === "new" && (
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={() => onStatusChange(lead.id, "contacted")}
                      className={cn(
                        "flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition-all",
                        whatsappOpened
                          ? "border-gold-dark bg-champagne-100 text-ink hover:bg-champagne-200"
                          : "border-forest-200 bg-cream-light text-forest-700 hover:bg-cream hover:text-ink"
                      )}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-forest-600" />
                      <span>
                        {whatsappOpened
                          ? "WhatsApp aberto — Marcar como Contatado"
                          : "Marcar como Contatado"}
                      </span>
                    </button>
                  )}
                </div>
              )}
            </section>

            {/* Full Message */}
            <section className="rounded-2xl border border-forest-100 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-forest-600">
                  Mensagem do Cliente
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy("message", lead.message, "Mensagem")}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-forest-600 hover:bg-cream hover:text-ink transition-colors"
                >
                  {copiedField === "message" ? (
                    <>
                      <Check className="h-3 w-3 text-forest-600" />
                      Copiada
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copiar texto
                    </>
                  )}
                </button>
              </div>
              <div className="rounded-xl bg-cream-light/80 border border-forest-100/70 p-4 text-sm text-ink leading-relaxed whitespace-pre-line">
                {lead.message}
              </div>
            </section>

            {/* Attribution / Origin */}
            {hasAttribution && (
              <section className="rounded-2xl border border-forest-100 bg-white p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <Compass className="h-3.5 w-3.5 text-gold-dark" />
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-forest-600">
                    Atribuição &amp; Origem
                  </span>
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {lead.source_page && (
                    <div className="rounded-xl bg-cream-light px-3 py-2 border border-forest-100/70 sm:col-span-2">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-forest-600">
                        Página / Referrer
                      </dt>
                      <dd className="mt-0.5 font-mono text-ink break-all">
                        {lead.source_page}
                      </dd>
                    </div>
                  )}
                  {lead.utm_source && (
                    <div className="rounded-xl bg-cream-light px-3 py-2 border border-forest-100/70">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-forest-600">
                        UTM Source
                      </dt>
                      <dd className="mt-0.5 font-medium text-ink break-all">
                        {lead.utm_source}
                      </dd>
                    </div>
                  )}
                  {lead.utm_medium && (
                    <div className="rounded-xl bg-cream-light px-3 py-2 border border-forest-100/70">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-forest-600">
                        UTM Medium
                      </dt>
                      <dd className="mt-0.5 font-medium text-ink break-all">
                        {lead.utm_medium}
                      </dd>
                    </div>
                  )}
                  {lead.utm_campaign && (
                    <div className="rounded-xl bg-cream-light px-3 py-2 border border-forest-100/70 sm:col-span-2">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-forest-600">
                        UTM Campaign
                      </dt>
                      <dd className="mt-0.5 font-medium text-ink break-all">
                        {lead.utm_campaign}
                      </dd>
                    </div>
                  )}
                  {lead.gclid && (
                    <div className="rounded-xl bg-cream-light px-3 py-2 border border-forest-100/70 sm:col-span-2">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-forest-600">
                        Google Click ID (gclid)
                      </dt>
                      <dd className="mt-0.5 font-mono text-[11px] text-ink break-all">
                        {lead.gclid}
                      </dd>
                    </div>
                  )}
                  {lead.fbclid && (
                    <div className="rounded-xl bg-cream-light px-3 py-2 border border-forest-100/70 sm:col-span-2">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-forest-600">
                        Meta Click ID (fbclid)
                      </dt>
                      <dd className="mt-0.5 font-mono text-[11px] text-ink break-all">
                        {lead.fbclid}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-forest-100 bg-white/90 px-6 py-4 shrink-0">
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/70 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir lead
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-forest-200 bg-white px-4 py-2 text-xs font-semibold text-forest-700 hover:bg-cream hover:text-ink transition-colors"
            >
              Fechar
            </button>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Excluir lead permanentemente?"
        description={`O contato de ${lead.name} (${lead.email}) será removido definitivamente da caixa de leads. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir lead"
        cancelLabel="Cancelar"
        isPending={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </>
  );
}
