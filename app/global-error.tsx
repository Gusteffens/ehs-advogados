"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary:", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0D1812",
          color: "#EEEDE5",
          fontFamily: "Georgia, serif",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: "560px", textAlign: "center" }}>
          <p
            style={{
              color: "#E8D49A",
              fontSize: "12px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "16px",
              fontFamily: "sans-serif",
            }}
          >
            Erlo, Haas &amp; Steffens
          </p>
          <h1 style={{ fontSize: "36px", lineHeight: 1.15, marginBottom: "16px" }}>
            Ocorreu um erro inesperado
          </h1>
          <p
            style={{
              color: "rgba(238, 237, 229, 0.78)",
              fontSize: "16px",
              lineHeight: 1.6,
              marginBottom: "32px",
              fontFamily: "sans-serif",
            }}
          >
            Pedimos desculpas pelo transtorno. Tente recarregar a página ou
            volte para o início.
          </p>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                backgroundColor: "#E8D49A",
                color: "#0D1812",
                border: "none",
                borderRadius: "10px",
                padding: "12px 24px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "sans-serif",
              }}
            >
              Tentar novamente
            </button>
            <Link
              href="/"
              style={{
                color: "#EEEDE5",
                border: "1px solid rgba(238, 237, 229, 0.3)",
                borderRadius: "10px",
                padding: "12px 24px",
                textDecoration: "none",
                fontWeight: 600,
                fontFamily: "sans-serif",
              }}
            >
              Ir para o início
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
