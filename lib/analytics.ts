import { track } from "@vercel/analytics";

export function trackEvent(
  name: string,
  properties?: Record<string, string | number | boolean | null>,
) {
  try {
    track(name, properties);
  } catch {
    // Analytics is best-effort; never break the UI if it fails.
  }
}
