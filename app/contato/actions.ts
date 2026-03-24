"use server";

import { z } from 'zod';

export interface ContactFormState {
  success: boolean;
  error: string | null;
  message: string | null;
}

const contactSchema = z.object({
  name: z.string()
    .min(2, 'Nome muito curto')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nome inválido'),
  email: z.string()
    .email('Email inválido')
    .max(254),
  phone: z.string()
    .max(20)
    .optional(),
  subject: z.string()
    .max(100)
    .optional(),
  message: z.string()
    .min(10, 'Mensagem muito curta')
    .max(2000, 'Mensagem muito longa'),
});

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  });

  if (!parsed.success) {
    return { success: false, error: 'Dados inválidos. Verifique os campos.', message: null };
  }

  try {
    // Rate limiting (only if Upstash is configured)
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      const { contactFormRatelimit } = await import('@/lib/upstash');
      const { headers } = await import('next/headers');
      const headersList = await headers();
      
      // IP confiável via Vercel — não pode ser spoofado
      const ip = headersList.get('x-real-ip')
        ?? headersList.get('x-forwarded-for')?.split(',')[0].trim()
        ?? '127.0.0.1';
        
      const { success: allowed } = await contactFormRatelimit.limit(ip);

      if (!allowed) {
        return {
          success: false,
          error: 'Muitas tentativas. Tente novamente em uma hora.',
          message: null,
        };
      }
    }

    // Send email (only if Resend is configured)
    if (process.env.RESEND_API_KEY) {
      const { resend } = await import('@/lib/resend');
      await resend.emails.send({
        from: 'Contato Site <onboarding@resend.dev>',
        to: process.env.CONTACT_EMAIL || 'contato@erlohaas.com.br',
        subject: `[Site] ${parsed.data.subject || 'Novo contato'} — ${parsed.data.name}`,
        text: `Nome: ${parsed.data.name}\nEmail: ${parsed.data.email}\nTelefone: ${parsed.data.phone || 'Não informado'}\nAssunto: ${parsed.data.subject || 'Não informado'}\n\nMensagem:\n${parsed.data.message}`,
      });
    }

    return {
      success: true,
      error: null,
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
    };
  } catch {
    return {
      success: false,
      error: 'Erro ao enviar mensagem. Tente novamente.',
      message: null,
    };
  }
}
