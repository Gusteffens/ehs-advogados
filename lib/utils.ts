import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/** Merge Tailwind classes intelligently */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Format a date in pt-BR locale */
export function formatDate(date: string | Date, pattern = "d 'de' MMMM 'de' yyyy") {
    return format(new Date(date), pattern, { locale: ptBR });
}

/** Relative time (e.g. "há 2 dias") */
export function formatRelativeDate(date: string | Date) {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
}

/** Estimate reading time from text content */
export function calculateReadingTime(text: string): number {
    const wordsPerMinute = 200;
    const wordCount = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
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
