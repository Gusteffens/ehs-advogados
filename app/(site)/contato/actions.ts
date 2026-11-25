"use server";

import crypto from "crypto";
import { headers } from "next/headers";
import { after } from "next/server";
import { z } from "zod";
import { getResendClient } from "@/lib/resend";
import { SITE_CONFIG } from "@/lib/site-config";
import { getContactRatelimit } from "@/lib/upstash";

export interface ContactFormState {
  success: boolean;
  error: string | null;
  message: string | null;
}

const optionalFormString = (max: number) =>
  z.preprocess(
    (value) => (value === null || value === "" ? undefined : value),
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
});

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const firstIssue =
      parsed.error.issues[0]?.message ?? "Dados inválidos. Verifique os campos.";
    return { success: false, error: firstIssue, message: null };
  }

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
          };
        }
      } catch (ratelimitError) {
        console.error("Rate limit check failed for contact form:", ratelimitError);
      }
    }

    const resend = getResendClient();
    if (!resend) {
      console.error("RESEND_API_KEY is not configured");
      return {
        success: false,
        error: "Envio de email indisponível no momento. Tente novamente pelo WhatsApp.",
        message: null,
      };
    }

    const from = process.env.CONTACT_FROM_EMAIL || "Contato EHS <contato@ehsadvogados.com.br>";
    const to = process.env.CONTACT_EMAIL || SITE_CONFIG.contact.email;

    const { error: sendError } = await resend.emails.send({
      from,
      to,
      replyTo: parsed.data.email,
      subject: `[Site] ${parsed.data.subject || "Novo contato"} - ${parsed.data.name}`,
      text: `Nome: ${parsed.data.name}\nEmail: ${parsed.data.email}\nTelefone: ${parsed.data.phone || "Não informado"}\nAssunto: ${parsed.data.subject || "Não informado"}\n\nMensagem:\n${parsed.data.message}`,
    });

    if (sendError) {
      console.error("Resend email error:", sendError);
      return {
        success: false,
        error: "Erro ao enviar mensagem. Tente novamente ou fale conosco pelo WhatsApp.",
        message: null,
      };
    }

    // Enviar evento para a API de Conversões da Meta (CAPI) após a resposta
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
                    event_time: Math.floor(Date.now() / 1000),
                    action_source: "website",
                    event_source_url: `${SITE_CONFIG.url}/contato`,
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
    };
  } catch (error) {
    console.error("Unexpected error in submitContactForm:", error);
    return {
      success: false,
      error: "Erro ao enviar mensagem. Tente novamente.",
      message: null,
    };
  }
}
