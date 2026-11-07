import { HORIZONTAL_MAP, routeSegmentPath } from "@/lib/corridor-map";
import { mileLabel, mileRange } from "@/lib/corridor-position";
import type { Place } from "@/lib/types";

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
  const range = mileRange(source);
  if (!range || !source) return null;

  const isPoint = range.max - range.min < 0.5;
  const start = HORIZONTAL_MAP.pointAtMile(range.min);
  const end = HORIZONTAL_MAP.pointAtMile(range.max);
  const marker = mileLabel(source);
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
                d={routeSegmentPath(HORIZONTAL_MAP, range.min, range.max)}
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
