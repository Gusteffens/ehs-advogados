"use client";

import { useActionState } from "react";
import { submitContactForm, type ContactFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const initialState: ContactFormState = {
 success: false,
 error: null,
 message: null,
};

const subjects = [
 "Direito Civil",
 "Direito Penal",
 "Direito do Agronegócio",
 "Direito Ambiental",
 "Direito Militar",
 "Direito Agrário",
 "Direito Empresarial",
 "Outro assunto",
];

const inputClasses =
 "w-full rounded-xl border border-forest-200 bg-white px-4 py-3 text-[#0D1812] font-body text-[0.925rem] placeholder:text-[#3B5A3C]/70 focus:outline-none focus:ring-2 focus:ring-champagne-500/50 focus:border-[#E8D49A] transition-all";

export function ContactForm() {
 const [state, formAction, isPending] = useActionState(submitContactForm, initialState);

 if (state.success) {
 return (
 <div className="rounded-2xl bg-[#EEEDE5] border border-forest-200 p-8 text-center">
 <CheckCircle className="h-12 w-12 text-[#3B5A3C] mx-auto mb-4" />
 <h3 className="font-display text-xl font-bold text-[#0D1812] mb-2">Mensagem enviada!</h3>
 <p className="text-[#3B5A3C]">{state.message}</p>
 </div>
 );
 }

 return (
 <form action={formAction} className="space-y-5">
 {state.error && (
 <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
 <AlertCircle className="h-4 w-4 shrink-0" />
 {state.error}
 </div>
 )}

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
 <div>
 <label htmlFor="name" className="block text-sm font-medium text-[#0D1812] mb-1.5">
 Nome completo *
 </label>
 <input
 id="name"
 name="name"
 type="text"
 required
 placeholder="Seu nome"
 className={inputClasses}
 />
 </div>
 <div>
 <label htmlFor="email" className="block text-sm font-medium text-[#0D1812] mb-1.5">
 E-mail *
 </label>
 <input
 id="email"
 name="email"
 type="email"
 required
 placeholder="seu@email.com"
 className={inputClasses}
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
 <div>
 <label htmlFor="phone" className="block text-sm font-medium text-[#0D1812] mb-1.5">
 Telefone
 </label>
 <input
 id="phone"
 name="phone"
 type="tel"
 placeholder="(51) 99999-9999"
 className={inputClasses}
 />
 </div>
 <div>
 <label htmlFor="subject" className="block text-sm font-medium text-[#0D1812] mb-1.5">
 Assunto
 </label>
 <select
 id="subject"
 name="subject"
 className={cn(inputClasses, "appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%234A7C5C%22%20d%3D%22M2%204l4%204%204-4%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_1rem_center]")}
 >
 <option value="">Selecione um assunto</option>
 {subjects.map((s) => (
 <option key={s} value={s}>{s}</option>
 ))}
 </select>
 </div>
 </div>

 <div>
 <label htmlFor="message" className="block text-sm font-medium text-[#0D1812] mb-1.5">
 Mensagem *
 </label>
 <textarea
 id="message"
 name="message"
 required
 rows={5}
 placeholder="Descreva brevemente como podemos ajudar..."
 className={cn(inputClasses, "resize-none")}
 />
 </div>

 <Button
 type="submit"
 variant="secondary"
 size="lg"
 disabled={isPending}
 className="w-full group"
 >
 {isPending ? "Enviando..." : "Enviar Mensagem"}
 <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
 </Button>

 <p className="text-xs text-[#3B5A3C] text-center">
 Ao enviar, você concorda com nossa{" "}
 <a href="/politica-de-privacidade" className="underline hover:text-[#3B5A3C]">
 Política de Privacidade
 </a>
 .
 </p>
 </form>
 );
}
