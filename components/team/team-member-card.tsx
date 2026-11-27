import Image from "next/image";
import { Mail, MessageCircle } from "lucide-react";
import { WhatsAppLink } from "@/components/tracking/whatsapp-link";
import { SITE_CONFIG, type TeamMemberConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export interface TeamMemberCardProps {
  member: TeamMemberConfig;
  variant?: "home" | "full";
  className?: string;
}

export function TeamMemberCard({
  member,
  variant = "full",
  className,
}: TeamMemberCardProps) {
  const isHome = variant === "home";
  const Heading = isHome ? "h3" : "h2";
  const firstName = member.name.split(" ")[0];
  const photoSrc = isHome ? member.image : member.deskImage;
  const whatsappMessage = `Olá, gostaria de falar com ${member.name} sobre atendimento jurídico.`;
  const whatsappHref = `${SITE_CONFIG.contact.whatsapp}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <article
      className={cn(
        "group relative flex flex-col h-full rounded-2xl overflow-hidden",
        "bg-forest-900 border border-forest-600/45",
        "transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/45 hover:shadow-2xl hover:shadow-ink/40",
        className
      )}
    >
      {/* Subtle tonal top hairline */}
      <div
        className={cn(
          "h-1 bg-gradient-to-r absolute top-0 left-0 right-0 z-10",
          member.gradient
        )}
        aria-hidden="true"
      />

      {/* Portrait */}
      <div className="relative w-full aspect-[3/4] shrink-0 overflow-hidden bg-ink">
        <Image
          src={photoSrc}
          alt={`${member.name} — ${member.role} especialista em ${member.specialties.join(", ")}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-forest-900 via-forest-900/35 to-transparent"
          aria-hidden="true"
        />

        {/* Name & role anchored over bottom vignette */}
        <div className="absolute inset-x-0 bottom-0 p-6 pt-12">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gold/90 mb-1">
            {member.role}
          </p>
          <Heading className="font-display text-2xl font-bold text-cream leading-tight">
            {member.name}
          </Heading>
          <p className="mt-1.5 font-mono text-xs tracking-wider text-cream/75">
            {member.oab}
          </p>
        </div>
      </div>

      {/* Editorial body */}
      <div className="flex flex-col flex-1 p-6 pt-4 bg-forest-900">
        {/* Specialties */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {member.specialties.map((specialty) => (
            <span
              key={specialty}
              className="inline-flex items-center px-2.5 py-1 text-[0.72rem] font-medium rounded-full bg-gold/12 text-gold border border-gold/25"
            >
              {specialty}
            </span>
          ))}
        </div>

        {/* Concise bio */}
        <p
          className={cn(
            "text-sm text-cream/80 leading-relaxed font-body",
            isHome ? "line-clamp-3 mb-4" : "mb-4"
          )}
        >
          {member.bio}
        </p>

        {/* Credentials bullets on full variant */}
        {!isHome && member.credentials.length > 0 && (
          <ul className="space-y-1.5 mb-5 text-xs text-cream/70">
            {member.credentials.map((credential) => (
              <li key={credential} className="flex items-center gap-2">
                <span
                  className="h-1 w-1 rounded-full bg-gold shrink-0"
                  aria-hidden="true"
                />
                <span>{credential}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Direct actions */}
        <div className="mt-auto pt-4 border-t border-forest-600/40 flex items-center justify-between gap-3">
          <WhatsAppLink
            href={whatsappHref}
            page={isHome ? "/" : "/equipe"}
            placement={isHome ? "home-team-card" : "equipe-team-card"}
            label={`WhatsApp ${member.name}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-cream transition-colors no-underline"
          >
            <MessageCircle className="h-4 w-4 shrink-0" />
            <span>Falar com {firstName}</span>
          </WhatsAppLink>

          <a
            href={`mailto:${member.email}`}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-forest-600/50 text-cream/75 hover:border-gold/40 hover:text-gold hover:bg-gold/10 transition-colors"
            aria-label={`Enviar e-mail para ${member.name}`}
            title={member.email}
          >
            <Mail className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
}
