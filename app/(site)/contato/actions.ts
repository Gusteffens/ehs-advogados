"use server";

import crypto from "crypto";
import { headers } from "next/headers";
import { after } from "next/server";
import { z } from "zod";
import { getResendClient } from "@/lib/resend";
import { SITE_CONFIG } from "@/lib/site-config";
import { createAdminClient } from "@/lib/supabase/admin";
import { getContactRatelimit } from "@/lib/upstash";

export interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface ContactFormState {
  success: boolean;
  error: string | null;
  message: string | null;
  values?: ContactFormValues;
  eventId?: string;
}

const optionalFormString = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined),
    z.string().max(max).optional()
  );

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome muito curto")
    .max(100, "Nome muito longo")
    .regex(/^[A-Za-zÀ-ÿ\s'.-]+$/, "Nome inválido"),
  email: z.string().trim().email("Email inválido").max(254),
  phone: optionalFormString(20),
  subject: optionalFormString(100),
  message: z
    .string()
    .trim()
    .min(10, "Mensagem muito curta")
    .max(2000, "Mensagem muito longa"),
  utm_source: optionalFormString(120),
  utm_medium: optionalFormString(120),
  utm_campaign: optionalFormString(160),
  gclid: optionalFormString(200),
  fbclid: optionalFormString(200),
  source_page: optionalFormString(300),
  event_id: optionalFormString(100),
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildClientWhatsAppReplyUrl(
  phone: string | undefined,
  name: string,
  subject: string | undefined
): string | null {
  if (!phone) {
    return null;
  }

  let digits = phone.replace(/\D/g, "");
  if (digits.length < 10) {
    return null;
  }
  if (digits.length === 10 || digits.length === 11) {
    digits = `55${digits}`;
  }

  const greeting = `Olá, ${name}! Recebemos seu contato pelo site da ${SITE_CONFIG.name}${subject ? ` sobre ${subject}` : ""}. Como podemos ajudar?`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(greeting)}`;
}

function buildInternalEmailHtml(
  data: z.infer<typeof contactSchema>,
  whatsappReplyUrl: string | null
): string {
  const attributionItems = [
    data.source_page ? `<li><strong>Página de origem:</strong> ${escapeHtml(data.source_page)}</li>` : "",
    data.utm_source ? `<li><strong>utm_source:</strong> ${escapeHtml(data.utm_source)}</li>` : "",
    data.utm_medium ? `<li><strong>utm_medium:</strong> ${escapeHtml(data.utm_medium)}</li>` : "",
    data.utm_campaign ? `<li><strong>utm_campaign:</strong> ${escapeHtml(data.utm_campaign)}</li>` : "",
    data.gclid ? `<li><strong>gclid:</strong> ${escapeHtml(data.gclid)}</li>` : "",
    data.fbclid ? `<li><strong>fbclid:</strong> ${escapeHtml(data.fbclid)}</li>` : "",
  ].filter(Boolean);

  return `
    <div style="font-family: Arial, sans-serif; background-color: #EEEDE5; padding: 24px; color: #0D1812;">
      <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #DCE5DC;">
        <div style="background-color: #1B2D1E; padding: 24px 28px; border-bottom: 3px solid #E8D49A;">
          <p style="margin: 0; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: #E8D49A;">Novo Lead pelo Site</p>
          <h1 style="margin: 6px 0 0; font-size: 20px; color: #EEEDE5;">${escapeHtml(SITE_CONFIG.legalName)}</h1>
        </div>
        <div style="padding: 28px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #3B5A3C; width: 110px;"><strong>Nome:</strong></td><td style="padding: 6px 0;">${escapeHtml(data.name)}</td></tr>
            <tr><td style="padding: 6px 0; color: #3B5A3C;"><strong>E-mail:</strong></td><td style="padding: 6px 0;"><a href="mailto:${escapeHtml(data.email)}" style="color: #1B2D1E;">${escapeHtml(data.email)}</a></td></tr>
            <tr><td style="padding: 6px 0; color: #3B5A3C;"><strong>Telefone:</strong></td><td style="padding: 6px 0;">${escapeHtml(data.phone || "Não informado")}</td></tr>
            <tr><td style="padding: 6px 0; color: #3B5A3C;"><strong>Assunto:</strong></td><td style="padding: 6px 0;">${escapeHtml(data.subject || "Não informado")}</td></tr>
          </table>
          <div style="background-color: #F9F8F5; border-left: 3px solid #877249; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #877249;"><strong>Mensagem</strong></p>
            <p style="margin: 0; white-space: pre-wrap; line-height: 1.6; font-size: 14px;">${escapeHtml(data.message)}</p>
          </div>
          ${
            whatsappReplyUrl
              ? `<div style="margin-bottom: 24px;">
                  <a href="${whatsappReplyUrl}" style="display: inline-block; background-color: #1B2D1E; color: #E8D49A; text-decoration: none; font-weight: bold; padding: 12px 20px; border-radius: 8px; font-size: 14px;">
                    Responder no WhatsApp
                  </a>
                </div>`
              : ""
          }
          ${
            attributionItems.length > 0
              ? `<div style="border-top: 1px solid #DCE5DC; padding-top: 16px; font-size: 12px; color: #3B5A3C;">
                  <p style="margin: 0 0 8px;"><strong>Origem / Atribuição</strong></p>
                  <ul style="margin: 0; padding-left: 18px; line-height: 1.6;">${attributionItems.join("")}</ul>
                </div>`
              : ""
          }
        </div>
      </div>
    </div>
  `.trim();
}

function buildClientConfirmationHtml(name: string, subject: string | undefined): string {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #EEEDE5; padding: 24px; color: #0D1812;">
      <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #DCE5DC;">
        <div style="background-color: #1B2D1E; padding: 24px 28px; border-bottom: 3px solid #E8D49A;">
          <p style="margin: 0; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: #E8D49A;">Confirmação de Contato</p>
          <h1 style="margin: 6px 0 0; font-size: 20px; color: #EEEDE5;">${escapeHtml(SITE_CONFIG.legalName)}</h1>
        </div>
        <div style="padding: 28px; font-size: 14px; line-height: 1.6;">
          <p style="margin-top: 0;">Olá, <strong>${escapeHtml(name)}</strong>.</p>
          <p>Recebemos sua mensagem${subject ? ` referente a <strong>${escapeHtml(subject)}</strong>` : ""} e nossa equipe jurídica analisará sua solicitação o mais breve possível.</p>
          <p>Caso precise de atendimento imediato, você também pode falar diretamente conosco pelo WhatsApp:</p>
          <p style="margin: 24px 0;">
            <a href="${SITE_CONFIG.contact.whatsappWithText}" style="display: inline-block; background-color: #E8D49A; color: #0D1812; text-decoration: none; font-weight: bold; padding: 12px 20px; border-radius: 8px;">
              Falar pelo WhatsApp
            </a>
          </p>
          <hr style="border: none; border-top: 1px solid #DCE5DC; margin: 24px 0;" />
          <p style="margin: 0; font-size: 12px; color: #3B5A3C;">
            ${escapeHtml(SITE_CONFIG.legalName)} • ${escapeHtml(SITE_CONFIG.oab)}<br />
            ${escapeHtml(SITE_CONFIG.address.full)}<br />
            ${escapeHtml(SITE_CONFIG.contact.whatsappDisplay)}
          </p>
        </div>
      </div>
    </div>
  `.trim();
}

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  // Honeypot silencioso para bots
  const honeypot = String(formData.get("website") ?? "").trim();
  if (honeypot.length > 0) {
    return {
      success: true,
      error: null,
      message: "Mensagem enviada com sucesso! Entraremos em contato em breve.",
    };
  }

  const rawValues: ContactFormValues = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const parsed = contactSchema.safeParse({
    ...rawValues,
    utm_source: formData.get("utm_source"),
    utm_medium: formData.get("utm_medium"),
    utm_campaign: formData.get("utm_campaign"),
    gclid: formData.get("gclid"),
    fbclid: formData.get("fbclid"),
    source_page: formData.get("source_page"),
    event_id: formData.get("event_id"),
  });

  if (!parsed.success) {
    const firstIssue =
      parsed.error.issues[0]?.message ?? "Dados inválidos. Verifique os campos.";
    return {
      success: false,
      error: firstIssue,
      message: null,
      values: rawValues,
    };
  }

  const eventId = parsed.data.event_id || crypto.randomUUID();

  try {
    const headersList = await headers();
    const ip =
      headersList.get("x-real-ip") ??
      headersList.get("x-forwarded-for")?.split(",")[0].trim() ??
      "127.0.0.1";
    const userAgent = headersList.get("user-agent") || "";

    const ratelimit = getContactRatelimit();
    if (ratelimit) {
      try {
        const { success: allowed } = await ratelimit.limit(ip);
        if (!allowed) {
          return {
            success: false,
            error: "Muitas tentativas. Tente novamente em uma hora.",
            message: null,
            values: rawValues,
          };
        }
      } catch (ratelimitError) {
        console.error("Rate limit check failed for contact form:", ratelimitError);
      }
    }

    // Persiste o lead no Supabase antes do e-mail (isolado para não bloquear envio se tabela não existir)
    let persistedLeadId: string | null = null;
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createAdminClient();
        const { data: leadRow, error: leadError } = await supabase
          .from("contact_leads")
          .insert({
            name: parsed.data.name,
            email: parsed.data.email,
            phone: parsed.data.phone ?? null,
            subject: parsed.data.subject ?? null,
            message: parsed.data.message,
            status: "new",
            utm_source: parsed.data.utm_source ?? null,
            utm_medium: parsed.data.utm_medium ?? null,
            utm_campaign: parsed.data.utm_campaign ?? null,
            gclid: parsed.data.gclid ?? null,
            fbclid: parsed.data.fbclid ?? null,
            source_page: parsed.data.source_page ?? null,
            email_sent: false,
          })
          .select("id")
          .single();

        if (leadError) {
          console.warn("Could not persist contact lead in Supabase:", leadError.message);
        } else if (leadRow?.id) {
          persistedLeadId = leadRow.id;
        }
      }
    } catch (dbError) {
      console.warn("Skipping contact_leads persistence due to error:", dbError);
    }

    const resend = getResendClient();
    if (!resend) {
      console.error("RESEND_API_KEY is not configured");
      if (persistedLeadId) {
        return {
          success: true,
          error: null,
          message: "Mensagem registrada com sucesso! Entraremos em contato em breve.",
          eventId,
        };
      }
      return {
        success: false,
        error: "Envio de email indisponível no momento. Tente novamente pelo WhatsApp.",
        message: null,
        values: rawValues,
      };
    }

    const from = process.env.CONTACT_FROM_EMAIL || "Contato EHS <contato@ehsadvogados.com.br>";
    const to = process.env.CONTACT_EMAIL || SITE_CONFIG.contact.email;
    const whatsappReplyUrl = buildClientWhatsAppReplyUrl(
      parsed.data.phone,
      parsed.data.name,
      parsed.data.subject
    );

    const textLines = [
      `Nome: ${parsed.data.name}`,
      `Email: ${parsed.data.email}`,
      `Telefone: ${parsed.data.phone || "Não informado"}`,
      `Assunto: ${parsed.data.subject || "Não informado"}`,
      parsed.data.source_page ? `Página de origem: ${parsed.data.source_page}` : null,
      parsed.data.utm_source ? `UTM Source: ${parsed.data.utm_source}` : null,
      parsed.data.utm_medium ? `UTM Medium: ${parsed.data.utm_medium}` : null,
      parsed.data.utm_campaign ? `UTM Campaign: ${parsed.data.utm_campaign}` : null,
      "",
      "Mensagem:",
      parsed.data.message,
    ].filter((line): line is string => line !== null);

    const { error: sendError } = await resend.emails.send({
      from,
      to,
      replyTo: parsed.data.email,
      subject: `[Site] ${parsed.data.subject || "Novo contato"} - ${parsed.data.name}`,
      html: buildInternalEmailHtml(parsed.data, whatsappReplyUrl),
      text: textLines.join("\n"),
    });

    if (sendError) {
      console.error("Resend email error:", sendError);
      if (!persistedLeadId) {
        return {
          success: false,
          error: "Erro ao enviar mensagem. Tente novamente ou fale conosco pelo WhatsApp.",
          message: null,
          values: rawValues,
        };
      }
    } else if (persistedLeadId) {
      after(async () => {
        try {
          const supabase = createAdminClient();
          await supabase
            .from("contact_leads")
            .update({ email_sent: true })
            .eq("id", persistedLeadId);
        } catch (updateErr) {
          console.error("Failed to mark lead email_sent:", updateErr);
        }
      });
    }

    // E-mail automático de confirmação ao cliente em background
    after(async () => {
      try {
        const { error: confirmError } = await resend.emails.send({
          from,
          to: parsed.data.email,
          subject: `Recebemos sua mensagem — ${SITE_CONFIG.name}`,
          html: buildClientConfirmationHtml(parsed.data.name, parsed.data.subject),
          text: `Olá, ${parsed.data.name}.\n\nRecebemos sua mensagem${parsed.data.subject ? ` sobre ${parsed.data.subject}` : ""} e nossa equipe retornará o mais breve possível.\n\nAtendimento via WhatsApp: ${SITE_CONFIG.contact.whatsappWithText}\n\n${SITE_CONFIG.legalName} — ${SITE_CONFIG.oab}`,
        });
        if (confirmError) {
          console.error("Failed to send client confirmation email:", confirmError);
        }
      } catch (confirmErr) {
        console.error("Unexpected error sending confirmation email:", confirmErr);
      }
    });

    // Enviar evento para a API de Conversões da Meta (CAPI) com deduplicação via event_id
    const accessToken = process.env.META_PIXEL_ACCESS_TOKEN;
    if (accessToken) {
      const pixelId = process.env.META_PIXEL_ID || "2487931431710589";
      const cleanEmail = parsed.data.email.toLowerCase();
      const emailHash = crypto.createHash("sha256").update(cleanEmail).digest("hex");

      let phoneHash: string | undefined;
      if (parsed.data.phone) {
        const cleanPhone = parsed.data.phone.replace(/\D/g, "");
        if (cleanPhone) {
          phoneHash = crypto.createHash("sha256").update(cleanPhone).digest("hex");
        }
      }

      const eventSourceUrl = parsed.data.source_page
        ? `${SITE_CONFIG.url}${parsed.data.source_page.startsWith("/") ? parsed.data.source_page : `/${parsed.data.source_page}`}`
        : `${SITE_CONFIG.url}/contato`;

      after(async () => {
        try {
          const response = await fetch(
            `https://graph.facebook.com/v21.0/${encodeURIComponent(pixelId)}/events`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              signal: AbortSignal.timeout(8000),
              body: JSON.stringify({
                access_token: accessToken,
                data: [
                  {
                    event_name: "Contact",
                    event_id: eventId,
                    event_time: Math.floor(Date.now() / 1000),
                    action_source: "website",
                    event_source_url: eventSourceUrl,
                    user_data: {
                      em: [emailHash],
                      ...(phoneHash ? { ph: [phoneHash] } : {}),
                      client_ip_address: ip,
                      client_user_agent: userAgent,
                    },
                  },
                ],
              }),
            }
          );

          if (!response.ok) {
            console.error(`Meta CAPI returned status ${response.status}`);
          }
        } catch (capiError) {
          console.error("Error sending event to Meta CAPI:", capiError);
        }
      });
    }

    return {
      success: true,
      error: null,
      message: "Mensagem enviada com sucesso! Entraremos em contato em breve.",
      eventId,
    };
  } catch (error) {
    console.error("Unexpected error in submitContactForm:", error);
    return {
      success: false,
      error: "Erro ao enviar mensagem. Tente novamente.",
      message: null,
      values: rawValues,
    };
  }
}
