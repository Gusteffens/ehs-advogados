"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Mail, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TeamMember {
    name: string;
    role: string;
    oab: string;
    specialties: string[];
    image: string;
    gradient: string;
    email: string;
    bio: string;
    whatsapp: string;
}

interface TeamCardProps {
    member: TeamMember;
    isExpanded: boolean;
    onToggle: () => void;
}

export function TeamCard({ member, isExpanded, onToggle }: TeamCardProps) {
    return (
        <div
            className={cn(
                "relative rounded-2xl overflow-hidden flex flex-col h-full",
                "bg-[#1B2D1E] border border-[#3B5A3C]/50",
                "transition-all duration-500",
                isExpanded && "border-[#E8D49A]/30 shadow-2xl shadow-[#E8D49A]/5"
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
            <div className="flex flex-col">
                {/* Photo */}
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#0D1812]">
                    <Image
                        src={member.image}
                        alt={`${member.name} - ${member.role}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-top"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1B2D1E] via-[#1B2D1E]/20 to-transparent opacity-80" />
                </div>

                {/* Info */}
                <div className="flex flex-col p-6 pt-0 -mt-10 relative z-10">
                    <h2 className="font-display text-xl font-bold text-[#EEEDE5]">
                        {member.name}
                    </h2>
                    <p className="text-[#E8D49A] text-sm font-medium mt-1">
                        {member.role}
                    </p>
                    <p className="text-[#EEEDE5]/60 font-mono text-xs tracking-wider mt-2">
                        {member.oab}
                    </p>

                    {/* Specialty badges — fixed min height so cards align */}
                    <div className="flex flex-wrap content-start gap-2 mt-3 min-h-[100px]">
                        {member.specialties.map((s) => (
                            <span
                                key={s}
                                className="px-3 py-1 text-xs font-medium rounded-lg bg-[#E8D49A]/10 text-[#E8D49A] border border-[#E8D49A]/20 h-fit"
                            >
                                {s}
                            </span>
                        ))}
                    </div>

                    {/* Bio preview — only show if bio exists */}
                    {member.bio && (
                        <p className="text-[#EEEDE5]/60 text-sm leading-relaxed mt-4 line-clamp-2 min-h-[48px]">
                            {member.bio}
                        </p>
                    )}

                    {/* Spacer pushes button to the bottom */}
                    <div className="flex-1" />

                    {/* Toggle button */}
                    <button
                        onClick={onToggle}
                        className={cn(
                            "mt-5 flex items-center gap-2 text-sm font-semibold transition-colors",
                            "text-[#E8D49A] hover:text-[#EEEDE5]",
                            "cursor-pointer"
                        )}
                    >
                        {isExpanded ? (
                            <>
                                Fechar <ChevronUp className="h-4 w-4" />
                            </>
                        ) : (
                            <>
                                Ver perfil completo{" "}
                                <ChevronDown className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* ── EXPANDED STATE ── */}
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        key="expanded-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-[#3B5A3C]/50 mx-6" />

                        <div className="p-6">
                            {/* Full bio — only show if bio exists */}
                            {member.bio && (
                                <div className="mb-5">
                                    <h3 className="font-display text-base font-bold text-[#EEEDE5] mb-2">
                                        Sobre
                                    </h3>
                                    <p className="text-[#EEEDE5]/70 text-sm leading-relaxed">
                                        {member.bio}
                                    </p>
                                </div>
                            )}

                            {/* Specialties */}
                            <div className="mb-5">
                                <h3 className="font-display text-base font-bold text-[#EEEDE5] mb-2">
                                    Áreas de Atuação
                                </h3>
                                <ul className="flex flex-col gap-2">
                                    {member.specialties.map((s) => (
                                        <li
                                            key={s}
                                            className="flex items-center gap-2 text-sm text-[#EEEDE5]/70"
                                        >
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#E8D49A] flex-shrink-0" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Contact — WhatsApp only */}
                            <div className="flex flex-col gap-3">
                                <h3 className="font-display text-base font-bold text-[#EEEDE5] mb-1">
                                    Contato
                                </h3>

                                <a
                                    href={member.whatsapp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-sm text-[#EEEDE5]/70 hover:text-[#E8D49A] transition-colors"
                                >
                                    <MessageCircle className="h-4 w-4 flex-shrink-0" />
                                    WhatsApp
                                </a>

                                <p className="flex items-center gap-3 text-xs text-[#EEEDE5]/40 font-mono tracking-wider mt-1">
                                    {member.oab}
                                </p>
                            </div>
                        </div>

                        {/* Bottom close button */}
                        <div className="px-6 pb-6 pt-0">
                            <button
                                onClick={onToggle}
                                className="flex items-center gap-2 text-sm font-semibold text-[#E8D49A] hover:text-[#EEEDE5] transition-colors cursor-pointer"
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
