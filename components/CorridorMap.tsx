import type { RoadConditionEvent } from "@/lib/road-conditions";
import {
  CORRIDOR_MAX_MILE,
  CORRIDOR_MIN_MILE,
  CORRIDOR_TOWNS,
  HORIZONTAL_MAP,
  VERTICAL_MAP,
  type CorridorMapModel,
} from "@/lib/corridor-map";

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
      Math.min(CORRIDOR_MAX_MILE, Math.max(CORRIDOR_MIN_MILE, mile)),
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

function MapCanvas({
  map,
  plotted,
}: {
  map: CorridorMapModel;
  plotted: PlottedGroup[];
}) {
  const isVertical = map.orientation === "vertical";
  const titleId = `corridor-map-title-${map.orientation}`;
  const descId = `corridor-map-desc-${map.orientation}`;

  return (
    <svg
      viewBox={`0 0 ${map.viewW} ${map.viewH}`}
      role="group"
      aria-labelledby={`${titleId} ${descId}`}
      className="h-auto w-full"
    >
      <title id={titleId}>I-80 across Nebraska, Kimball to Omaha</title>
      <desc id={descId}>
        Schematic state map showing I-80 from the Wyoming line to the Missouri
        River, with corridor towns placed at their geographic coordinates and
        active 511 events placed along the highway by mile marker.
      </desc>

      {/* Neighboring states, the state itself and reference details. */}
      <g aria-hidden="true">
        {map.neighbors.map((label) => (
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
            fontSize={isVertical ? 11 : 10}
            fontWeight={700}
            letterSpacing={1.6}
            opacity={0.65}
          >
            {label.text}
          </text>
        ))}

        <path
          d={map.stateD}
          fill="var(--color-cream)"
          stroke="var(--color-line)"
          strokeWidth={1.6}
          strokeLinejoin="round"
        />

        {map.stateLabel ? (
          <text
            x={map.stateLabel.x}
            y={map.stateLabel.y}
            transform={
              map.stateLabel.rotate
                ? `rotate(${map.stateLabel.rotate} ${map.stateLabel.x} ${map.stateLabel.y})`
                : undefined
            }
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
        ) : null}

        {/* The Platte, the river the interstate follows. */}
        <path
          d={map.riverD}
          fill="none"
          stroke="var(--color-slate)"
          strokeWidth={1.4}
          strokeLinecap="round"
          opacity={0.38}
        />
        {map.plattLabel ? (
          <text
            x={map.plattLabel.x}
            y={map.plattLabel.y}
            textAnchor="middle"
            fill="var(--color-slate)"
            fontFamily="var(--font-serif)"
            fontSize={10.5}
            fontStyle="italic"
            opacity={0.7}
          >
            Platte River
          </text>
        ) : null}

        {/* North arrow. */}
        <g opacity={0.55}>
          {map.north.direction === "up" ? (
            <>
              <line
                x1={map.north.x}
                y1={map.north.y}
                x2={map.north.x}
                y2={map.north.y - 22}
                stroke="var(--color-ink)"
                strokeWidth={1.4}
              />
              <path
                d={`M ${map.north.x - 6} ${map.north.y - 16} L ${map.north.x} ${map.north.y - 26} L ${map.north.x + 6} ${map.north.y - 16} Z`}
                fill="var(--color-ink)"
              />
            </>
          ) : (
            <>
              <line
                x1={map.north.x}
                y1={map.north.y}
                x2={map.north.x + 18}
                y2={map.north.y}
                stroke="var(--color-ink)"
                strokeWidth={1.4}
              />
              <path
                d={`M ${map.north.x + 12} ${map.north.y - 6} L ${map.north.x + 22} ${map.north.y} L ${map.north.x + 12} ${map.north.y + 6} Z`}
                fill="var(--color-ink)"
              />
            </>
          )}
          <text
            x={map.north.labelX}
            y={map.north.labelY}
            textAnchor="middle"
            fill="var(--color-ink)"
            fontFamily="var(--font-sans)"
            fontSize={isVertical ? 11 : 10}
            fontWeight={700}
          >
            N
          </text>
        </g>

        {/* Scale bar. */}
        <g opacity={0.55}>
          <line
            x1={map.scale.x}
            y1={map.scale.y}
            x2={map.scale.x + map.scale.width}
            y2={map.scale.y}
            stroke="var(--color-ink)"
            strokeWidth={1.4}
          />
          <line
            x1={map.scale.x}
            y1={map.scale.y - 4}
            x2={map.scale.x}
            y2={map.scale.y + 4}
            stroke="var(--color-ink)"
            strokeWidth={1.4}
          />
          <line
            x1={map.scale.x + map.scale.width}
            y1={map.scale.y - 4}
            x2={map.scale.x + map.scale.width}
            y2={map.scale.y + 4}
            stroke="var(--color-ink)"
            strokeWidth={1.4}
          />
          <text
            x={map.scale.x + map.scale.width / 2}
            y={map.scale.y - 8}
            textAnchor="middle"
            fill="var(--color-ink)"
            fontFamily="var(--font-sans)"
            fontSize={isVertical ? 11 : 9.5}
            fontWeight={700}
            letterSpacing={0.5}
          >
            {map.scale.miles} mi
          </text>
        </g>
      </g>

      {/* I-80: casing, asphalt, center line. */}
      <g aria-hidden="true">
        <path
          d={map.routeD}
          fill="none"
          stroke="var(--color-paper)"
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={map.routeD}
          fill="none"
          stroke="var(--color-highway)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={map.routeD}
          fill="none"
          stroke="var(--color-paper)"
          strokeWidth={1.2}
          strokeDasharray="7 7"
          strokeLinecap="round"
          opacity={0.75}
        />
      </g>

      {map.shield ? (
        <g aria-hidden="true" transform={`translate(${map.shield.x} ${map.shield.y})`}>
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
      ) : null}

      {/* Event markers. The rotated map keeps them left of the road so they
          never collide with the town labels on the right. */}
      {plotted.map((group, index) => {
        const position = map.pointAtMile(group.mile);
        const offset = isVertical ? 15 : index % 2 === 0 ? 15 : -15;
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
      {CORRIDOR_TOWNS.map((town) => {
        const dot = map.project(town.lon, town.lat);
        const road = map.pointAtMile(town.mile);
        const leaderLength = Math.hypot(dot.x - road.x, dot.y - road.y);
        const shift = town.labelShift ?? 0;
        const label = isVertical
          ? {
              x: dot.x + 11,
              nameY: dot.y,
              mileY: dot.y + 14,
              anchor: "start" as const,
            }
          : {
              x: dot.x,
              nameY:
                dot.y + (town.label === "above" ? -22 : 16) + shift,
              mileY:
                dot.y + (town.label === "above" ? -10 : 28) + shift,
              anchor: "middle" as const,
            };
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
              x={label.x}
              y={label.nameY}
              textAnchor={label.anchor}
              fill="var(--color-ink)"
              fontFamily="var(--font-serif)"
              fontSize={
                isVertical
                  ? town.minor
                    ? 15
                    : 17
                  : town.minor
                    ? 13
                    : 15
              }
              fontWeight={600}
            >
              {town.name}
            </text>
            <text
              x={label.x}
              y={label.mileY}
              textAnchor={label.anchor}
              fill="var(--color-slate)"
              fontFamily="var(--font-sans)"
              fontSize={
                isVertical
                  ? town.minor
                    ? 9.5
                    : 11
                  : town.minor
                    ? 8.5
                    : 9.5
              }
              fontWeight={700}
              letterSpacing={0.4}
            >
              MM {town.mile}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

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

      <div className="px-3 pt-3 pb-1">
        <div className="hidden md:block">
          <MapCanvas map={HORIZONTAL_MAP} plotted={plotted} />
        </div>
        <div className="md:hidden">
          <MapCanvas map={VERTICAL_MAP} plotted={plotted} />
        </div>
      </div>

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
