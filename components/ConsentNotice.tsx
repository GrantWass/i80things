"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function ConsentNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem("i80-consent-v2")) setVisible(true);
    } catch {
      /* private mode */
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="no-print fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-3xl items-center gap-3 border border-ink bg-paper p-2.5 shadow-2xl sm:gap-5 sm:p-4">
      <p className="min-w-0 flex-1 text-[10px] leading-snug text-ink-soft sm:text-xs sm:leading-relaxed">
        <span className="sm:hidden">
          Privacy-friendly analytics.{" "}
          <Link href="/privacy" className="font-semibold underline decoration-amber">
            Details
          </Link>
          .
        </span>
        <span className="hidden sm:inline">
          We use privacy-friendly, cookieless analytics. When ads are enabled,
          our ad partner may use cookies.{" "}
          <Link href="/privacy" className="font-semibold underline decoration-amber">
            Privacy &amp; cookie details
          </Link>
          .
        </span>
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.setItem("i80-consent-v2", new Date().toISOString());
            } catch {}
            setVisible(false);
          }}
          className="min-h-11 bg-ink px-4 py-2 text-[10px] font-bold tracking-[0.1em] text-paper uppercase hover:bg-highway sm:text-[11px]"
        >
          Got it
        </button>
        <Link
          href="/privacy"
          className="hidden min-h-11 items-center border border-line px-4 py-2 text-[10px] font-bold tracking-[0.1em] text-ink uppercase hover:bg-cream sm:inline-flex sm:text-[11px]"
        >
          Details
        </Link>
      </div>
    </div>
  );
}
