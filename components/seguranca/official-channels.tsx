"use client";

import { useState } from "react";
import {
  MessageCircle,
  Phone,
  Mail,
  Globe,
  Instagram,
  Clock,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { WhatsAppLink } from "@/components/tracking/whatsapp-link";
import { SITE_CONFIG } from "@/lib/site-config";

const OFFICIAL_OFFICE_PHONE_DISPLAY = "(49) 98848-6988";
const OFFICIAL_OFFICE_PHONE_HREF = "tel:+5549988486988";

interface ChannelCardData {
  id: string;
  label: string;
  value: string;
  copyValue?: string;
  href?: string;
  isWhatsApp?: boolean;
  isExternal?: boolean;
  icon: typeof Phone;
  helper: string;
}

const siteHost = SITE_CONFIG.url.replace(/^https?:\/\//, "");

const channels: readonly ChannelCardData[] = [
  {
    id: "whatsapp",
    label: "WhatsApp Oficial",
    value: "(49) 98400-1053",
    copyValue: "+55 (49) 98400-1053",
    href: SITE_CONFIG.contact.whatsapp,
    isWhatsApp: true,
    icon: MessageCircle,
    helper: "Canal oficial de atendimento por mensagem",
  },
  {
    id: "telefone",
    label: "Telefone Oficial",
    value: OFFICIAL_OFFICE_PHONE_DISPLAY,
    copyValue: OFFICIAL_OFFICE_PHONE_DISPLAY,
    href: OFFICIAL_OFFICE_PHONE_HREF,
    icon: Phone,
    helper: "Atendimento por ligação telefônica",
  },
  {
    id: "email",
    label: "E-mail",
    value: SITE_CONFIG.contact.email,
    copyValue: SITE_CONFIG.contact.email,
    href: `mailto:${SITE_CONFIG.contact.email}`,
    icon: Mail,
    helper: "Endereço eletrônico oficial do escritório",
  },
  {
    id: "site",
    label: "Site Oficial",
    value: siteHost,
    copyValue: SITE_CONFIG.url,
    href: `${SITE_CONFIG.url}/`,
    isExternal: true,
    icon: Globe,
    helper: "Verifique sempre o endereço no navegador",
  },
  {
    id: "instagram",
    label: "Instagram",
    value: "@ehs.adv",
    copyValue: "@ehs.adv",
    href: SITE_CONFIG.social.instagram,
    isExternal: true,
    icon: Instagram,
    helper: "Perfil institucional oficial",
  },
  {
    id: "horario",
    label: "Horário de atendimento",
    value: "8h às 18h",
    icon: Clock,
    helper: "Fora desse horário, aguarde sempre nosso retorno",
  },
];

export function OfficialChannels() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      window.setTimeout(() => {
        setCopiedId((current) => (current === id ? null : current));
      }, 2200);
    } catch {
      // Clipboard API unavailable; ignore gracefully
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {channels.map((channel) => {
        const Icon = channel.icon;
        const isCopied = copiedId === channel.id;

        return (
          <div
            key={channel.id}
            className="group relative flex flex-col justify-between rounded-2xl border border-forest-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-dark/40 hover:shadow-lg hover:shadow-forest-900/5"
          >
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cream text-forest-900 transition-colors group-hover:bg-champagne-300/35 group-hover:text-gold-dark">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>

                {channel.copyValue && (
                  <button
                    type="button"
                    onClick={() => handleCopy(channel.id, channel.copyValue!)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-forest-100 bg-cream-light px-2.5 py-1.5 text-xs font-semibold text-forest-700 transition-colors hover:border-gold-dark/40 hover:bg-champagne-50 hover:text-ink"
                    aria-label={`Copiar ${channel.label}`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-forest-600" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copiar
                      </>
                    )}
                  </button>
                )}
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-dark mb-1.5">
                {channel.label}
              </p>

              {channel.href ? (
                channel.isWhatsApp ? (
                  <WhatsAppLink
                    href={channel.href}
                    page="/seguranca"
                    placement="seguranca-canais-card"
                    label="WhatsApp Oficial Segurança"
                    className="inline-flex items-center gap-1.5 break-all font-display text-xl font-bold text-ink transition-colors hover:text-gold-dark no-underline"
                  >
                    {channel.value}
                    <ExternalLink className="h-4 w-4 shrink-0 opacity-60" />
                  </WhatsAppLink>
                ) : (
                  <a
                    href={channel.href}
                    target={channel.isExternal ? "_blank" : undefined}
                    rel={channel.isExternal ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-1.5 break-all font-display text-xl font-bold text-ink transition-colors hover:text-gold-dark no-underline"
                  >
                    {channel.value}
                    {channel.isExternal && (
                      <ExternalLink className="h-4 w-4 shrink-0 opacity-60" />
                    )}
                  </a>
                )
              ) : (
                <p className="font-display text-xl font-bold text-ink">
                  {channel.value}
                </p>
              )}
            </div>

            <p className="mt-3 text-xs leading-relaxed text-forest-600">
              {channel.helper}
            </p>
          </div>
        );
      })}
    </div>
  );
}
