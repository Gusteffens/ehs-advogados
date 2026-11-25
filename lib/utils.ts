import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes intelligently */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Estimate reading time in minutes from HTML or plain text content */
export function calculateReadingTime(html: string): number {
  const plainText = html.replace(/<[^>]*>/g, " ").trim();
  const words = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

export function isNextRedirectError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeRedirect = error as {
    message?: unknown;
    digest?: unknown;
  };

  return (
    maybeRedirect.message === "NEXT_REDIRECT" ||
    (typeof maybeRedirect.digest === "string" &&
      maybeRedirect.digest.startsWith("NEXT_REDIRECT"))
  );
}

export function getErrorMessage(error: unknown, fallback = "Erro inesperado"): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
