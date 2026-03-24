import { UserProfile } from "@clerk/nextjs";

export default function PerfilPage() {
 return (
 <div className="max-w-3xl mx-auto pt-28 lg:pt-0">
 <div className="mb-8">
 <h1 className="font-display text-2xl font-bold text-[#0D1812] mb-1">Meu Perfil</h1>
 <p className="text-[#3B5A3C] text-sm">Gerencie suas informações de conta e configurações.</p>
 </div>

 <div className="rounded-2xl bg-white border border-forest-100 p-6 overflow-hidden">
 <UserProfile
 appearance={{
 elements: {
 rootBox: "w-full",
 cardBox: "w-full shadow-none border-0",
 card: "shadow-none border-0",
 navbarMobileMenuButton: "text-[#3B5A3C]",
 headerTitle: "font-display text-[#0D1812]",
 headerSubtitle: "text-[#3B5A3C]",
 formButtonPrimary: "bg-[#E8D49A] hover:bg-[#877249] text-[#0D1812] shadow-none rounded-xl",
 formFieldInput: "rounded-xl border-forest-200 focus:ring-champagne-500/50 focus:border-[#E8D49A]",
 formFieldLabel: "text-[#3B5A3C] text-sm",
 },
 }}
 />
 </div>
 </div>
 );
}
