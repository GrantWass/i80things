/**
 * Nebraska 511 event reader for the public conditions page.
 *
 * The query, decode, filter, classification and sort live in
 * `lib/corridor-511.mjs` (shared with the desk's `scripts/check-511.mjs`).
 * This module keeps only what is site-specific: the 5-minute
 * cache/revalidate behaviour, the error surface, the 12-event page cap,
 * and the shape returned to pages.
 */
import { fetchCorridorEvents } from "./corridor-511.mjs";

export type RoadConditionCategory =
  | "closure"
  | "incident"
  | "construction"
  | "conditions"
  | "other";

export type RoadConditionEvent = {
  id: string;
  title: string;
  category: RoadConditionCategory;
  description: string;
  priority: number | null;
  agency: string | null;
  agencyUrl: string | null;
  lastUpdated: string | null;
  beginTime: string | null;
  url: string;
  location: {
    primaryLinearReference?: string;
    secondaryLinearReference?: string;
  } | null;
};

export type RoadConditions = {
  events: RoadConditionEvent[];
  fetchedAt: string | null;
  totalStatewideEvents: number;
  error: boolean;
};

export async function getRoadConditions(): Promise<RoadConditions> {
  try {
    const { events, fetchedAt, totalStatewideEvents } =
      await fetchCorridorEvents({
        max: 12,
        fetchInit: { next: { revalidate: 300 } },
      });

    return {
      events: events as RoadConditionEvent[],
      fetchedAt,
      totalStatewideEvents,
      error: false,
    };
  } catch {
    return { events: [], fetchedAt: null, totalStatewideEvents: 0, error: true };
  }
}
