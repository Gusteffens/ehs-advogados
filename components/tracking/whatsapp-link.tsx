"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { trackWhatsAppClick } from "@/lib/tracking";

export interface WhatsAppLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  page: string;
  placement: string;
  label?: string;
}

export function WhatsAppLink({
  page,
  placement,
  label,
  onClick,
  target = "_blank",
  rel = "noopener noreferrer",
  ...props
}: WhatsAppLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    trackWhatsAppClick({ page, placement, label });
    onClick?.(event);
  };

  return (
    <a target={target} rel={rel} onClick={handleClick} {...props} />
  );
}
