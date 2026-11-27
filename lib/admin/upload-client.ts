export const MAX_IMAGE_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB
export const MAX_IMAGE_UPLOAD_LABEL = "15MB";

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

export type AdminUploadFolder = "covers" | "content";

export type AdminUploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; error: string };

interface SignUploadResponse {
  ok?: boolean;
  signedUrl?: string;
  token?: string;
  path?: string;
  publicUrl?: string;
  error?: string;
}

function isAcceptedImageType(mimeType: string): boolean {
  return (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(mimeType);
}

function putFileWithProgress(
  signedUrl: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ ok: true } | { ok: false; error: string }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl, true);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.setRequestHeader("x-upsert", "true");

    xhr.upload.onprogress = (event) => {
      if (!onProgress) return;
      if (event.lengthComputable && event.total > 0) {
        const pct = Math.min(
          99,
          Math.max(5, Math.round((event.loaded / event.total) * 100))
        );
        onProgress(pct);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve({ ok: true });
        return;
      }

      let serverMessage = "Falha ao enviar a imagem para o armazenamento.";
      try {
        const parsed = JSON.parse(xhr.responseText) as {
          message?: string;
          error?: string;
        };
        if (parsed.message || parsed.error) {
          serverMessage = parsed.message || parsed.error || serverMessage;
        }
      } catch {
        // Keep generic message when response is not JSON
      }

      resolve({
        ok: false,
        error: `${serverMessage} (HTTP ${xhr.status})`,
      });
    };

    xhr.onerror = () => {
      resolve({
        ok: false,
        error: "Erro de rede ao enviar a imagem. Verifique sua conexão e tente novamente.",
      });
    };

    xhr.onabort = () => {
      resolve({
        ok: false,
        error: "Envio da imagem cancelado.",
      });
    };

    xhr.send(file);
  });
}

export async function uploadAdminImage(
  file: File,
  folder: AdminUploadFolder = "content",
  onProgress?: (pct: number) => void
): Promise<AdminUploadResult> {
  if (!file || file.size <= 0) {
    return { ok: false, error: "Arquivo de imagem inválido ou vazio." };
  }

  if (!isAcceptedImageType(file.type)) {
    return {
      ok: false,
      error: "Formato não suportado. Envie uma imagem JPG, PNG, WebP, AVIF ou GIF.",
    };
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `A imagem excede o limite de ${MAX_IMAGE_UPLOAD_LABEL}. Reduza o tamanho e tente novamente.`,
    };
  }

  onProgress?.(2);

  let signData: SignUploadResponse | null = null;
  try {
    const signResponse = await fetch("/api/admin/uploads/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name || "imagem",
        contentType: file.type,
        size: file.size,
        folder,
      }),
    });

    signData = (await signResponse.json().catch(() => null)) as SignUploadResponse | null;

    if (
      !signResponse.ok ||
      !signData?.ok ||
      !signData.signedUrl ||
      !signData.publicUrl ||
      !signData.path
    ) {
      return {
        ok: false,
        error:
          signData?.error ||
          "Não foi possível autorizar o envio da imagem. Tente novamente.",
      };
    }
  } catch {
    return {
      ok: false,
      error: "Erro de conexão ao preparar o envio da imagem.",
    };
  }

  onProgress?.(5);

  const uploadResult = await putFileWithProgress(
    signData.signedUrl,
    file,
    onProgress
  );

  if (!uploadResult.ok) {
    return uploadResult;
  }

  return {
    ok: true,
    url: signData.publicUrl,
    path: signData.path,
  };
}
