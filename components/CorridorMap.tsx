import type { RoadConditionEvent } from "@/lib/road-conditions";

const MIN_MILE = 22;
const MAX_MILE = 454;

type CorridorTown = {
  name: string;
  mile: number;
  /** Minor stops are hidden on narrow screens to reduce label clutter. */
  minor?: boolean;
};

// Representative mile markers, ordered west → east. Hastings is off the
// interstate (US-281 south of Exit 312), so it is intentionally excluded.
const TOWNS: CorridorTown[] = [
  { name: "Kimball", mile: 24 },
  { name: "Sidney", mile: 60 },
  { name: "Ogallala", mile: 130 },
  { name: "North Platte", mile: 183 },
  { name: "Lexington", mile: 242, minor: true },
  { name: "Kearney", mile: 276 },
  { name: "Grand Island", mile: 312 },
  { name: "York", mile: 350 },
  { name: "Seward", mile: 380, minor: true },
  { name: "Lincoln", mile: 398 },
  { name: "Omaha", mile: 446 },
];

const DOT: Record<string, string> = {
  closure: "bg-alert",
  incident: "bg-amber",
  construction: "bg-amber-dark",
  conditions: "bg-highway",
  other: "bg-slate",
};

const LABEL: Record<string, string> = {
  closure: "Closure",
  incident: "Incident",
  construction: "Construction",
  conditions: "Conditions",
  other: "Notice",
};

function percent(mile: number): number {
  const clamped = Math.min(MAX_MILE, Math.max(MIN_MILE, mile));
  return ((clamped - MIN_MILE) / (MAX_MILE - MIN_MILE)) * 100;
}

type PlottedGroup = {
  mile: number;
  events: RoadConditionEvent[];
};

/**
 * Map events to mile positions. Events without a finite mile marker are
 * counted as unmapped (they still appear in the list below the map).
 * Groups are merged only when they land on exactly the same tenth-mile.
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
    const clamped = Math.min(MAX_MILE, Math.max(MIN_MILE, mile));
    const key = clamped.toFixed(1);
    const existing = byMile.get(key);
    if (existing) {
      existing.events.push(event);
    } else {
      byMile.set(key, { mile: clamped, events: [event] });
    }
  }
  return { plotted: [...byMile.values()], unmapped };
}

function describeGroup(group: PlottedGroup): string {
  const mile = `Mile ${group.mile.toFixed(1)}`;
  if (group.events.length > 1) {
    return `${group.events.length} unofficial 511 events near ${mile}: ${group.events
      .map((event) => event.title)
      .join("; ")}`;
  }
  const event = group.events[0];
  return `${LABEL[event.category] ?? "Notice"} near ${mile}: ${event.title} (unofficial 511 event)`;
}

export function CorridorMap({ events }: { events: RoadConditionEvent[] }) {
  const { plotted, unmapped } = plotEvents(events);

  return (
    <section
      aria-label="I-80 corridor map of unofficial 511 events"
      className="border border-line bg-paper"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-4 py-3">
        <h2 className="font-serif text-lg font-semibold">Corridor map</h2>
        <p className="text-[10px] font-bold tracking-[0.1em] text-slate uppercase">
          Kimball · MM 22 → Omaha · MM 454
        </p>
      </div>

      <div className="overflow-x-auto px-4 pt-2 pb-1">
        <div className="relative mx-6 h-44 min-w-[600px]">
          {/* Event lanes above the strip (staggered so neighbors don't cover). */}
          {plotted.map((group, index) => {
            const first = group.events[0];
            return (
              <a
                key={`${group.mile.toFixed(1)}-${first.id}`}
                href={first.url}
                target="_blank"
                rel="noopener noreferrer"
                title={describeGroup(group)}
                aria-label={describeGroup(group)}
                style={{ left: `${percent(group.mile)}%` }}
                className={`absolute -translate-x-1/2 ${
                  index % 2 === 0 ? "top-0" : "top-8"
                } flex size-7 items-center justify-center`}
              >
                <span
                  aria-hidden="true"
                  className={`flex size-4 items-center justify-center rounded-full border-2 border-paper shadow ${
                    DOT[first.category] ?? DOT.other
                  }`}
                >
                  {group.events.length > 1 ? (
                    <span className="text-[8px] leading-none font-bold text-paper">
                      {group.events.length}
                    </span>
                  ) : null}
                </span>
              </a>
            );
          })}

          {/* The interstate strip. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-[76px] h-1.5 rounded-full bg-ink"
          />
          <span
            aria-hidden="true"
            className="absolute top-[70px] left-0 text-[9px] font-bold tracking-widest text-slate uppercase"
          >
            ← W
          </span>
          <span
            aria-hidden="true"
            className="absolute top-[70px] right-0 text-[9px] font-bold tracking-widest text-slate uppercase"
          >
            E →
          </span>

          {/* Town ticks + labels (labels staggered over two rows). */}
          {TOWNS.map((town, index) => (
            <div
              key={town.name}
              style={{ left: `${percent(town.mile)}%` }}
              className="absolute top-[76px] w-0"
            >
              <span
                aria-hidden="true"
                className="absolute top-0 left-0 block h-3 w-0.5 -translate-x-1/2 bg-ink"
              />
              <div
                className={`absolute left-0 w-max max-w-[110px] -translate-x-1/2 text-center ${
                  town.minor
                    ? "top-4 hidden 2xl:block"
                    : index % 2 === 0
                      ? "top-4"
                      : "top-9"
                }`}
              >
                <p className="font-serif text-[11px] leading-tight font-semibold text-ink">
                  {town.name}
                </p>
                <p className="text-[9px] leading-tight text-slate">
                  MM {town.mile}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-line px-4 py-3">
        <ul
          aria-label="Event colors"
          className="flex flex-wrap gap-x-4 gap-y-1"
        >
          {Object.keys(LABEL).map((category) => (
            <li
              key={category}
              className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.06em] text-slate uppercase"
            >
              <span
                aria-hidden="true"
                className={`inline-block size-2.5 rounded-full ${DOT[category]}`}
              />
              {LABEL[category]}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] leading-relaxed text-slate">
          Unofficial 511 events, not a live navigation map.
          {plotted.length === 0 && unmapped === 0
            ? " No 511 events with a mile marker right now — the strip shows corridor towns for reference."
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
