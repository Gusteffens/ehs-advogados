export const ADMIN_SESSION_COOKIE = "ehs_admin_session";
export const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export interface AdminSessionPayload {
  sub: string;
  email: string;
  name: string;
  role: "admin";
  iat: number;
  exp: number;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getSessionSecret(): string {
  const configured =
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "";

  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV !== "production") {
    return "ehs-local-dev-session-secret-change-in-prod";
  }

  return "";
}

export function isSessionSecretConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_SESSION_SECRET?.trim() ||
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(input: string): Uint8Array | null {
  try {
    const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
    const padLength = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + "=".repeat(padLength);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signSessionToken(
  payload: Omit<AdminSessionPayload, "iat" | "exp" | "role"> & {
    role?: "admin";
    iat?: number;
    exp?: number;
  },
  ttlSeconds: number = DEFAULT_SESSION_TTL_SECONDS
): Promise<string> {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET (or SUPABASE_SERVICE_ROLE_KEY) must be configured in production."
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const fullPayload: AdminSessionPayload = {
    sub: payload.sub,
    email: payload.email,
    name: payload.name,
    role: "admin",
    iat: payload.iat ?? now,
    exp: payload.exp ?? now + ttlSeconds,
  };

  const payloadSegment = bytesToBase64Url(
    encoder.encode(JSON.stringify(fullPayload))
  );
  const key = await importHmacKey(secret);
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadSegment)
  );
  const signatureSegment = bytesToBase64Url(new Uint8Array(signatureBuffer));

  return `${payloadSegment}.${signatureSegment}`;
}

export async function verifySessionToken(
  token: string | null | undefined
): Promise<AdminSessionPayload | null> {
  if (!token || typeof token !== "string") {
    return null;
  }

  const secret = getSessionSecret();
  if (!secret) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [payloadSegment, signatureSegment] = parts;
  if (!payloadSegment || !signatureSegment) {
    return null;
  }

  const signatureBytes = base64UrlToBytes(signatureSegment);
  if (!signatureBytes) {
    return null;
  }

  try {
    const key = await importHmacKey(secret);
    const validSignature = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as unknown as BufferSource,
      encoder.encode(payloadSegment)
    );

    if (!validSignature) {
      return null;
    }

    const payloadBytes = base64UrlToBytes(payloadSegment);
    if (!payloadBytes) {
      return null;
    }

    const parsed = JSON.parse(decoder.decode(payloadBytes)) as Partial<AdminSessionPayload>;
    if (
      !parsed ||
      typeof parsed.sub !== "string" ||
      !parsed.sub ||
      typeof parsed.email !== "string" ||
      !parsed.email ||
      typeof parsed.name !== "string" ||
      parsed.role !== "admin" ||
      typeof parsed.iat !== "number" ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (parsed.exp <= now) {
      return null;
    }

    return parsed as AdminSessionPayload;
  } catch {
    return null;
  }
}
