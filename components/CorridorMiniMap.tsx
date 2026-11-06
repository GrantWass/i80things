import Link from "next/link";
import { Arrow } from "@/components/Icon";
import {
  CORRIDOR_TOWNS,
  HORIZONTAL_MAP,
} from "@/lib/corridor-map";

/**
 * Compact, non-interactive version of the corridor map for the homepage.
 * The whole card is one link, so it never nests clickable map pins inside an
 * anchor.
 */
export function CorridorMiniMap() {
  const map = HORIZONTAL_MAP;

  return (
    <Link
      href="/conditions"
      className="group block border border-line bg-paper transition hover:border-ink"
    >
      <div className="flex items-baseline justify-between gap-2 border-b border-line px-4 py-2.5">
        <h2 className="kicker text-slate">Corridor map</h2>
        <span className="text-[9px] font-bold tracking-[0.1em] text-slate uppercase">
          MM 22 → 454
        </span>
      </div>

      <div className="bg-cream/50 px-3 py-3">
        <svg
          viewBox={`0 0 ${map.viewW} ${map.viewH}`}
          aria-hidden="true"
          focusable="false"
          className="h-auto w-full"
        >
          <path
            d={map.stateD}
            fill="var(--color-paper)"
            stroke="var(--color-line)"
            strokeWidth={2.2}
            strokeLinejoin="round"
          />
          <path
            d={map.routeD}
            fill="none"
            stroke="var(--color-highway)"
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x={520}
            y={205}
            textAnchor="middle"
            fill="var(--color-highway)"
            fontFamily="var(--font-sans)"
            fontSize={34}
            fontWeight={700}
            letterSpacing={1}
            opacity={0.85}
          >
            I-80
          </text>
          {CORRIDOR_TOWNS.map((town) => {
            const dot = map.project(town.lon, town.lat);
            return (
              <circle
                key={town.name}
                cx={dot.x}
                cy={dot.y}
                r={7}
                fill="var(--color-paper)"
                stroke="var(--color-ink)"
                strokeWidth={2.4}
              />
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <p className="text-[11px] leading-snug text-slate">
          Every corridor town, west to east.
        </p>
        <span className="flex shrink-0 items-center gap-1 text-[10px] font-bold tracking-[0.08em] text-highway uppercase group-hover:text-amber-dark">
          Open map <Arrow className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}
