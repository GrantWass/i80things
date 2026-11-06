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
    <div className="no-print fixed inset-x-3 bottom-3 z-40 mx-auto max-w-3xl border border-ink bg-paper p-4 shadow-2xl sm:flex sm:items-center sm:gap-5">
      <p className="text-xs leading-relaxed text-ink-soft">
        We use privacy-friendly, cookieless analytics. When advertising is
        enabled, our ad partner may use cookies to serve and personalize ads.{" "}
        <Link href="/privacy" className="font-semibold underline decoration-amber">
          Privacy & cookie details
        </Link>
        .
      </p>
      <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.setItem("i80-consent-v2", new Date().toISOString());
            } catch {}
            setVisible(false);
          }}
          className="bg-ink px-4 py-2 text-[11px] font-bold tracking-[0.1em] text-paper uppercase hover:bg-highway"
        >
          Got it
        </button>
        <Link
          href="/privacy"
          className="border border-line px-4 py-2 text-[11px] font-bold tracking-[0.1em] text-ink uppercase hover:bg-cream"
        >
          Details
        </Link>
      </div>
    </div>
  );
}
