"use client";

import { useState } from "react";

export function ShareButtons({
  title,
  url,
  compact = false,
}: {
  title: string;
  url: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  const button =
    "inline-flex items-center gap-1.5 border border-line px-2.5 py-1.5 text-[11px] font-semibold tracking-wide text-ink-soft transition hover:border-ink hover:text-ink";

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${compact ? "" : "mt-5"}`}>
      <span className="kicker mr-1 text-slate">Share</span>
      <a
        className={button}
        href={`https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        X
      </a>
      <a
        className={button}
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Facebook
      </a>
      <button type="button" onClick={copy} className={button}>
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
