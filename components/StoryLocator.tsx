import {
  CORRIDOR_MAX_MILE,
  CORRIDOR_MIN_MILE,
} from "@/lib/corridor-map";
import { mileRange } from "@/lib/corridor-position";
import type { Place } from "@/lib/types";

function clampMile(mile: number): number {
  return Math.max(CORRIDOR_MIN_MILE, Math.min(CORRIDOR_MAX_MILE, mile));
}

function markerLabel(raw: string): string {
  const cleaned = raw
    .replace(/^Spur via\s+/i, "")
    .replace(/^I-80\s+/i, "")
    .trim();
  return /^\d/.test(cleaned) ? `MM ${cleaned}` : cleaned;
}

function percentAtMile(mile: number): number {
  return (
    ((mile - CORRIDOR_MIN_MILE) /
      (CORRIDOR_MAX_MILE - CORRIDOR_MIN_MILE)) *
    100
  );
}

export function StoryLocator({
  place,
  mileMarker,
}: {
  place?: Pick<Place, "name" | "mileMarker"> | null;
  mileMarker?: string;
}) {
  const source = mileMarker?.trim() || place?.mileMarker;
  const parsed = mileRange(source);
  const range = parsed
    ? { min: clampMile(parsed.min), max: clampMile(parsed.max) }
    : null;
  if (!range || !source) return null;

  const isPoint = range.max - range.min < 0.5;
  const left = percentAtMile(range.min);
  const span = percentAtMile(range.max) - left;
  const marker = markerLabel(source);
  const shortMarker = /^Exit\b/i.test(marker)
    ? marker.split("/")[0].trim()
    : marker;
  const label =
    place && !/^Exit\b/i.test(shortMarker)
      ? `${place.name} · ${shortMarker}`
      : shortMarker;

  return (
    <div className="mt-5 max-w-md">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="kicker text-slate">On I-80</p>
        <p className="max-w-full text-right text-[10px] font-bold tracking-[0.06em] text-ink-soft uppercase">
          {label}
        </p>
      </div>
      <div aria-hidden="true" className="relative mt-1.5 h-6">
        <span className="absolute inset-x-0 top-1 h-px bg-line" />
        {isPoint ? (
          <span
            className="absolute top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-paper bg-highway"
            style={{ left: `${left}%` }}
          />
        ) : (
          <span
            className="absolute top-0.5 h-1.5 bg-highway"
            style={{ left: `${left}%`, width: `${Math.max(span, 0.9)}%` }}
          />
        )}
        <span className="absolute top-3 left-0 text-[8px] font-semibold tracking-[0.06em] text-slate uppercase">
          MM {CORRIDOR_MIN_MILE}
        </span>
        <span className="absolute top-3 right-0 text-[8px] font-semibold tracking-[0.06em] text-slate uppercase">
          MM {CORRIDOR_MAX_MILE}
        </span>
      </div>
    </div>
  );
}
