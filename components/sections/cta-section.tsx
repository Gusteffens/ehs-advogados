"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export function CtaSection() {
 return (
 <section className="py-24 lg:py-28 bg-[#1B2D1E] relative overflow-hidden">
 {/* Decorative */}
 <div className="absolute inset-0">
 <div className="absolute top-0 right-0 w-96 h-96 bg-[#E8D49A]/8 rounded-full blur-[120px]" />
 <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#E8D49A]/5 rounded-full blur-[100px]" />
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#3B5A3C]/10 rounded-full blur-[150px]" />
 </div>

 <Container className="relative text-center">
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.6 }}
 >
 <span className="inline-block font-body text-sm font-semibold uppercase tracking-[0.2em] text-[#E8D49A] mb-5">
 Entre em contato
 </span>
 <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#EEEDE5] mb-6 leading-tight">
 Precisa de assessoria
 <br />
 <span className="text-[#E8D49A]">jurídica especializada?</span>
 </h2>
 <p className="text-[#EEEDE5]/70 text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-body">
 Agende uma consulta inicial. Nossa equipe está pronta
 para analisar seu caso e apresentar as melhores estratégias.
 </p>
 <div className="flex flex-col sm:flex-row gap-4 justify-center">
 <Link href="/contato">
 <Button variant="secondary" size="lg" className="group text-base">
 Fale com um Advogado
 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
 </Button>
 </Link>
 <a href="https://wa.me/+5549984001053" target="_blank" rel="noopener noreferrer">
 <Button
 variant="outline"
 size="lg"
 className="border-[#F5F0E8]/25 text-[#EEEDE5] hover:bg-[#EEEDE5]/10 hover:text-[#EEEDE5] text-base"
 >
 WhatsApp
 </Button>
 </a>
 </div>
 </motion.div>
 </Container>
 </section>
 );
}
