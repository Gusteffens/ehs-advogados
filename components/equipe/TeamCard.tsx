"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { SITE_CONFIG, type TeamMemberConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

interface TeamCardProps {
  member: TeamMemberConfig;
}

export function TeamCard({ member }: TeamCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const detailsId = `team-member-${member.slug}`;

  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden flex flex-col h-full",
        "bg-forest-900 border border-forest-600/50",
        "transition-all duration-500",
        isExpanded && "border-gold/30 shadow-2xl shadow-gold/5"
      )}
    >
      {/* Top gradient bar */}
      <div
        className={cn(
          "h-1.5 bg-gradient-to-r absolute top-0 z-10 left-0 right-0",
          member.gradient
        )}
      />

      {/* ── COLLAPSED STATE ── */}
      <div className="flex flex-col flex-1">
        {/* Photo */}
        <div className="relative w-full aspect-[3/4] overflow-hidden bg-ink">
          <Image
            src={member.deskImage}
            alt={`${member.name} - ${member.role}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-top"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-900 via-forest-900/20 to-transparent opacity-80" />
        </div>

        {/* Info */}
        <div className="flex flex-col flex-1 p-6 pt-0 -mt-10 relative z-10">
          <h2 className="font-display text-xl font-bold text-cream">
            {member.name}
          </h2>
          <p className="text-gold text-sm font-medium mt-1">{member.role}</p>
          <p className="text-cream/75 font-mono text-xs tracking-wider mt-2">
            {member.oab}
          </p>

          {/* Specialty badges — fixed min height so cards align */}
          <div className="flex flex-wrap content-start gap-2 mt-3 min-h-[100px]">
            {member.specialties.map((specialty) => (
              <span
                key={specialty}
                className="px-3 py-1 text-xs font-medium rounded-lg bg-gold/10 text-gold border border-gold/20 h-fit"
              >
                {specialty}
              </span>
            ))}
          </div>

          {/* Spacer pushes button to the bottom */}
          <div className="flex-1" />

          {/* Toggle button */}
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            aria-controls={detailsId}
            className={cn(
              "mt-5 flex items-center gap-2 text-sm font-semibold transition-colors",
              "text-gold hover:text-cream cursor-pointer"
            )}
          >
            {isExpanded ? (
              <>
                Fechar <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Ver perfil completo <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── EXPANDED STATE ── */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={detailsId}
            key="expanded-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-forest-600/50 mx-6" />

            <div className="p-6">
              {/* Specialties */}
              <div className="mb-5">
                <h3 className="font-display text-base font-bold text-cream mb-2">
                  Áreas de Atuação
                </h3>
                <ul className="flex flex-col gap-2">
                  {member.specialties.map((specialty) => (
                    <li
                      key={specialty}
                      className="flex items-center gap-2 text-sm text-cream/80"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                      {specialty}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact — WhatsApp */}
              <div className="flex flex-col gap-3">
                <h3 className="font-display text-base font-bold text-cream mb-1">
                  Contato
                </h3>

                <a
                  href={SITE_CONFIG.contact.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-cream/80 hover:text-gold transition-colors"
                >
                  <MessageCircle className="h-4 w-4 flex-shrink-0" />
                  WhatsApp
                </a>

                <p className="flex items-center gap-3 text-xs text-cream/65 font-mono tracking-wider mt-1">
                  {member.oab}
                </p>
              </div>
            </div>

            {/* Bottom close button */}
            <div className="px-6 pb-6 pt-0">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="flex items-center gap-2 text-sm font-semibold text-gold hover:text-cream transition-colors cursor-pointer"
              >
                Fechar <ChevronUp className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
