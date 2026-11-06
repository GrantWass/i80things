"use client";

import { useEffect } from "react";
import { site } from "@/lib/site";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({
  slot,
  format = "auto",
  minHeight = 250,
  className = "",
}: {
  slot?: string;
  format?: string;
  minHeight?: number;
  className?: string;
}) {
  const enabled = Boolean(site.adsenseClient && slot);

  useEffect(() => {
    if (!enabled) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      /* AdSense not ready; the slot stays reserved. */
    }
  }, [enabled]);

  if (!enabled) {
    if (process.env.NODE_ENV === "production") return null;
    return (
      <aside className={className} aria-label="Advertising placeholder">
        <p className="kicker mb-1.5 text-slate/70">Advertisement</p>
        <div
          className="flex items-center justify-center border border-dashed border-line bg-cream/60 text-[11px] tracking-wide text-slate/60 uppercase"
          style={{ minHeight }}
        >
          Ad slot — set NEXT_PUBLIC_ADSENSE_CLIENT + slot ID
        </div>
      </aside>
    );
  }

  return (
    <aside className={className} aria-label="Advertisement">
      <p className="kicker mb-1.5 text-slate/70">Advertisement</p>
      <ins
        className="adsbygoogle block"
        style={{ display: "block", minHeight }}
        data-ad-client={site.adsenseClient}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
