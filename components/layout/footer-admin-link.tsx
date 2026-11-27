import Link from "next/link";

export function FooterAdminLink() {
  return (
    <Link
      href="/admin"
      className="text-xs text-cream/60 hover:text-gold transition-colors duration-300 no-underline"
    >
      Área Restrita
    </Link>
  );
}
