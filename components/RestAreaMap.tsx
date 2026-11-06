import {
  CORRIDOR_TOWNS,
  HORIZONTAL_MAP,
  type CorridorMapModel,
} from "@/lib/corridor-map";

export type RestAreaMapPoint = {
  id: string;
  name: string;
  milepost: number | null;
  nearestExit: number;
  truckOnly: boolean;
};

function MapCanvas({
  map,
  areas,
  markerRadius,
  townLabels = false,
  label = "I-80 public stops",
}: {
  map: CorridorMapModel;
  areas: RestAreaMapPoint[];
  markerRadius: number;
  townLabels?: boolean;
  label?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${map.viewW} ${map.viewH}`}
      role="img"
      aria-label={`Schematic map of ${label} from Kimball to Omaha`}
      className="h-auto w-full"
    >
      <title>{label} from Kimball to Omaha</title>
      <desc>
        Schematic Nebraska map with I-80 and a dot for each public stop.
        Positions are based on mile markers and are approximate.
      </desc>

      <path
        d={map.stateD}
        fill="var(--color-cream)"
        stroke="var(--color-line)"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path
        d={map.riverD}
        fill="none"
        stroke="var(--color-slate)"
        strokeWidth={1.3}
        strokeLinecap="round"
        opacity={0.3}
      />
      <path
        d={map.routeD}
        fill="none"
        stroke="var(--color-highway)"
        strokeWidth={map.orientation === "vertical" ? 8 : 7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {townLabels
        ? CORRIDOR_TOWNS.map((town) => {
            const point = map.pointAtMile(town.mile);
            return (
              <text
                key={town.name}
                x={point.x}
                y={point.y + (town.label === "above" ? -13 : 24)}
                textAnchor="middle"
                fill="var(--color-slate)"
                fontSize={10}
                fontWeight={700}
                letterSpacing={0.2}
              >
                {town.name}
              </text>
            );
          })
        : null}

      {areas.map((area) => {
        const mile = area.milepost ?? area.nearestExit;
        const point = map.pointAtMile(mile);
        return (
          <g key={area.id}>
            <circle
              cx={point.x}
              cy={point.y}
              r={markerRadius}
              fill={
                area.truckOnly
                  ? "var(--color-amber-dark)"
                  : "var(--color-paper)"
              }
              stroke={
                area.truckOnly
                  ? "var(--color-paper)"
                  : "var(--color-highway)"
              }
              strokeWidth={2}
            >
              <title>
                {area.name} — mile {mile}
              </title>
            </circle>
          </g>
        );
      })}
    </svg>
  );
}

export function RestAreaMap({
  areas,
  variant = "rest",
}: {
  areas: RestAreaMapPoint[];
  variant?: "rest" | "truck";
}) {
  const isTruck = variant === "truck";
  return (
    <section
      aria-label={isTruck ? "Map of public truck parking on I-80" : "Map of I-80 rest areas"}
      className="border border-line bg-paper"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-4 py-3">
        <div>
          <p className="kicker text-amber-dark">
            {isTruck ? "Find parking" : "Find a stop"}
          </p>
          <h2 className="mt-1 font-serif text-xl font-semibold">
            {areas.length}{" "}
            {isTruck ? "public truck-parking sites" : "public stops"}, west to
            east
          </h2>
        </div>
        <p className="text-[10px] font-bold tracking-[0.1em] text-slate uppercase">
          MM 22 → 454
        </p>
      </div>

      <div className="px-3 pt-3 pb-1">
        <div className="hidden md:block">
          <MapCanvas
            map={HORIZONTAL_MAP}
            areas={areas}
            markerRadius={6}
            townLabels
            label={isTruck ? "public truck parking" : "public stops"}
          />
        </div>
        <div className="md:hidden">
          <MapCanvas
            map={HORIZONTAL_MAP}
            areas={areas}
            markerRadius={9}
            label={isTruck ? "public truck parking" : "public stops"}
          />
        </div>
      </div>

      <div className="border-t border-line px-4 py-3">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold tracking-[0.06em] text-slate uppercase">
          <li className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-full bg-highway" />
            {isTruck ? "Open public lot" : "Full-service rest area"}
          </li>
          {!isTruck ? (
            <li className="flex items-center gap-1.5">
              <span className="inline-block size-2.5 rounded-full bg-amber-dark" />
              Truck-only lot
            </li>
          ) : null}
        </ul>
        <p className="mt-2 text-[11px] leading-relaxed text-slate">
          Approximate positions by mile marker on a schematic corridor map, not
          a live navigation map. Eastbound and westbound sites are separate
          stops. Where the guide has no milepost, the nearest exit is used.
          Check Nebraska 511 for closures before you rely on a{" "}
          {isTruck ? "parking spot" : "stop"}.
        </p>
      </div>
    </section>
  );
}
