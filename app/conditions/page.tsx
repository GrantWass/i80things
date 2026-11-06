import type { Metadata } from "next";
import Link from "next/link";
import { AutoRefresh } from "@/components/AutoRefresh";
import { CorridorMap } from "@/components/CorridorMap";
import { JsonLd } from "@/components/JsonLd";
import { TrackedLink } from "@/components/TrackedLink";
import { getCorridorAlerts } from "@/lib/nws";
import { getRoadConditions } from "@/lib/road-conditions";
import { site } from "@/lib/site";
import { formatDateTime } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "I-80 road conditions & closures in Nebraska",
  description:
    "Current I-80 closures, construction, crashes and weather alerts in Nebraska, Omaha to Kimball. Checked every five minutes against Nebraska 511.",
  alternates: { canonical: "/conditions" },
  openGraph: {
    url: `${site.url}/conditions`,
    title: "I-80 road conditions & closures in Nebraska",
    description:
      "A corridor-wide check of Nebraska 511 events and National Weather Service alerts, Omaha to Kimball.",
    images: [
      {
        url: "/api/og?title=I-80%20road%20conditions%20%26%20closures&kicker=I-80%20NEBRASKA",
        width: 1200,
        height: 675,
      },
    ],
  },
};

const CATEGORY_LABEL: Record<string, string> = {
  closure: "Closure",
  incident: "Incident",
  construction: "Construction",
  conditions: "Conditions",
  other: "Notice",
};

function formatMile(value: string | undefined): string | null {
  if (!value) return null;
  const number = Number(value);
  if (Number.isFinite(number)) return `Mile ${number.toFixed(1)}`;
  return value;
}

const CATEGORY_STYLE: Record<string, string> = {
  closure: "border-alert bg-alert/10 text-alert",
  incident: "border-amber-dark bg-amber/10 text-amber-dark",
  construction: "border-amber-dark bg-amber/10 text-amber-dark",
  conditions: "border-highway bg-highway/10 text-highway",
  other: "border-line bg-cream text-slate",
};

