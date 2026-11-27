import crypto from "crypto";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRedisClient } from "@/lib/upstash";
import { extractClientIp } from "@/lib/analytics/visitor";

export const dynamic = "force-dynamic";

const STORAGE_BUCKET = "blog-covers";
const MAX_IMAGE_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB

let uploadSignRatelimitInstance: Ratelimit | null = null;

function getUploadSignRatelimit(): Ratelimit | null {
  const redis = getRedisClient();
  if (!redis) {
    return null;
  }

  uploadSignRatelimitInstance ??= new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "10 m"),
    analytics: false,
    prefix: "@ehs/admin-upload-sign",
  });

  return uploadSignRatelimitInstance;
}

const ALLOWED_IMAGE_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

const signUploadSchema = z.object({
  filename: z
    .string()
    .trim()
    .min(1, "Nome do arquivo é obrigatório.")
    .max(255, "Nome do arquivo muito longo."),
  contentType: z
    .string()
    .trim()
    .refine(
      (value) => Object.prototype.hasOwnProperty.call(ALLOWED_IMAGE_MIME_TO_EXT, value),
      "Formato de imagem não suportado. Use JPG, PNG, WebP, AVIF ou GIF."
    ),
  size: z
    .number()
    .int("Tamanho do arquivo inválido.")
    .positive("Arquivo vazio não é permitido.")
    .max(
      MAX_IMAGE_UPLOAD_BYTES,
      "A imagem excede o limite máximo de 15MB."
    ),
  folder: z.enum(["covers", "content"]).optional().default("content"),
});

export async function POST(request: Request): Promise<NextResponse> {
  const gate = await requireAdminApi();
  if (!gate.ok) {
    return gate.response;
  }

  const ratelimit = getUploadSignRatelimit();
  if (ratelimit) {
    try {
      const ip = extractClientIp(request.headers);
      const { success } = await ratelimit.limit(`${gate.session.userId}:${ip}`);
      if (!success) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Muitas solicitações de upload. Aguarde alguns minutos e tente novamente.",
          },
          { status: 429, headers: { "Cache-Control": "no-store" } }
        );
      }
    } catch {
      // Do not block admin uploads if Redis is temporarily unavailable
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Payload JSON inválido." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const parsed = signUploadSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      {
        ok: false,
        error: firstIssue?.message || "Dados de upload inválidos.",
      },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { contentType, folder } = parsed.data;
  const ext = ALLOWED_IMAGE_MIME_TO_EXT[contentType];
  const randomSuffix = crypto.randomBytes(6).toString("hex");
  const storagePath = `${folder}/${Date.now()}-${randomSuffix}.${ext}`;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUploadUrl(storagePath);

    if (error || !data?.signedUrl) {
      console.error("[api/admin/uploads/sign] Supabase error:", error);
      return NextResponse.json(
        {
          ok: false,
          error: "Não foi possível gerar a URL de envio no armazenamento.",
        },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    const finalPath = data.path || storagePath;
    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(finalPath);

    return NextResponse.json(
      {
        ok: true,
        signedUrl: data.signedUrl,
        token: data.token,
        path: finalPath,
        publicUrl,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("[api/admin/uploads/sign] Unexpected error:", err);
    return NextResponse.json(
      { ok: false, error: "Erro interno ao preparar o envio da imagem." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
