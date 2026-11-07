import Link from "next/link";
import type { CorridorAlert } from "@/lib/nws";
import { formatDateTime } from "@/lib/utils";
import { Arrow } from "@/components/Icon";
import { TrackedLink } from "@/components/TrackedLink";

const quickLinks = [
  {
    label: "Nebraska 511",
    detail: "Live closures, cameras & plows",
    href: "https://511.nebraska.gov/",
  },
  {
    label: "NWS alerts",
    detail: "Warnings for corridor counties",
    href: "https://www.weather.gov/",
  },
  {
    label: "State Patrol news",
    detail: "Crashes, pursuits, arrests",
    href: "https://statepatrol.nebraska.gov/divisions/office-superintendent/news",
  },
  {
    label: "NDOT news",
    detail: "Construction & project notices",
    href: "https://dot.nebraska.gov/news-events/news-releases/",
  },
];

export function CorridorPanel({ alerts }: { alerts: CorridorAlert[] }) {
  return (
    <div className="border border-line bg-paper">
      <div className="flex items-center justify-between border-b border-line bg-ink px-4 py-2.5 text-paper">
        <h2 className="kicker text-amber">Corridor status</h2>
        <span className="flex items-center gap-1.5 text-[9px] tracking-[0.12em] text-cream/70 uppercase">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              alerts.length ? "bg-amber" : "bg-emerald-400"
            }`}
          />
          {alerts.length ? `${alerts.length} active alert${alerts.length > 1 ? "s" : ""}` : "No alerts"}
        </span>
      </div>

      <div className="p-4">
        {alerts.length ? (
          <ul className="space-y-3">
            {alerts.map((alert) => (
              <li key={alert.id} className="border-l-2 border-alert pl-3">
                <p className="text-[10px] font-bold tracking-[0.1em] text-alert uppercase">
                  {alert.severity} · {alert.event}
                </p>
                <p className="mt-0.5 text-[13px] leading-snug font-semibold text-ink">
                  {alert.headline}
                </p>
                <p className="mt-1 text-[11px] text-slate">
                  {alert.areaDesc}
                  {alert.ends ? ` · until ${formatDateTime(alert.ends)}` : ""}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] leading-relaxed text-slate">
            No active National Weather Service alerts for the corridor towns
            right now. Always check conditions before you drive.
          </p>
        )}

        <div className="mt-4 border-t border-line pt-3">
          <h3 className="kicker mb-2 text-slate">Before you drive</h3>
          <ul className="space-y-1.5">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <TrackedLink
                  href={link.href}
                  external
                  event="outbound"
                  eventData={{ destination: link.label }}
                  className="group flex min-h-11 items-center justify-between gap-2 text-[13px] text-ink-soft hover:text-ink"
                >
                  <span>
                    <span className="font-semibold">{link.label}</span>
                    <span className="block text-[10px] text-slate">{link.detail}</span>
                  </span>
                  <Arrow className="h-3.5 w-3.5 shrink-0 text-slate transition group-hover:translate-x-0.5 group-hover:text-amber-dark" />
                </TrackedLink>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/conditions"
          className="mt-4 flex min-h-11 items-center justify-center bg-ink px-3 py-2 text-center text-[10px] font-bold tracking-[0.1em] text-paper uppercase transition hover:bg-highway"
        >
          I-80 conditions &amp; closures
        </Link>
        <Link
          href="/sources"
          className="mt-2 flex min-h-11 items-center justify-center border border-ink px-3 py-2 text-center text-[10px] font-bold tracking-[0.1em] text-ink uppercase transition hover:bg-ink hover:text-paper"
        >
          Full source directory
        </Link>
      </div>
    </div>
  );
}

const CITY_RAIL = [
  ["omaha", "Omaha", "454"],
  ["lincoln", "Lincoln", "399"],
  ["seward", "Seward", "379"],
  ["york", "York", "353"],
  ["grand-island", "Grand Island", "312"],
  ["kearney", "Kearney", "272"],
  ["lexington", "Lexington", "237"],
  ["north-platte", "North Platte", "177"],
  ["ogallala", "Ogallala", "126"],
  ["sidney", "Sidney", "59"],
  ["kimball", "Kimball", "22"],
] as const;

function TownChip({ slug, name, mm }: { slug: string; name: string; mm: string }) {
  return (
    <Link
      href={`/cities/${slug}`}
      className="group flex min-h-11 items-center gap-2 border border-line bg-paper px-2.5 py-1.5 transition hover:border-ink hover:bg-cream sm:px-3 sm:py-2"
    >
      <span className="font-serif text-sm font-semibold text-ink group-hover:underline group-hover:decoration-amber">
        {name}
      </span>
      <span className="text-[9px] font-bold tracking-wider text-slate">
        MM {mm}
      </span>
    </Link>
  );
}

function TownChips() {
  return (
    <>
      {CITY_RAIL.map(([slug, name, mm]) => (
        <TownChip key={slug} slug={slug} name={name} mm={mm} />
      ))}
      <Link
        href="/cities"
        className="flex min-h-11 items-center gap-1 border border-dashed border-line px-2.5 py-1.5 text-[10px] font-bold tracking-[0.06em] text-highway uppercase transition hover:border-ink hover:bg-cream sm:px-3 sm:py-2"
      >
        All towns →
      </Link>
    </>
  );
}

export function CityRail() {
  return (
    <div className="-mx-1 px-1 py-1">
      {/* On phones the full town list would be five rows tall, so keep it
          behind a disclosure. The desktop rail simply wraps. */}
      <details className="group md:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between border border-line bg-paper px-3 py-2 text-[10px] font-bold tracking-[0.08em] text-ink uppercase [&::-webkit-details-marker]:hidden">
          Jump to a corridor town
          <span className="text-slate transition group-open:rotate-180">
            ▾
          </span>
        </summary>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <TownChips />
        </div>
      </details>
      <div className="hidden flex-wrap gap-2 md:flex">
        <TownChips />
      </div>
    </div>
  );
}
