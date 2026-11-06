import type { RoadConditionEvent } from "@/lib/road-conditions";
import {
  I80_PATH,
  NEBRASKA_OUTLINE,
  PLATTE_RIVER,
} from "@/data/nebraska-geography";

const MIN_MILE = 22;
const MAX_MILE = 454;

/* ── Projection ──────────────────────────────────────────────────────
   A small equirectangular projection with longitude squeezed by the
   cosine of the state's mid-latitude. Without that squeeze Nebraska looks
   about 30% too wide; with it the outline keeps its real proportions. */
const VIEW_W = 1000;
const VIEW_H = 470;
const PAD = 30;
const LON_MIN = -104.053;
const LON_MAX = -95.308;
const LAT_MIN = 39.99;
const LAT_MAX = 43.01;
const MID_LAT = (LAT_MIN + LAT_MAX) / 2;
const LON_SCALE = Math.cos((MID_LAT * Math.PI) / 180);
const SPAN_X = (LON_MAX - LON_MIN) * LON_SCALE;
const SPAN_Y = LAT_MAX - LAT_MIN;
const MAP_SCALE = Math.min(
  (VIEW_W - PAD * 2) / SPAN_X,
  (VIEW_H - PAD * 2) / SPAN_Y,
);
const OFFSET_X = (VIEW_W - SPAN_X * MAP_SCALE) / 2;
const OFFSET_Y = (VIEW_H - SPAN_Y * MAP_SCALE) / 2;

type Point = { x: number; y: number };

function project(lon: number, lat: number): Point {
  return {
    x: OFFSET_X + (lon - LON_MIN) * LON_SCALE * MAP_SCALE,
    y: OFFSET_Y + (LAT_MAX - lat) * MAP_SCALE,
  };
}

function polylinePath(points: Point[], close = false): string {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  const body = rest
    .map((point) => `L ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" ");
  return `M ${first.x.toFixed(1)} ${first.y.toFixed(1)} ${body}${close ? " Z" : ""}`;
}

type Segment<T extends Point> = { p0: T; c1: Point; c2: Point; p1: T };

/**
 * Catmull–Rom through the supplied points, emitted as cubic Béziers. The
 * segment list is kept so events can be interpolated on the same curve that
 * is drawn, rather than on the straight line between anchors.
 */
function smoothPath<T extends Point>(points: T[]): {
  d: string;
  segments: Segment<T>[];
} {
  if (points.length === 0) return { d: "", segments: [] };
  const segments: Segment<T>[] = [];
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? points[i + 1];
    const c1 = {
      x: p1.x + (p2.x - p0.x) / 6,
      y: p1.y + (p2.y - p0.y) / 6,
    };
    const c2 = {
      x: p2.x - (p3.x - p1.x) / 6,
      y: p2.y - (p3.y - p1.y) / 6,
    };
    d += ` C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    segments.push({ p0: p1, c1, c2, p1: p2 });
  }
  return { d, segments };
}

const STATE_POINTS = NEBRASKA_OUTLINE.map(([lon, lat]) => project(lon, lat));
const STATE_D = polylinePath(STATE_POINTS, true);
const RIVER_D = smoothPath(
  PLATTE_RIVER.map(([lon, lat]) => project(lon, lat)),
).d;
const ROUTE_POINTS = I80_PATH.map((anchor) => ({
  ...project(anchor.lon, anchor.lat),
  mile: anchor.mile,
}));
const ROUTE = smoothPath(ROUTE_POINTS);

type RoutePosition = Point & { nx: number; ny: number };

