"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin panel error:", error);
  }, [error]);

  return (
    <div className="max-w-xl mx-auto pt-28 lg:pt-16">
      <div className="rounded-2xl bg-white border border-forest-200 p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl font-bold text-ink mb-2">
          Algo deu errado no painel
        </h1>
        <p className="text-sm text-forest-600 mb-6 leading-relaxed">
          Não foi possível carregar esta seção do painel administrativo. Você
          pode tentar novamente ou retornar ao início.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => reset()}
          >
            <RotateCcw className="h-4 w-4" />
            Tentar novamente
          </Button>
          <Link href="/admin">
            <Button type="button" variant="outline" size="sm">
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
