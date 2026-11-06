"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

type TrackedLinkProps = {
  href: string;
  event: string;
  eventData?: Record<string, string | number | boolean | null>;
  external?: boolean;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  rel?: string;
};

export function TrackedLink({
  href,
  event,
  eventData,
  external = false,
  className,
  children,
  ariaLabel,
  rel = "noopener noreferrer",
}: TrackedLinkProps) {
  const handleClick = () => {
    trackEvent(event, eventData);
  };

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel={rel}
        className={className}
        aria-label={ariaLabel}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} aria-label={ariaLabel} onClick={handleClick}>
      {children}
    </Link>
  );
}
