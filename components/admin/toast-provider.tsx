"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
}

export interface ToastApi {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

interface ToastContextValue {
  toast: ToastApi;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4500;
const MAX_VISIBLE_TOASTS = 4;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (variant: ToastVariant, title: string, description?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setItems((prev) => {
        const next = [...prev, { id, variant, title, description }];
        if (next.length > MAX_VISIBLE_TOASTS) {
          const removed = next.shift();
          if (removed) {
            const oldTimer = timersRef.current.get(removed.id);
            if (oldTimer) {
              clearTimeout(oldTimer);
              timersRef.current.delete(removed.id);
            }
          }
        }
        return next;
      });

      const timer = setTimeout(() => {
        dismiss(id);
      }, AUTO_DISMISS_MS);
      timersRef.current.set(id, timer);
    },
    [dismiss]
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      toast: {
        success: (title, description) => push("success", title, description),
        error: (title, description) => push("error", title, description),
        info: (title, description) => push("info", title, description),
      },
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2.5 sm:bottom-6 sm:right-6"
      >
        {items.map((item) => {
          const isSuccess = item.variant === "success";
          const isError = item.variant === "error";

          return (
            <div
              key={item.id}
              role={isError ? "alert" : "status"}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white/95 backdrop-blur-md px-4 py-3.5 shadow-xl transition-all duration-300 animate-slide-up",
                isSuccess && "border-forest-200",
                isError && "border-red-200",
                item.variant === "info" && "border-champagne-300"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                  isSuccess && "bg-forest-50 text-forest-700",
                  isError && "bg-red-50 text-red-600",
                  item.variant === "info" && "bg-champagne-100 text-gold-dark"
                )}
              >
                {isSuccess && <CheckCircle2 className="h-4 w-4" />}
                {isError && <AlertCircle className="h-4 w-4" />}
                {item.variant === "info" && <Info className="h-4 w-4" />}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink leading-snug">
                  {item.title}
                </p>
                {item.description && (
                  <p className="mt-0.5 text-xs text-forest-600 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Fechar notificação"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-forest-500 hover:bg-cream hover:text-ink transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
