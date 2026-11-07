"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Record where a visit came from. Vercel Analytics keeps the referrer but drops
 * the query string, so campaign links need this to be countable at all.
 * Cookieless and once per landing: UTM parameters are only present on the
 * entry URL, not on client-side navigation.
 */
export function CampaignTracking() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const source = params.get("utm_source");
      const medium = params.get("utm_medium");
      const campaign = params.get("utm_campaign");
      if (!source && !medium) return;
      trackEvent("campaign_visit", {
        source: source ?? "unknown",
        medium: medium ?? "unknown",
        campaign: campaign ?? "none",
        path: window.location.pathname,
      });
    } catch {
      /* analytics is best-effort */
    }
  }, []);

  return null;
}
