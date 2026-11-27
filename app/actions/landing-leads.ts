"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { getResendClient } from "@/lib/resend";
import { SITE_CONFIG } from "@/lib/site-config";
import { createAdminClient } from "@/lib/supabase/admin";
import { getContactRatelimit } from "@/lib/upstash";

const optionalAttributionField = z
  .string()
  .trim()
  .max(200)
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

const landingLeadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe seu nome completo.")
    .max(120, "Nome muito longo."),
  phone: z
    .string()
    .trim()
    .min(8, "Informe um telefone ou WhatsApp válido.")
    .max(30, "Telefone muito longo."),
  email: z
    .string()
    .trim()
    .max(160, "E-mail muito longo.")
    .refine(
      (val) => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "Informe um e-mail válido."
    )
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  subject: z
    .string()
    .trim()
    .min(2, "Informe o assunto.")
    .max(160, "Assunto muito longo."),
  message: z
    .string()
    .trim()
    .min(5, "Descreva brevemente sua situação.")
    .max(2000, "A mensagem excede o limite de 2000 caracteres."),
  sourcePage: z.enum(["/proagro", "/penal"]),
  utm_source: optionalAttributionField,
  utm_medium: optionalAttributionField,
  utm_campaign: optionalAttributionField,
  gclid: optionalAttributionField,
  fbclid: optionalAttributionField,
});

export type LandingLeadInput = z.input<typeof landingLeadSchema>;

export type LandingLeadResult =
  | {
      ok: true;
      whatsappUrl: string;
      leadId?: string;
    }
  | {
      ok: false;
      error: string;
    };

async function getClientIp(): Promise<string> {
  try {
    const hdrs = await headers();
    const forwardedFor = hdrs.get("x-forwarded-for");
    if (forwardedFor) {
      const firstIp = forwardedFor.split(",")[0]?.trim();
      if (firstIp) return firstIp;
    }
    const realIp = hdrs.get("x-real-ip")?.trim();
    if (realIp) return realIp;
  } catch {
    // Ignore header access errors outside request context
  }
  return "unknown";
}

function buildWhatsAppUrl(data: z.infer<typeof landingLeadSchema>): string {
  const intro =
    data.sourcePage === "/proagro"
      ? "Olá, gostaria de solicitar análise de um caso de Proagro."
      : "Olá, encontrei a página de Direito Penal da EHS Advocacia e gostaria de solicitar atendimento.";

  const lines = [
    intro,
    "",
    `Nome: ${data.name}`,
    `Telefone: ${data.phone}`,
    data.email ? `E-mail: ${data.email}` : null,
    data.sourcePage === "/proagro"
      ? `Situação do Proagro: ${data.subject}`
      : `Assunto: ${data.subject}`,
    `Mensagem: ${data.message}`,
  ].filter(Boolean);

  return `${SITE_CONFIG.contact.whatsapp}?text=${encodeURIComponent(
    lines.join("\n")
  )}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function submitLandingLead(
  input: LandingLeadInput
): Promise<LandingLeadResult> {
  const parsed = landingLeadSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ??
        "Verifique os campos preenchidos e tente novamente.",
    };
  }

  const data = parsed.data;

  // 1. Rate limiting by IP via Upstash (if configured)
  const ratelimit = getContactRatelimit();
  if (ratelimit) {
    try {
      const ip = await getClientIp();
      const { success } = await ratelimit.limit(`lp:${ip}`);
      if (!success) {
        return {
          ok: false,
          error:
            "Muitas solicitações enviadas em sequência. Aguarde alguns minutos ou fale diretamente pelo WhatsApp.",
        };
      }
    } catch (err) {
      console.error("Falha ao verificar rate limit de lead da LP:", err);
    }
  }

  const whatsappUrl = buildWhatsAppUrl(data);
  let leadId: string | undefined;

  // 2. Persist lead directly to public.contact_leads so no paid-ad lead is ever lost
  try {
    const supabase = createAdminClient();
    const { data: inserted, error } = await supabase
      .from("contact_leads")
      .insert({
        name: data.name,
        email: data.email ?? "",
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        status: "new",
        source_page: data.sourcePage,
        utm_source: data.utm_source ?? null,
        utm_medium: data.utm_medium ?? null,
        utm_campaign: data.utm_campaign ?? null,
        gclid: data.gclid ?? null,
        fbclid: data.fbclid ?? null,
        email_sent: false,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to persist landing page lead:", error);
      return {
        ok: false,
        error:
          "Não foi possível registrar sua solicitação no momento. Tente novamente ou clique no botão do WhatsApp.",
      };
    }

    leadId = inserted?.id;

    // 3. Optional email notification via Resend (non-blocking for lead capture)
    const resend = getResendClient();
    if (resend) {
      try {
        const fromAddress =
          process.env.RESEND_FROM_EMAIL ||
          "EHS Advocacia <contato@ehsadvogados.com.br>";
        const toAddress =
          process.env.CONTACT_TO_EMAIL || SITE_CONFIG.contact.email;

        const attributionLines = [
          data.utm_source ? `utm_source: ${data.utm_source}` : null,
          data.utm_medium ? `utm_medium: ${data.utm_medium}` : null,
          data.utm_campaign ? `utm_campaign: ${data.utm_campaign}` : null,
          data.gclid ? `gclid: ${data.gclid}` : null,
          data.fbclid ? `fbclid: ${data.fbclid}` : null,
        ].filter(Boolean);

        const emailResult = await resend.emails.send({
          from: fromAddress,
          to: [toAddress],
          replyTo: data.email || undefined,
          subject: `[LP ${data.sourcePage}] Novo lead: ${data.subject} — ${data.name}`,
          html: `
            <h2>Novo lead recebido via ${escapeHtml(data.sourcePage)}</h2>
            <p><strong>Nome:</strong> ${escapeHtml(data.name)}</p>
            <p><strong>Telefone / WhatsApp:</strong> ${escapeHtml(data.phone)}</p>
            ${data.email ? `<p><strong>E-mail:</strong> ${escapeHtml(data.email)}</p>` : ""}
            <p><strong>Assunto:</strong> ${escapeHtml(data.subject)}</p>
            <p><strong>Mensagem:</strong><br/>${escapeHtml(data.message).replace(/\n/g, "<br/>")}</p>
            ${
              attributionLines.length > 0
                ? `<hr/><p><strong>Atribuição:</strong><br/>${escapeHtml(attributionLines.join(" | "))}</p>`
                : ""
            }
          `,
        });

        if (!emailResult.error && leadId) {
          await supabase
            .from("contact_leads")
            .update({ email_sent: true })
            .eq("id", leadId);
        }
      } catch (emailErr) {
        console.error("Failed to send landing lead email notification:", emailErr);
      }
    }
  } catch (err) {
    console.error("Unexpected error persisting landing lead:", err);
    return {
      ok: false,
      error:
        "Não foi possível registrar sua solicitação no momento. Tente novamente ou fale diretamente pelo WhatsApp.",
    };
  }

  // 4. Revalidate admin leads views and badge count
  try {
    revalidateTag("admin-leads-count", "max");
  } catch {
    // Ignore outside cache context
  }
  revalidatePath("/admin/leads");
  revalidatePath("/admin");

  return {
    ok: true,
    whatsappUrl,
    leadId,
  };
}
