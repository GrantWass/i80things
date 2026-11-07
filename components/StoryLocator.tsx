import {
  CORRIDOR_MAX_MILE,
  CORRIDOR_MIN_MILE,
  HORIZONTAL_MAP,
} from "@/lib/corridor-map";
import type { Place } from "@/lib/types";

type MileRange = {
  min: number;
  max: number;
};

function clampMile(mile: number): number {
  return Math.max(CORRIDOR_MIN_MILE, Math.min(CORRIDOR_MAX_MILE, mile));
}

function parseMileRange(raw?: string): MileRange | null {
  if (!raw) return null;

  // An exit mention is a single point. Do not treat a route number such as
  // "US-281" in the same label as a second milepost.
  const exit = raw.match(/\bExit\s+(\d+(?:\.\d+)?)/i);
  if (exit) {
    const mile = clampMile(Number(exit[1]));
    return { min: mile, max: mile };
  }

  const range = raw.match(
    /(\d+(?:\.\d+)?)\s*(?:–|-|to)\s*(\d+(?:\.\d+)?)/i,
  );
  if (range) {
    const min = clampMile(Number(range[1]));
    const max = clampMile(Number(range[2]));
    return { min: Math.min(min, max), max: Math.max(min, max) };
  }

  const mile = raw.match(/\b(?:mile|MM)\s*(\d+(?:\.\d+)?)/i);
  if (mile) {
    const value = clampMile(Number(mile[1]));
    return { min: value, max: value };
  }

  const single = raw.match(/\d+(?:\.\d+)?/);
  if (!single) return null;
  const value = clampMile(Number(single[0]));
  return { min: value, max: value };
}

function markerLabel(raw: string): string {
  const cleaned = raw
    .replace(/^Spur via\s+/i, "")
    .replace(/^I-80\s+/i, "")
    .trim();
  return /^\d/.test(cleaned) ? `MM ${cleaned}` : cleaned;
}

function routeSegment(min: number, max: number): string {
  const points: string[] = [];
  const step = Math.max(0.5, (max - min) / 40);
  for (let mile = min; mile < max; mile += step) {
    const point = HORIZONTAL_MAP.pointAtMile(mile);
    points.push(`${point.x.toFixed(1)} ${point.y.toFixed(1)}`);
  }
  const end = HORIZONTAL_MAP.pointAtMile(max);
  points.push(`${end.x.toFixed(1)} ${end.y.toFixed(1)}`);
  return `M ${points.join(" L ")}`;
}

export function StoryLocator({
  place,
  mileMarker,
  className = "",
}: {
  place?: Pick<Place, "name" | "mileMarker"> | null;
  mileMarker?: string;
  className?: string;
}) {
  const source = mileMarker?.trim() || place?.mileMarker;
  const range = parseMileRange(source);
  if (!range || !source) return null;

  const isPoint = range.max - range.min < 0.5;
  const start = HORIZONTAL_MAP.pointAtMile(range.min);
  const end = HORIZONTAL_MAP.pointAtMile(range.max);
  const marker = markerLabel(source);
  const shortMarker = /^Exit\b/i.test(marker)
    ? marker.split("/")[0].trim()
    : marker;
  const label =
    place && !/^Exit\b/i.test(shortMarker)
      ? `${place.name} · ${shortMarker}`
      : shortMarker;
  const markerType = /^Exit\b/i.test(shortMarker)
    ? "I-80 exit"
    : "Mile markers";

  return (
    <figure
      aria-label={`Location on I-80: ${label}`}
      className={`w-full ${className}`}
    >
      <figcaption>
        <p className="kicker text-slate">On I-80</p>
        <p className="mt-1 font-serif text-2xl leading-none font-semibold tracking-tight text-ink">
          {shortMarker}
        </p>
        <p className="mt-1 text-[10px] font-semibold tracking-[0.08em] text-slate uppercase">
          {markerType}
          {place ? ` · ${place.name}` : ""}
        </p>
      </figcaption>

      <div className="mt-3">
        <svg
          viewBox={`0 0 ${HORIZONTAL_MAP.viewW} ${HORIZONTAL_MAP.viewH}`}
          aria-hidden="true"
          className="h-auto w-full"
        >
          <path
            d={HORIZONTAL_MAP.stateD}
            fill="var(--color-cream)"
            stroke="var(--color-line)"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <path
            d={HORIZONTAL_MAP.routeD}
            fill="none"
            stroke="var(--color-highway)"
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {isPoint ? (
            <>
              <circle
                cx={start.x}
                cy={start.y}
                r={22}
                fill="var(--color-paper)"
              />
              <circle
                cx={start.x}
                cy={start.y}
                r={14}
                fill="var(--color-highway)"
                stroke="var(--color-paper)"
                strokeWidth={3}
              />
            </>
          ) : (
            <>
              <path
                d={routeSegment(range.min, range.max)}
                fill="none"
                stroke="var(--color-amber-dark)"
                strokeWidth={24}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx={start.x}
                cy={start.y}
                r={9}
                fill="var(--color-amber-dark)"
                stroke="var(--color-paper)"
                strokeWidth={2}
              />
              <circle
                cx={end.x}
                cy={end.y}
                r={9}
                fill="var(--color-amber-dark)"
                stroke="var(--color-paper)"
                strokeWidth={2}
              />
            </>
          )}
        </svg>
      </div>
    </figure>
  );
}
