"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Refresh a server-rendered conditions page while it is visible. The server
 * cache is five minutes; this keeps an open tab from going stale.
 */
export function AutoRefresh({ intervalMs = 300_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
