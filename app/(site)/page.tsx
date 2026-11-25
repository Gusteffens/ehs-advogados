import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroSection } from "@/components/sections/hero-section";
import { AreasSection } from "@/components/sections/areas-section";
import { TeamSection } from "@/components/sections/team-section";
import { BlogCtaSection } from "@/components/sections/blog-cta-section";
import { InstagramSection } from "@/components/sections/instagram-section";
import { CtaSection } from "@/components/sections/cta-section";

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <AreasSection />
      <TeamSection />
      <Suspense fallback={<div className="min-h-[420px] bg-cream" />}>
        <BlogCtaSection />
      </Suspense>
      <Suspense fallback={<div className="min-h-[420px] bg-cream-light" />}>
        <InstagramSection />
      </Suspense>
      <CtaSection />
    </>
  );
}