/** Position and unit normal at a Nebraska mile marker on the drawn curve. */
function pointAtMile(mile: number): RoutePosition {
  const clamped = Math.max(
    ROUTE_POINTS[0].mile,
    Math.min(ROUTE_POINTS[ROUTE_POINTS.length - 1].mile, mile),
  );
  const segment =
    ROUTE.segments.find((candidate) => clamped <= candidate.p1.mile) ??
    ROUTE.segments[ROUTE.segments.length - 1];
  const span = segment.p1.mile - segment.p0.mile || 1;
  const t = Math.max(0, Math.min(1, (clamped - segment.p0.mile) / span));
  const mt = 1 - t;

  const x =
    mt ** 3 * segment.p0.x +
    3 * mt ** 2 * t * segment.c1.x +
    3 * mt * t ** 2 * segment.c2.x +
    t ** 3 * segment.p1.x;
  const y =
    mt ** 3 * segment.p0.y +
    3 * mt ** 2 * t * segment.c1.y +
    3 * mt * t ** 2 * segment.c2.y +
    t ** 3 * segment.p1.y;

  const dx =
    3 * mt ** 2 * (segment.c1.x - segment.p0.x) +
    6 * mt * t * (segment.c2.x - segment.c1.x) +
    3 * t ** 2 * (segment.p1.x - segment.c2.x);
  const dy =
    3 * mt ** 2 * (segment.c1.y - segment.p0.y) +
    6 * mt * t * (segment.c2.y - segment.c1.y) +
    3 * t ** 2 * (segment.p1.y - segment.c2.y);
  const length = Math.hypot(dx, dy) || 1;

  return { x, y, nx: -dy / length, ny: dx / length };
}

/* ── Towns ──────────────────────────────────────────────────────────── */

type CorridorTown = {
  name: string;
  mile: number;
  lon: number;
  lat: number;
  /** Which side of the town dot the label sits on. */
  label: "above" | "below";
  /** Extra vertical separation for labels that sit near an event marker. */
  labelShift?: number;
  minor?: boolean;
};

// Coordinates are town centers from data/places.ts. I-80 is drawn from its
// own alignment, and a leader line connects any town that sits off the road.
const TOWNS: CorridorTown[] = [
  { name: "Kimball", mile: 22, lon: -103.663, lat: 41.2358, label: "above" },
  { name: "Sidney", mile: 59, lon: -102.9777, lat: 41.1428, label: "above" },
  { name: "Ogallala", mile: 126, lon: -101.7199, lat: 41.1281, label: "above" },
  {
    name: "North Platte",
    mile: 183,
    lon: -100.7654,
    lat: 41.1239,
    label: "above",
  },
  {
    name: "Lexington",
    mile: 237,
    lon: -99.7415,
    lat: 40.7808,
    label: "below",
    minor: true,
  },
  { name: "Kearney", mile: 275, lon: -99.0817, lat: 40.6995, label: "above" },
  {
    name: "Grand Island",
    mile: 312,
    lon: -98.342,
    lat: 40.9247,
    label: "above",
  },
  {
    name: "York",
    mile: 348,
    lon: -97.592,
    lat: 40.8681,
    label: "below",
    labelShift: 8,
  },
  {
    name: "Seward",
    mile: 379,
    lon: -97.0986,
    lat: 40.9072,
    label: "above",
    minor: true,
  },
  { name: "Lincoln", mile: 398, lon: -96.7026, lat: 40.8136, label: "below" },
  { name: "Omaha", mile: 446, lon: -95.9345, lat: 41.2565, label: "above" },
];

/* ── Events ─────────────────────────────────────────────────────────── */

const DOT: Record<string, { fill: string; className: string }> = {
  closure: { fill: "var(--color-alert)", className: "bg-alert" },
  incident: { fill: "var(--color-amber)", className: "bg-amber" },
  construction: {
    fill: "var(--color-amber-dark)",
    className: "bg-amber-dark",
  },
  conditions: { fill: "var(--color-highway)", className: "bg-highway" },
  other: { fill: "var(--color-slate)", className: "bg-slate" },
};

const LABEL: Record<string, string> = {
  closure: "Closure",
  incident: "Incident",
  construction: "Construction",
  conditions: "Conditions",
  other: "Notice",
};

type PlottedGroup = {
  mile: number;
  events: RoadConditionEvent[];
};

/**
 * Map events to mile positions. Events without a finite mile marker are
 * counted as unmapped (they still appear in the list below the map).
 * Events are grouped by whole mile: at statewide scale two reports a few
 * tenths of a mile apart are the same dot on the road, so merging them
 * avoids overlapping markers and a misleading cluster of pins.
 */
