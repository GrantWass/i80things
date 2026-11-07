import { places } from "@/data/places";
import type { Place } from "@/lib/types";

/**
 * Corridor position: where a hub sits on I-80, as one numeric mile range
 * and a fraction of the corridor. `data/places.ts` is the only source of
 * hub miles; this module only parses and derives from it.
 */

export type MileRange = { min: number; max: number };

/** Nebraska I-80 runs mile 0 at the Wyoming line to mile 454 at Omaha. */
const CORRIDOR_LENGTH = 454;

/**
 * Parse the display form used in `data/places.ts`: "20–29", "439–454",
 * "22", or the Hastings spur label "Spur via Exit 312" (a point at 312).
 * An "Exit N" mention wins over any other number in the label, so a route
 * such as "US-281" in the same string is never read as a second milepost.
 */
export function mileRange(raw: string | null | undefined): MileRange | null {
  if (!raw) return null;
  const text = raw.trim();
  if (!text) return null;

  const exit = text.match(/\bExit\s+(\d+(?:\.\d+)?)/i);
  if (exit) {
    const mile = Number(exit[1]);
    return { min: mile, max: mile };
  }

  const range = text.match(
    /(\d+(?:\.\d+)?)\s*(?:–|—|-|to)\s*(\d+(?:\.\d+)?)/i,
  );
  if (range) {
    const min = Number(range[1]);
    const max = Number(range[2]);
    return { min: Math.min(min, max), max: Math.max(min, max) };
  }

  const mile = text.match(/\b(?:mile|MM)\s*(\d+(?:\.\d+)?)/i);
  if (mile) {
    const value = Number(mile[1]);
    return { min: value, max: value };
  }

  const single = text.match(/\d+(?:\.\d+)?/);
  if (!single) return null;
  const value = Number(single[0]);
  return { min: value, max: value };
}

/** First mile of the range, for west-to-east sorting. Unknown → 0. */
export function firstMile(raw: string | null | undefined): number {
  return mileRange(raw)?.min ?? 0;
}

/** Display label for a raw mile marker such as `20–29` or `Spur via Exit 312`. */
export function mileLabel(raw: string | null | undefined): string {
  if (!raw) return "";
  const cleaned = raw
    .replace(/^Spur via\s+/i, "")
    .replace(/^I-80\s+/i, "")
    .trim();
  return /^\d/.test(cleaned) ? `MM ${cleaned}` : cleaned;
}

/**
 * Position of a hub on the corridor: its range, its display label, and how
 * far along the 0–454 line its midpoint sits, as a percentage.
 */
export function positionOf(slug: string): {
  range: MileRange;
  label: string;
  percent: number;
} | null {
  const place = places.find((p) => p.slug === slug);
  if (!place) return null;
  const range = mileRange(place.mileMarker);
  if (!range) return null;
  const label = mileLabel(place.mileMarker);
  const midpoint = (range.min + range.max) / 2;
  return { range, label, percent: (midpoint / CORRIDOR_LENGTH) * 100 };
}

/**
 * The hub closest to a mile, within `within` miles of its range. On an
 * exact tie the on-interstate hub wins over the Hastings spur (Hastings
 * sits on US-281 south of Exit 312, inside Grand Island's range); beyond
 * the window the result is null.
 */
export function nearestHub(mile: number, within = 25): Place | null {
  let best: { place: Place; distance: number } | null = null;
  for (const place of places) {
    const range = mileRange(place.mileMarker);
    if (!range) continue;
    const distance =
      mile < range.min
        ? range.min - mile
        : mile > range.max
          ? mile - range.max
          : 0;
    const better =
      !best ||
      distance < best.distance ||
      (distance === best.distance &&
        best.place.slug === "hastings" &&
        place.slug !== "hastings");
    if (better) best = { place, distance };
  }
  return best && best.distance <= within ? best.place : null;
}
