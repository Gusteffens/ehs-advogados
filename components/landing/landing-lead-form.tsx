"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  MessageCircle,
  RotateCcw,
} from "lucide-react";
import { submitLandingLead } from "@/app/actions/landing-leads";
import { Button, buttonVariants } from "@/components/ui/button";
import { captureAttribution, getStoredAttribution } from "@/lib/attribution";
import { trackContactLead, trackWhatsAppClick } from "@/lib/tracking";
import { cn } from "@/lib/utils";

export interface LandingLeadFormProps {
  sourcePage: "/penal" | "/proagro";
  defaultSubject: string;
  subjectLabel?: string;
  subjectOptions?: readonly string[];
  nameLabel?: string;
  namePlaceholder?: string;
  phoneLabel?: string;
  phonePlaceholder?: string;
  showEmailField?: boolean;
  messageLabel?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
  submitVariant?: "primary" | "secondary";
  privacyNote?: string;
  trackingPlacement: string;
  trackingLabel: string;
}

export function LandingLeadForm({
  sourcePage,
  defaultSubject,
  subjectLabel = "Assunto",
  subjectOptions,
  nameLabel = "Nome completo",
  namePlaceholder = "Como podemos chamar você?",
  phoneLabel = "Telefone / WhatsApp",
  phonePlaceholder = "(49) 99999-9999",
  showEmailField = false,
  messageLabel = "Mensagem",
  messagePlaceholder = "Descreva brevemente a situação, sem incluir documentos ou dados sensíveis.",
  submitLabel = "Enviar e abrir WhatsApp",
  submitVariant = "secondary",
  privacyNote = "Sua solicitação é registrada com sigilo pela equipe EHS Advocacia e abre o WhatsApp com a mensagem preenchida.",
  trackingPlacement,
  trackingLabel,
}: LandingLeadFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(
    subjectOptions && subjectOptions.length > 0
      ? subjectOptions[0]
      : defaultSubject
  );
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{
    whatsappUrl: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    captureAttribution();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      const stored = getStoredAttribution();
      const attribution =
        Object.keys(stored).length > 0 ? stored : captureAttribution();

      const result = await submitLandingLead({
        name,
        phone,
        email: showEmailField ? email : undefined,
        subject: subjectOptions ? subject : defaultSubject,
        message,
        sourcePage,
        utm_source: attribution.utm_source,
        utm_medium: attribution.utm_medium,
        utm_campaign: attribution.utm_campaign,
        gclid: attribution.gclid,
        fbclid: attribution.fbclid,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      const eventId =
        result.leadId ??
        (typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `lp-${Date.now()}`);

      trackContactLead(eventId, subjectOptions ? subject : defaultSubject);
      trackWhatsAppClick({
        page: sourcePage,
        placement: trackingPlacement,
        label: subjectOptions
          ? `${trackingLabel} (${subject})`
          : trackingLabel,
      });

      setSubmitted({
        whatsappUrl: result.whatsappUrl,
        name: name.trim(),
      });

      // Attempt to open WhatsApp immediately; confirmation card remains as fallback if popup is blocked
      window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
    } catch {
      setError(
        "Não foi possível enviar sua solicitação. Verifique sua conexão e tente novamente."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(null);
    setError(null);
    setName("");
    setPhone("");
    setEmail("");
    setMessage("");
    setSubject(
      subjectOptions && subjectOptions.length > 0
        ? subjectOptions[0]
        : defaultSubject
    );
  };

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl bg-white border border-forest-200 p-7 sm:p-9 shadow-lg shadow-forest-900/5 space-y-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest-900 text-gold">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="inline-block font-body text-xs font-semibold uppercase tracking-[0.18em] text-gold-dark mb-1">
              Solicitação registrada
            </span>
            <h3 className="font-display text-2xl font-bold text-ink leading-snug">
              Recebemos seus dados, {submitted.name}
            </h3>
            <p className="mt-2 text-sm text-forest-600 leading-relaxed">
              Seu contato já está registrado com nossa equipe. Caso o WhatsApp
              não tenha aberto automaticamente no seu navegador, clique no botão
              abaixo para continuar o atendimento agora.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <a
            href={submitted.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackWhatsAppClick({
                page: sourcePage,
                placement: `${trackingPlacement}-fallback`,
                label: `${trackingLabel} (Botão Fallback)`,
              })
            }
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "flex-1 no-underline text-base"
            )}
          >
            <MessageCircle className="h-4 w-4" />
            Abrir WhatsApp agora
            <ArrowRight className="h-4 w-4" />
          </a>

          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={handleReset}
            className="text-forest-600 hover:text-ink"
          >
            <RotateCcw className="h-4 w-4" />
            Enviar nova mensagem
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      id="whatsapp-contact-form"
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white border border-forest-100 p-6 sm:p-8 shadow-lg shadow-forest-900/5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="lp-contact-name"
            className="text-xs font-bold uppercase tracking-wider text-forest-900"
          >
            {nameLabel}
          </label>
          <input
            id="lp-contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={namePlaceholder}
            disabled={submitting}
            className="w-full rounded-xl border border-forest-200 bg-cream-light/50 px-4 py-3 text-sm text-ink placeholder:text-forest-400 focus:border-gold-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/40 transition-all disabled:opacity-60"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="lp-contact-phone"
            className="text-xs font-bold uppercase tracking-wider text-forest-900"
          >
            {phoneLabel}
          </label>
          <input
            id="lp-contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={phonePlaceholder}
            disabled={submitting}
            className="w-full rounded-xl border border-forest-200 bg-cream-light/50 px-4 py-3 text-sm text-ink placeholder:text-forest-400 focus:border-gold-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/40 transition-all disabled:opacity-60"
          />
        </div>

        {subjectOptions && subjectOptions.length > 0 && (
          <div
            className={cn(
              "flex flex-col gap-2",
              !showEmailField && "sm:col-span-2"
            )}
          >
            <label
              htmlFor="lp-contact-subject"
              className="text-xs font-bold uppercase tracking-wider text-forest-900"
            >
              {subjectLabel}
            </label>
            <select
              id="lp-contact-subject"
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={submitting}
              className="w-full rounded-xl border border-forest-200 bg-cream-light/50 px-4 py-3 text-sm text-ink focus:border-gold-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/40 transition-all disabled:opacity-60"
            >
              {subjectOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {showEmailField && (
          <div
            className={cn(
              "flex flex-col gap-2",
              (!subjectOptions || subjectOptions.length === 0) &&
                "sm:col-span-2"
            )}
          >
            <label
              htmlFor="lp-contact-email"
              className="text-xs font-bold uppercase tracking-wider text-forest-900"
            >
              E-mail <span className="font-normal text-forest-400">(opcional)</span>
            </label>
            <input
              id="lp-contact-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              disabled={submitting}
              className="w-full rounded-xl border border-forest-200 bg-cream-light/50 px-4 py-3 text-sm text-ink placeholder:text-forest-400 focus:border-gold-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/40 transition-all disabled:opacity-60"
            />
          </div>
        )}

        <div className="sm:col-span-2 flex flex-col gap-2">
          <label
            htmlFor="lp-contact-message"
            className="text-xs font-bold uppercase tracking-wider text-forest-900"
          >
            {messageLabel}
          </label>
          <textarea
            id="lp-contact-message"
            name="message"
            rows={5}
            maxLength={1000}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={messagePlaceholder}
            disabled={submitting}
            className="w-full rounded-xl border border-forest-200 bg-cream-light/50 px-4 py-3 text-sm text-ink placeholder:text-forest-400 focus:border-gold-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/40 transition-all resize-y min-h-[130px] disabled:opacity-60"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="sm:col-span-2 flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="sm:col-span-2 pt-1">
          <Button
            variant={submitVariant}
            size="lg"
            type="submit"
            disabled={submitting}
            className="group w-full text-base cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Registrando solicitação...
              </>
            ) : (
              <>
                <MessageCircle className="h-4 w-4" />
                {submitLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
          <p className="mt-3 text-xs text-forest-600 leading-relaxed">
            {privacyNote}
          </p>
        </div>
      </div>
    </form>
  );
}