function plotEvents(events: RoadConditionEvent[]): {
  plotted: PlottedGroup[];
  unmapped: number;
} {
  const byMile = new Map<string, PlottedGroup>();
  let unmapped = 0;
  for (const event of events.slice(0, 12)) {
    const mile = Number(event.location?.primaryLinearReference);
    if (!Number.isFinite(mile)) {
      unmapped += 1;
      continue;
    }
    const mileGroup = Math.round(
      Math.min(MAX_MILE, Math.max(MIN_MILE, mile)),
    );
    const key = String(mileGroup);
    const existing = byMile.get(key);
    if (existing) {
      existing.events.push(event);
    } else {
      byMile.set(key, { mile: mileGroup, events: [event] });
    }
  }
  return {
    plotted: [...byMile.values()].sort((a, b) => a.mile - b.mile),
    unmapped,
  };
}

function describeGroup(group: PlottedGroup): string {
  const mile = `Mile ${group.mile}`;
  if (group.events.length > 1) {
    return `${group.events.length} unofficial 511 events near ${mile}: ${group.events
      .map((event) => event.title)
      .join("; ")}`;
  }
  const event = group.events[0];
  return `${LABEL[event.category] ?? "Notice"} near ${mile}: ${event.title} (unofficial 511 event)`;
}

/* ── Map labels and decoration ──────────────────────────────────────── */

function neighbor(
  text: string,
  lon: number,
  lat: number,
  rotate = 0,
): { text: string; x: number; y: number; rotate: number } {
  const { x, y } = project(lon, lat);
  return { text, x, y, rotate };
}

const NEIGHBORS = [
  neighbor("WYOMING", -104.2, 41.75, -90),
  neighbor("SOUTH DAKOTA", -98.6, 43.12),
  neighbor("IOWA", -95.16, 41.45),
  neighbor("COLORADO", -103.1, 39.9),
  neighbor("KANSAS", -99.6, 39.9),
];

const PLATTE_LABEL = project(-97.85, 41.17);
const STATE_LABEL = project(-99.05, 42.6);
const SCALE = project(-102.85, 40.22);
const SCALE_MILES = 50;
const SCALE_WIDTH = (SCALE_MILES / 69.17) * MAP_SCALE;

