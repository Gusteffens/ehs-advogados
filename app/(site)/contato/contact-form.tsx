"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Send,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  MessageCircle,
} from "lucide-react";
import { submitContactForm, type ContactFormState } from "./actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { WhatsAppLink } from "@/components/tracking/whatsapp-link";
import { SITE_CONFIG } from "@/lib/site-config";
import { getConsentState, trackContactLead } from "@/lib/tracking";
import { cn } from "@/lib/utils";

const initialState: ContactFormState = {
  success: false,
  error: null,
  message: null,
};

const subjects = [
  ...SITE_CONFIG.practiceAreas.map((area) => area.title),
  "Outro assunto",
];

const MAX_MESSAGE_LENGTH = 2000;

const inputClasses =
  "w-full rounded-xl border border-forest-200 bg-white px-4 py-3 text-ink font-body text-[0.925rem] placeholder:text-forest-600/70 focus:outline-none focus:ring-2 focus:ring-champagne-500/50 focus:border-champagne-500 transition-all";

function generateEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `ehs-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatBrazilPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function resolveInitialSubject(param: string | null): string {
  if (!param) return "";
  const normalized = param.trim().toLowerCase();
  const matchedById = SITE_CONFIG.practiceAreas.find(
    (area) => area.id.toLowerCase() === normalized
  );
  if (matchedById) return matchedById.title;

  const matchedByTitle = subjects.find(
    (s) => s.toLowerCase() === normalized
  );
  return matchedByTitle ?? "";
}

function ContactFormInner({ onReset }: { onReset: () => void }) {
  const pathname = usePathname() || "/contato";
  const searchParams = useSearchParams();

  const [state, formAction, isPending] = useActionState(
    submitContactForm,
    initialState
  );

  const initialSubjectFromQuery = resolveInitialSubject(
    searchParams.get("assunto")
  );

  const [nameInput, setNameInput] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState<string | null>(null);
  const [subjectInput, setSubjectInput] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState<string | null>(null);
  const [eventId] = useState(generateEventId);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);

  useEffect(() => {
    const syncConsent = () => {
      setAnalyticsConsent(getConsentState() === "granted");
    };
    syncConsent();
    window.addEventListener("ehs:consent-change", syncConsent);
    window.addEventListener("ehs:consent-updated", syncConsent);
    return () => {
      window.removeEventListener("ehs:consent-change", syncConsent);
      window.removeEventListener("ehs:consent-updated", syncConsent);
    };
  }, []);

  const name = nameInput ?? state.values?.name ?? "";
  const email = emailInput ?? state.values?.email ?? "";
  const phone = phoneInput ?? formatBrazilPhone(state.values?.phone ?? "");
  const subject = subjectInput ?? state.values?.subject ?? initialSubjectFromQuery;
  const message = messageInput ?? state.values?.message ?? "";

  const trackedEventRef = useRef<string | null>(null);

  // Fire lead tracking once on success (deduplicated with Meta CAPI via eventId)
  useEffect(() => {
    if (!state.success) return;
    const resolvedEventId = state.eventId || eventId;
    if (trackedEventRef.current === resolvedEventId) return;
    trackedEventRef.current = resolvedEventId;
    trackContactLead(resolvedEventId, subject || undefined);
  }, [state.success, state.eventId, eventId, subject]);

  const utmSource = searchParams.get("utm_source") ?? "";
  const utmMedium = searchParams.get("utm_medium") ?? "";
  const utmCampaign = searchParams.get("utm_campaign") ?? "";
  const gclid = searchParams.get("gclid") ?? "";
  const fbclid = searchParams.get("fbclid") ?? "";

  if (state.success) {
    const escalationMessage = subject
      ? `Olá, acabei de enviar uma mensagem pelo site sobre ${subject} e gostaria de agilizar o atendimento.`
      : "Olá, acabei de enviar uma mensagem pelo site e gostaria de agilizar o atendimento.";
    const whatsappEscalationHref = `${SITE_CONFIG.contact.whatsapp}?text=${encodeURIComponent(
      escalationMessage
    )}`;

    return (
      <div className="rounded-2xl bg-cream border border-forest-200 p-8 text-center">
        <CheckCircle className="h-12 w-12 text-forest-600 mx-auto mb-4" />
        <h3 className="font-display text-xl font-bold text-ink mb-2">
          Mensagem enviada!
        </h3>
        <p className="text-forest-600 mb-6">{state.message}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <WhatsAppLink
            href={whatsappEscalationHref}
            page={pathname}
            placement="contact-form-success"
            label="WhatsApp Pós-Formulário"
            className={cn(
              buttonVariants({ variant: "secondary", size: "md" }),
              "no-underline w-full sm:w-auto"
            )}
          >
            <MessageCircle className="h-4 w-4" />
            Falar agora no WhatsApp
          </WhatsAppLink>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onReset}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4" />
            Enviar outra mensagem
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {/* Honeypot anti-spam field */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
      />

      {/* Attribution & deduplication hidden fields */}
      <input type="hidden" name="utm_source" value={utmSource} />
      <input type="hidden" name="utm_medium" value={utmMedium} />
      <input type="hidden" name="utm_campaign" value={utmCampaign} />
      <input type="hidden" name="gclid" value={gclid} />
      <input type="hidden" name="fbclid" value={fbclid} />
      <input type="hidden" name="source_page" value={pathname} />
      <input type="hidden" name="event_id" value={eventId} />
      <input
        type="hidden"
        name="analyticsConsent"
        value={analyticsConsent ? "true" : "false"}
      />

      {state.error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-ink mb-1.5"
          >
            Nome completo *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Seu nome"
            className={inputClasses}
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-ink mb-1.5"
          >
            E-mail *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="seu@email.com"
            className={inputClasses}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-ink mb-1.5"
          >
            Telefone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhoneInput(formatBrazilPhone(e.target.value))}
            placeholder="(49) 99999-9999"
            className={inputClasses}
          />
        </div>
        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-ink mb-1.5"
          >
            Assunto
          </label>
          <select
            id="subject"
            name="subject"
            value={subject}
            onChange={(e) => setSubjectInput(e.target.value)}
            className={cn(
              inputClasses,
              "pr-10 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%233B5A3C%22%20d%3D%22M2%204l4%204%204-4%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center]"
            )}
          >
            <option value="">Selecione um assunto</option>
            {subjects.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="message"
            className="block text-sm font-medium text-ink"
          >
            Mensagem *
          </label>
          <span
            className={cn(
              "text-xs tabular-nums",
              message.length > MAX_MESSAGE_LENGTH - 150
                ? "text-gold-dark font-semibold"
                : "text-forest-600/70"
            )}
          >
            {message.length}/{MAX_MESSAGE_LENGTH}
          </span>
        </div>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          maxLength={MAX_MESSAGE_LENGTH}
          value={message}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Descreva brevemente como podemos ajudar..."
          className={cn(inputClasses, "resize-none")}
        />
      </div>

      <Button
        type="submit"
        variant="secondary"
        size="lg"
        disabled={isPending}
        className="w-full group"
      >
        {isPending ? "Enviando..." : "Enviar Mensagem"}
        <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Button>

      <p className="text-xs text-forest-600 text-center">
        Ao enviar, você concorda com nossa{" "}
        <Link
          href="/politica-de-privacidade"
          className="underline hover:text-ink transition-colors"
        >
          Política de Privacidade
        </Link>
        .
      </p>
    </form>
  );
}

export function ContactForm() {
  const [formKey, setFormKey] = useState(0);

  return (
    <ContactFormInner
      key={formKey}
      onReset={() => setFormKey((prev) => prev + 1)}
    />
  );
}
