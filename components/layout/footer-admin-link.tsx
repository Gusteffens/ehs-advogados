"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

export function FooterAdminLink() {
  const { isSignedIn } = useAuth();

  return (
    <Link
      href={isSignedIn ? "/admin" : "/sign-in"}
      className="text-xs text-cream/60 hover:text-gold transition-colors duration-300 no-underline"
    >
      Área Restrita
    </Link>
  );
}