export function CorridorMap({ events }: { events: RoadConditionEvent[] }) {
  const { plotted, unmapped } = plotEvents(events);

  return (
    <section
      aria-label="Schematic map of I-80 across Nebraska with unofficial 511 events"
      className="border border-line bg-paper"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-4 py-3">
        <h2 className="font-serif text-lg font-semibold">Corridor map</h2>
        <p className="text-[10px] font-bold tracking-[0.1em] text-slate uppercase">
          Kimball · MM 22 → Omaha · MM 454
        </p>
      </div>

      <div className="overflow-x-auto px-3 pt-3 pb-1">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          role="group"
          aria-labelledby="corridor-map-title corridor-map-desc"
          className="h-auto w-full min-w-[680px]"
        >
          <title id="corridor-map-title">
            I-80 across Nebraska, Kimball to Omaha
          </title>
          <desc id="corridor-map-desc">
            Schematic state map showing I-80 from the Wyoming line to the
            Missouri River, with corridor towns placed at their geographic
            coordinates and active 511 events placed along the highway by mile
            marker.
          </desc>

          {/* Neighboring states and the state itself. */}
          <g aria-hidden="true">
            {NEIGHBORS.map((label) => (
              <text
                key={label.text}
                x={label.x}
                y={label.y}
                transform={
                  label.rotate
                    ? `rotate(${label.rotate} ${label.x} ${label.y})`
                    : undefined
                }
                textAnchor="middle"
                fill="var(--color-slate)"
                fontFamily="var(--font-sans)"
                fontSize={10}
                fontWeight={700}
                letterSpacing={1.6}
                opacity={0.65}
              >
                {label.text}
              </text>
            ))}

            <path
              d={STATE_D}
              fill="var(--color-cream)"
              stroke="var(--color-line)"
              strokeWidth={1.6}
              strokeLinejoin="round"
            />

            <text
              x={STATE_LABEL.x}
              y={STATE_LABEL.y}
              textAnchor="middle"
              fill="var(--color-ink)"
              fontFamily="var(--font-serif)"
              fontSize={30}
              fontWeight={600}
              letterSpacing={9}
              opacity={0.14}
            >
              NEBRASKA
            </text>

            {/* The Platte, the river the interstate follows. */}
            <path
              d={RIVER_D}
              fill="none"
              stroke="var(--color-slate)"
              strokeWidth={1.4}
              strokeLinecap="round"
              opacity={0.38}
            />
            <text
              x={PLATTE_LABEL.x}
              y={PLATTE_LABEL.y}
              textAnchor="middle"
              fill="var(--color-slate)"
              fontFamily="var(--font-serif)"
              fontSize={10.5}
              fontStyle="italic"
              opacity={0.7}
            >
              Platte River
            </text>

            {/* North arrow. */}
            <g opacity={0.55}>
              <line
                x1={112}
                y1={104}
                x2={112}
                y2={82}
                stroke="var(--color-ink)"
                strokeWidth={1.4}
              />
              <path
                d="M 106 88 L 112 78 L 118 88 Z"
                fill="var(--color-ink)"
              />
              <text
                x={112}
                y={72}
                textAnchor="middle"
                fill="var(--color-ink)"
                fontFamily="var(--font-sans)"
                fontSize={10}
                fontWeight={700}
              >
                N
              </text>
            </g>

            {/* Scale bar in the empty Colorado margin. */}
            <g opacity={0.55}>
              <line
                x1={SCALE.x}
                y1={SCALE.y}
                x2={SCALE.x + SCALE_WIDTH}
                y2={SCALE.y}
                stroke="var(--color-ink)"
                strokeWidth={1.4}
              />
              <line
                x1={SCALE.x}
                y1={SCALE.y - 4}
                x2={SCALE.x}
                y2={SCALE.y + 4}
                stroke="var(--color-ink)"
                strokeWidth={1.4}
              />
              <line
                x1={SCALE.x + SCALE_WIDTH}
                y1={SCALE.y - 4}
                x2={SCALE.x + SCALE_WIDTH}
                y2={SCALE.y + 4}
                stroke="var(--color-ink)"
                strokeWidth={1.4}
              />
              <text
                x={SCALE.x + SCALE_WIDTH / 2}
                y={SCALE.y - 8}
                textAnchor="middle"
                fill="var(--color-ink)"
                fontFamily="var(--font-sans)"
                fontSize={9.5}
                fontWeight={700}
                letterSpacing={0.5}
              >
                {SCALE_MILES} mi
              </text>
            </g>
          </g>

          {/* I-80: casing, asphalt, center line. */}
          <g aria-hidden="true">
            <path
              d={ROUTE.d}
              fill="none"
              stroke="var(--color-paper)"
              strokeWidth={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={ROUTE.d}
              fill="none"
              stroke="var(--color-highway)"
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={ROUTE.d}
              fill="none"
              stroke="var(--color-paper)"
              strokeWidth={1.2}
              strokeDasharray="7 7"
              strokeLinecap="round"
              opacity={0.75}
            />
          </g>

          {/* Interstate shield, placed in the open space west of Ogallala. */}
          <g aria-hidden="true" transform="translate(202 305)">
            <path
              d="M 0 4 Q 0 0 4 0 L 44 0 Q 48 0 48 4 L 48 26 Q 48 30 44 30 L 4 30 Q 0 30 0 26 Z"
              fill="var(--color-highway)"
              stroke="var(--color-paper)"
              strokeWidth={2}
            />
            <text
              x={24}
              y={21}
              textAnchor="middle"
              fill="var(--color-paper)"
              fontFamily="var(--font-sans)"
              fontSize={15}
              fontWeight={700}
              letterSpacing={0.4}
            >
              I-80
            </text>
          </g>

          {/* Event markers, offset alternately above and below the road. */}
          {plotted.map((group, index) => {
            const position = pointAtMile(group.mile);
            const offset = index % 2 === 0 ? 15 : -15;
            const cx = position.x + position.nx * offset;
            const cy = position.y + position.ny * offset;
            const radius = group.events.length > 1 ? 7.5 : 6.5;
            const first = group.events[0];
            return (
              <a
                key={`${group.mile}-${first.id}`}
                href={first.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={describeGroup(group)}
                className="cursor-pointer"
              >
                <title>{describeGroup(group)}</title>
                <line
                  x1={position.x}
                  y1={position.y}
                  x2={cx}
                  y2={cy}
                  stroke="var(--color-ink)"
                  strokeWidth={1.2}
                  opacity={0.5}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={radius + 1.5}
                  fill="var(--color-paper)"
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill={(DOT[first.category] ?? DOT.other).fill}
                  stroke="var(--color-ink)"
                  strokeWidth={1.1}
                />
                {group.events.length > 1 ? (
                  <text
                    x={cx}
                    y={cy + 3}
                    textAnchor="middle"
                    fill={
                      first.category === "incident"
                        ? "var(--color-ink)"
                        : "var(--color-paper)"
                    }
                    fontFamily="var(--font-sans)"
                    fontSize={8.5}
                    fontWeight={700}
                  >
                    {group.events.length}
                  </text>
                ) : null}
              </a>
            );
          })}

          {/* Towns: dot at the real coordinates, leader to the highway. */}
          {TOWNS.map((town) => {
            const dot = project(town.lon, town.lat);
            const road = pointAtMile(town.mile);
            const leaderLength = Math.hypot(dot.x - road.x, dot.y - road.y);
            const shift = town.labelShift ?? 0;
            const nameY = (town.label === "above" ? -22 : 16) + shift;
            const mileY = (town.label === "above" ? -10 : 28) + shift;
            return (
              <g key={town.name}>
                {leaderLength > 4 ? (
                  <line
                    x1={road.x}
                    y1={road.y}
                    x2={dot.x}
                    y2={dot.y}
                    stroke="var(--color-ink)"
                    strokeWidth={1}
                    opacity={0.4}
                  />
                ) : null}
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={3.2}
                  fill="var(--color-paper)"
                  stroke="var(--color-ink)"
                  strokeWidth={1.6}
                />
                <text
                  x={dot.x}
                  y={dot.y + nameY}
                  textAnchor="middle"
                  fill="var(--color-ink)"
                  fontFamily="var(--font-serif)"
                  fontSize={town.minor ? 13 : 15}
                  fontWeight={600}
                >
                  {town.name}
                </text>
                <text
                  x={dot.x}
                  y={dot.y + mileY}
                  textAnchor="middle"
                  fill="var(--color-slate)"
                  fontFamily="var(--font-sans)"
                  fontSize={town.minor ? 8.5 : 9.5}
                  fontWeight={700}
                  letterSpacing={0.4}
                >
                  MM {town.mile}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="px-4 pt-1 pb-2 text-[10px] text-slate md:hidden">
        Scroll sideways to see the whole state.
      </p>

      <div className="border-t border-line px-4 py-3">
        <ul aria-label="Event colors" className="flex flex-wrap gap-x-4 gap-y-1">
          {Object.keys(LABEL).map((category) => (
            <li
              key={category}
              className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.06em] text-slate uppercase"
            >
              <span
                aria-hidden="true"
                className={`inline-block size-2.5 rounded-full ${
                  (DOT[category] ?? DOT.other).className
                }`}
              />
              {LABEL[category]}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] leading-relaxed text-slate">
          Unofficial 511 events placed by mile marker on a schematic map of
          Nebraska — not a live navigation map. Positions are approximate;
          verify with Nebraska 511 before you drive.
          {plotted.length === 0 && unmapped === 0
            ? " No 511 events with a mile marker right now — the map shows the corridor and towns for reference."
            : ""}
          {unmapped > 0
            ? ` ${unmapped} ${
                unmapped === 1 ? "event" : "events"
              } without a mile marker ${unmapped === 1 ? "is" : "are"} listed below, not mapped.`
            : ""}
        </p>
      </div>
    </section>
  );
}
