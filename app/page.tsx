import { HeroSection } from "@/components/sections/hero-section";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const AreasSection = dynamic(() => import("@/components/sections/areas-section").then((m) => m.AreasSection), { ssr: true });
const TeamSection = dynamic(() => import("@/components/sections/team-section").then((m) => m.TeamSection), { ssr: true });
const BlogCtaSection = dynamic(() => import("@/components/sections/blog-cta-section").then((m) => m.BlogCtaSection), { ssr: true });
const CtaSection = dynamic(() => import("@/components/sections/cta-section").then((m) => m.CtaSection), { ssr: true });

export default function Home() {
    return (
        <>
            <HeroSection />
            <Suspense fallback={<div className="min-h-screen bg-[#EEEDE5]" />}>
                <AreasSection />
                <TeamSection />
                <BlogCtaSection />
                <CtaSection />
            </Suspense>
        </>
    );
}