export default async function ConditionsPage() {
  const [roads, alerts] = await Promise.all([
    getRoadConditions(),
    getCorridorAlerts(),
  ]);

  const checked = roads.fetchedAt
    ? formatDateTime(roads.fetchedAt)
    : "Unavailable right now";

  return (
    <main>
      <AutoRefresh />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "I-80 road conditions & closures in Nebraska",
          url: `${site.url}/conditions`,
          description:
            "Current I-80 closures, construction, crashes and weather alerts in Nebraska, from Omaha to Kimball.",
          isPartOf: { "@id": `${site.url}/#website` },
          about: {
            "@type": "Place",
            name: "Interstate 80 in Nebraska",
            address: {
              "@type": "PostalAddress",
              addressRegion: "NE",
              addressCountry: "US",
            },
          },
        }}
      />

      <header className="border-b border-line bg-cream">
        <div className="container-page py-10 md:py-14">
          <p className="kicker text-amber-dark">Corridor status</p>
          <h1 className="mt-2 max-w-4xl font-serif text-4xl leading-[1.04] font-semibold tracking-tight md:text-6xl">
            I-80 road conditions &amp; closures
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate">
            A single check of Nebraska 511 events and National Weather Service
            alerts for the I-80 corridor, from Omaha to Kimball. Use this as a
            starting point, then confirm with the official map before you drive.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <TrackedLink
              href="https://511.nebraska.gov/"
              external
              event="conditions_511_click"
              eventData={{ placement: "header" }}
              className="bg-ink px-5 py-3 text-[11px] font-bold tracking-[0.1em] text-paper uppercase hover:bg-highway"
            >
              Open Nebraska 511
            </TrackedLink>
            <span className="text-[11px] text-slate">
              Checked {checked} · refreshes every 5 minutes while open
            </span>
          </div>
        </div>
      </header>

      <div className="container-page py-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0">
            <div className="grid gap-px border border-line bg-line sm:grid-cols-3">
              {[
                [roads.events.length, "I-80 events"],
                [alerts.length, "NWS alerts"],
                [roads.totalStatewideEvents, "Statewide 511"],
              ].map(([value, label]) => (
                <div key={String(label)} className="bg-paper p-4">
                  <p className="font-serif text-3xl leading-none font-semibold">
                    {value}
                  </p>
                  <p className="mt-1 text-[9px] font-bold tracking-[0.1em] text-slate uppercase">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <CorridorMap events={roads.events} />
            </div>

            <section className="mt-8">
              <div className="flex items-end justify-between gap-4 border-b-2 border-ink pb-2">
                <h2 className="font-serif text-2xl font-semibold">
                  Closures, crashes &amp; work zones
                </h2>
                <TrackedLink
                  href="https://511.nebraska.gov/"
                  external
                  event="conditions_511_click"
                  eventData={{ placement: "event_list" }}
                  className="kicker text-highway hover:text-amber-dark"
                >
                  Verify on 511
                </TrackedLink>
              </div>

              {roads.events.length ? (
                <ul className="mt-4 space-y-3">
                  {roads.events.map((event) => (
                    <li
                      key={event.id}
                      className="border border-line bg-paper p-4 md:p-5"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`border px-2 py-0.5 text-[9px] font-bold tracking-[0.1em] uppercase ${
                            CATEGORY_STYLE[event.category] ?? CATEGORY_STYLE.other
                          }`}
                        >
                          {CATEGORY_LABEL[event.category] ?? "Notice"}
                        </span>
                        {event.location?.primaryLinearReference ? (
                          <span className="text-[10px] font-semibold tracking-wide text-slate uppercase">
                            {formatMile(event.location.primaryLinearReference)}
                          </span>
                        ) : null}
                        {event.agency ? (
                          <span className="text-[10px] text-slate">
                            {event.agency}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-2 font-serif text-xl leading-tight font-semibold text-ink">
                        {event.title}
                      </h3>
                      {event.description ? (
                        <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                          {event.description}
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate">
                        {event.lastUpdated ? (
                          <span>Updated {formatDateTime(event.lastUpdated)}</span>
                        ) : null}
                        {event.beginTime ? (
                          <span>Started {formatDateTime(event.beginTime)}</span>
                        ) : null}
                        <TrackedLink
                          href={event.url}
                          external
                          event="conditions_event_click"
                          eventData={{
                            category: event.category,
                            mile: event.location?.primaryLinearReference ?? null,
                          }}
                          className="font-bold tracking-[0.06em] text-highway uppercase hover:text-amber-dark"
                        >
                          Open on 511
                        </TrackedLink>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 border border-line bg-paper p-5">
                  <p className="text-sm leading-relaxed text-ink-soft">
                    {roads.error
                      ? "The 511 reader is unavailable right now. Use the official Nebraska 511 map before you drive."
                      : "No I-80-specific closures, crashes or work zones were returned. That does not guarantee a clear road — check 511 and the weather before you go."}
                  </p>
                </div>
              )}
            </section>

            <section className="mt-10 border-t-2 border-ink pt-4">
              <h2 className="font-serif text-2xl font-semibold">
                Weather alerts
              </h2>
              {alerts.length ? (
                <ul className="mt-4 space-y-3">
                  {alerts.map((alert) => (
                    <li
                      key={alert.id}
                      className="border-l-4 border-alert bg-paper p-4"
                    >
                      <p className="text-[9px] font-bold tracking-[0.1em] text-alert uppercase">
                        {alert.severity} · {alert.event}
                      </p>
                      <p className="mt-1 font-serif text-lg leading-snug font-semibold">
                        {alert.headline}
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-slate">
                        {alert.areaDesc}
                        {alert.ends
                          ? ` · until ${formatDateTime(alert.ends)}`
                          : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-slate">
                  No active National Weather Service alerts for the corridor
                  towns right now. Conditions can change quickly, especially in
                  winter.
                </p>
              )}
            </section>

            <div className="mt-8 border border-amber-dark/30 bg-amber/5 p-4">
              <p className="text-[10px] font-bold tracking-[0.1em] text-amber-dark uppercase">
                Read this before you drive
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">
                The 511 layer behind this page is an unofficial reader of the
                same map the state uses. It can lag, omit a new incident or
                change without notice. Closures and crashes are confirmed only
                when NDOT, Nebraska 511 or the State Patrol says so. For winter
                travel, check the forecast and the official map together.
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-[10px] font-bold tracking-[0.06em] uppercase">
                <a
                  href="https://511.nebraska.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-highway hover:text-amber-dark"
                >
                  Nebraska 511
                </a>
                <a
                  href="https://www.weather.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-highway hover:text-amber-dark"
                >
                  NWS
                </a>
                <Link
                  href="/news/winter-driving-i-80-nebraska"
                  className="text-highway hover:text-amber-dark"
                >
                  Winter driving guide
                </Link>
                <Link
                  href="/news/how-to-read-nebraska-511"
                  className="text-highway hover:text-amber-dark"
                >
                  How to read 511
                </Link>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="border border-line bg-paper p-4">
              <h2 className="kicker text-slate">Before you drive</h2>
              <ul className="mt-3 space-y-3 text-[13px]">
                <li>
                  <TrackedLink
                    href="https://511.nebraska.gov/"
                    external
                    event="conditions_outbound"
                    eventData={{ destination: "nebraska-511" }}
                    className="font-semibold text-ink hover:text-amber-dark"
                  >
                    Nebraska 511
                  </TrackedLink>
                  <span className="block text-[11px] text-slate">
                    Closures, cameras, plows and road reports
                  </span>
                </li>
                <li>
                  <TrackedLink
                    href="https://www.weather.gov/"
                    external
                    event="conditions_outbound"
                    eventData={{ destination: "nws" }}
                    className="font-semibold text-ink hover:text-amber-dark"
                  >
                    National Weather Service
                  </TrackedLink>
                  <span className="block text-[11px] text-slate">
                    Warnings, forecasts and winter headlines
                  </span>
                </li>
                <li>
                  <TrackedLink
                    href="https://statepatrol.nebraska.gov/divisions/office-superintendent/news"
                    external
                    event="conditions_outbound"
                    eventData={{ destination: "nsp" }}
                    className="font-semibold text-ink hover:text-amber-dark"
                  >
                    Nebraska State Patrol
                  </TrackedLink>
                  <span className="block text-[11px] text-slate">
                    Confirmed crashes and incident releases
                  </span>
                </li>
                <li>
                  <TrackedLink
                    href="https://dot.nebraska.gov/news-events/news-releases/"
                    external
                    event="conditions_outbound"
                    eventData={{ destination: "ndot" }}
                    className="font-semibold text-ink hover:text-amber-dark"
                  >
                    NDOT news
                  </TrackedLink>
                  <span className="block text-[11px] text-slate">
                    Construction and project announcements
                  </span>
                </li>
              </ul>
            </div>

            <div className="border border-line bg-cream p-4">
              <h2 className="kicker text-amber-dark">Corridor towns</h2>
              <p className="mt-2 text-[12px] leading-relaxed text-slate">
                Looking for exits, services or the local picture? Start with a
                town hub.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["omaha", "lincoln", "kearney", "north-platte", "sidney", "kimball"].map(
                  (slug) => (
                    <Link
                      key={slug}
                      href={`/cities/${slug}`}
                      className="border border-line bg-paper px-2.5 py-1 text-[10px] font-bold tracking-[0.06em] text-ink-soft uppercase hover:border-ink"
                    >
                      {slug.replace("-", " ")}
                    </Link>
                  ),
                )}
              </div>
              <Link
                href="/exits"
                className="mt-3 block border border-ink px-3 py-2 text-center text-[10px] font-bold tracking-[0.1em] uppercase transition hover:bg-ink hover:text-paper"
              >
                All I-80 exits
              </Link>
            </div>

            <div className="border border-line p-4">
              <h2 className="kicker text-slate">How this page works</h2>
              <p className="mt-2 text-[11px] leading-relaxed text-slate">
                Events are read from Nebraska 511&apos;s public map and the NWS
                alerts API, then cached for five minutes. The page is a
                monitoring aid, not an official road report.
              </p>
              <Link
                href="/sources"
                className="mt-3 inline-block text-[10px] font-bold tracking-[0.08em] text-highway uppercase hover:text-amber-dark"
              >
                Full source directory →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
