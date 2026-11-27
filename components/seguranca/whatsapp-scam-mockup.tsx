import { AlertTriangle, ShieldAlert } from "lucide-react";

const scamMessages = [
  {
    text: "OLÁ, FULANO, ESSE É O MEU NOVO CONTATO! TENHO ÓTIMAS NOTÍCIAS, GANHAMOS O PROCESSO!",
    time: "09:10",
  },
  {
    text: "VOCÊ VAI RECEBER UMA INDENIZAÇÃO!",
    time: "09:11",
  },
  {
    text: "ME PASSA ESSE PIX NESSA CONTA?",
    time: "09:11",
  },
  {
    text: "VAI TER UMA AUDIÊNCIA URGENTE AGORA NO STF.",
    time: "09:12",
  },
  {
    text: "TEM QUE SER AGORA, SENÃO VOCÊ PERDE O VALOR!",
    time: "09:14",
  },
] as const;

export function WhatsAppScamMockup() {
  return (
    <div
      className="mx-auto w-full max-w-[360px] rounded-[2rem] border border-gold/30 bg-ink/90 p-2.5 shadow-2xl shadow-black/50"
      aria-label="Simulação ilustrativa de tentativa de golpe pelo WhatsApp"
    >
      <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#ECE5DD]">
        {/* Red alert banner */}
        <div className="flex items-center justify-center gap-2 bg-red-700 px-4 py-2.5 text-center">
          <AlertTriangle className="h-4 w-4 shrink-0 text-white" aria-hidden="true" />
          <span className="font-body text-xs font-extrabold uppercase tracking-[0.14em] text-white">
            CUIDADO!!! É GOLPE!!
          </span>
          <AlertTriangle className="h-4 w-4 shrink-0 text-white" aria-hidden="true" />
        </div>

        {/* WhatsApp-style header */}
        <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3 text-white">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 font-display text-base font-bold text-white ring-1 ring-white/25">
            G
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold leading-tight text-white">
              Golpista
            </p>
            <p className="truncate text-[11px] text-white/75">
              visto por último hoje às 09:18
            </p>
          </div>
          <ShieldAlert className="h-4 w-4 shrink-0 text-red-200" aria-hidden="true" />
        </div>

        {/* Chat body */}
        <div className="space-y-2.5 bg-[#ECE5DD] px-3.5 py-4">
          {/* Illustrative stamp */}
          <div className="flex justify-center pb-1">
            <span className="rounded-full bg-ink/10 px-3 py-1 text-center text-[11px] font-semibold text-ink/80">
              Mensagem ilustrativa de tentativa de golpe
            </span>
          </div>

          {scamMessages.map((msg, index) => (
            <div key={index} className="flex justify-start">
              <div className="relative max-w-[92%] rounded-2xl rounded-tl-sm border border-red-300/90 bg-red-50 px-3.5 py-2.5 shadow-sm">
                <p className="text-[12px] font-bold leading-snug text-red-950">
                  {msg.text}
                </p>
                <span className="mt-1 block text-right text-[10px] font-medium text-red-900/65">
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
