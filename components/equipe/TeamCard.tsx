import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { WhatsAppLink } from "@/components/tracking/whatsapp-link";
import { SITE_CONFIG, type TeamMemberConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

interface TeamCardProps {
  member: TeamMemberConfig;
}

export function TeamCard({ member }: TeamCardProps) {
  const firstName = member.name.split(" ")[0];
  const whatsappMessage = `Olá, gostaria de falar com ${member.name} sobre atendimento jurídico.`;
  const whatsappHref = `${SITE_CONFIG.contact.whatsapp}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <article
      className={cn(
        "relative rounded-2xl overflow-hidden flex flex-col h-full",
        "bg-forest-900 border border-forest-600/50",
        "transition-all duration-300 hover:border-gold/40 hover:shadow-2xl hover:shadow-gold/5"
      )}
    >
      {/* Top gradient bar */}
      <div
        className={cn(
          "h-1.5 bg-gradient-to-r absolute top-0 z-10 left-0 right-0",
          member.gradient
        )}
      />

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
        <div className="flex flex-wrap content-start gap-2 mt-4 min-h-[84px]">
          {member.specialties.map((specialty) => (
            <span
              key={specialty}
              className="px-3 py-1 text-xs font-medium rounded-lg bg-gold/10 text-gold border border-gold/20 h-fit"
            >
              {specialty}
            </span>
          ))}
        </div>

        {/* Spacer pushes CTA to bottom */}
        <div className="flex-1" />

        {/* Direct contextual WhatsApp CTA */}
        <div className="mt-5 pt-4 border-t border-forest-600/50">
          <WhatsAppLink
            href={whatsappHref}
            page="/equipe"
            placement="team-card"
            label={`WhatsApp ${member.name}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-cream transition-colors no-underline"
          >
            <MessageCircle className="h-4 w-4 shrink-0" />
            Falar com {firstName} pelo WhatsApp
          </WhatsAppLink>
        </div>
      </div>
    </article>
  );
}
