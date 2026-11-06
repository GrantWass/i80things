import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { DataPageLinks } from "@/components/DataPageLinks";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/utils";
import hubData from "@/data/hub-distances.json";

export const metadata: Metadata = {
  title: "I-80 Nebraska hub distances & time estimates",
  description:
    "Estimated I-80 Nebraska hub-to-hub miles and drive times at 65 and 70 mph, from Kimball to Omaha, plus the Hastings spur. Reference only.",
  alternates: { canonical: "/distances" },
  openGraph: {
    title: "I-80 Nebraska hub distances & time estimates",
    description:
      "Estimated hub-to-hub miles and drive times at 65 and 70 mph, from Kimball to Omaha. Reference only.",
    url: absoluteUrl("/distances"),
  },
};

type Leg = {
  from: string;
  to: string;
  miles: number;
  minutesAt65: number;
  minutesAt70: number;
};

type FromOmaha = {
  hub: string;
  referenceMile: number;
  milesFromOmaha: number;
  minutesAt65: number;
  minutesAt70: number;
};

const legs = hubData.legs as Leg[];
const fromOmaha = hubData.fromOmaha as FromOmaha[];
const totals = hubData.totals as {
  kimballToOmahaMiles: number;
  minutesAt65: number;
  minutesAt70: number;
};
const spur = hubData.spur as {
  hub: string;
  fromExit: number;
  route: string;
  roadMiles: number;
  minutesAt65: number;
  minutesAt70: number;
  source: string;
  sourceUrl: string;
};

const hubSlugs: Record<string, string> = {
  Kimball: "kimball",
  Sidney: "sidney",
  Ogallala: "ogallala",
  "North Platte": "north-platte",
  Lexington: "lexington",
  Kearney: "kearney",
  "Grand Island": "grand-island",
  York: "york",
  Seward: "seward",
  Lincoln: "lincoln",
  Omaha: "omaha",
};

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `~${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `~${hours} h` : `~${hours} h ${rest} min`;
}

export default function DistancesPage() {
  const popular = fromOmaha.filter((row) =>
    ["Lincoln", "Grand Island", "Kearney", "North Platte"].includes(row.hub),
  );
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${site.url}/distances#page`,
        name: "I-80 Nebraska hub distances & time estimates",
        url: absoluteUrl("/distances"),
        description:
          "Estimated hub-to-hub miles and drive times on I-80 in Nebraska, from Kimball to Omaha. Reference only — not live traffic or official drive times.",
        isPartOf: { "@id": `${site.url}/#website` },
        about: {
          "@type": "Place",
          name: "Interstate 80 in Nebraska",
          address: { "@type": "PostalAddress", addressRegion: "NE", addressCountry: "US" },
        },
      },
      {
        "@type": "Dataset",
        name: "I-80 Nebraska hub-to-hub distance estimates",
        description:
          "Reference-mile distances between I-80 corridor hubs in Nebraska with estimated drive times at 65 and 70 mph. Estimates only.",
        url: absoluteUrl("/distances"),
        spatialCoverage: "Nebraska, USA",
        temporalCoverage: hubData.lastChecked,
      },
      {
        "@type": "ItemList",
        name: "I-80 Nebraska consecutive hub legs (west to east)",
        numberOfItems: legs.length,
        itemListElement: legs.map((leg, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `${leg.from} to ${leg.to}: ${leg.miles} miles`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Distances", item: absoluteUrl("/distances") },
        ],
      },
    ],
  };

  return (
    <main>
      <JsonLd data={jsonLd} />

      <header className="border-b border-line bg-cream">
        <div className="container-page py-10 md:py-14">
          <p className="kicker text-amber-dark">Estimates, not live times</p>
          <h1 className="mt-2 max-w-4xl font-serif text-4xl leading-[1.05] font-semibold tracking-tight md:text-6xl">
            I-80 Nebraska hub-to-hub distances
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate">
            Estimated miles and drive times between the corridor&apos;s main
            hubs, from Kimball to Omaha. These are planning estimates at steady
            highway speeds — not live traffic, not official NDOT drive times,
            and not adjusted for weather, stops or construction.
          </p>
        </div>
      </header>

      <div className="container-page py-10">
        <div className="mx-auto max-w-5xl">
          <section className="border border-line bg-paper p-5 md:p-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="kicker text-amber-dark">Start here</p>
                <h2 className="mt-1 font-serif text-2xl font-semibold md:text-3xl">
                  From Omaha
                </h2>
              </div>
              <p className="max-w-sm text-[11px] leading-relaxed text-slate">
                Distance and a steady-speed estimate. No stops, traffic,
                weather or construction included.
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {popular.map((row) => (
                <Link
                  key={row.hub}
                  href={`/cities/${hubSlugs[row.hub]}`}
                  className="group border border-line bg-cream p-4 hover:border-ink"
                >
                  <p className="text-[10px] font-bold tracking-[0.08em] text-slate uppercase">
                    Omaha → {row.hub}
                  </p>
                  <p className="mt-1 font-serif text-2xl font-semibold">
                    {row.milesFromOmaha} mi
                  </p>
                  <p className="mt-1 text-[12px] text-ink-soft">
                    {formatMinutes(row.minutesAt70)} at 70 mph
                  </p>
                  <p className="mt-2 text-[10px] font-bold tracking-[0.06em] text-highway uppercase">
                    {row.hub} hub →
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <div className="mt-4 grid gap-px border border-line bg-line sm:grid-cols-3">
            <div className="bg-paper p-5">
              <p className="kicker text-amber-dark">At a glance</p>
              <p className="mt-1 font-serif text-3xl font-semibold tabular-nums">
                {totals.kimballToOmahaMiles} mi
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate">
                Estimated Kimball → Omaha (reference mile 22 to 454)
              </p>
            </div>
            <div className="bg-paper p-5">
              <p className="kicker text-amber-dark">Est. time at 70 mph</p>
              <p className="mt-1 font-serif text-3xl font-semibold tabular-nums">
                {formatMinutes(totals.minutesAt70)}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate">
                {totals.minutesAt70} estimated minutes; no stops or delays
              </p>
            </div>
            <div className="bg-paper p-5">
              <p className="kicker text-amber-dark">Est. time at 65 mph</p>
              <p className="mt-1 font-serif text-3xl font-semibold tabular-nums">
                {formatMinutes(totals.minutesAt65)}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate">
                {totals.minutesAt65} estimated minutes; no stops or delays
              </p>
            </div>
          </div>

          <section className="mt-8 border border-line bg-paper p-5 md:p-7">
            <h2 className="font-serif text-2xl font-semibold">Methodology</h2>
            <div className="mt-2 grid gap-4 text-sm leading-relaxed text-ink-soft md:grid-cols-2">
              <div>
                <p className="kicker text-amber-dark">Reference miles</p>
                <p className="mt-2">
                  Each hub is pinned to one main-exit reference mile: Kimball
                  22, Sidney 59, Ogallala 126, North Platte 177, Lexington 237,
                  Kearney 272, Grand Island 312, York 353, Seward 379, Lincoln
                  401, Omaha 454. These are main-exit mile references pulled
                  from the exit list — not city centers and not official NDOT
                  segment lengths.
                </p>
              </div>
              <div>
                <p className="kicker text-amber-dark">The math</p>
                <p className="mt-2">
                  Each leg is the next reference mile minus the previous one
                  (for example, 59 − 22 = 37 miles for Kimball → Sidney).
                  Estimated time is distance ÷ speed × 60, rounded to the
                  nearest 5 minutes, at 65 mph and 70 mph. Nothing here accounts
                  for traffic, weather, stops, construction, speed-limit changes
                  or Omaha metro congestion.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-10">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink pb-2">
              <h2 className="font-serif text-2xl font-semibold">Consecutive hubs, west to east</h2>
              <p className="text-[11px] font-semibold tracking-wide text-slate uppercase">
                Estimates at steady speed
              </p>
            </div>
            <div className="mt-3 overflow-x-auto border border-line">
              <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
                <thead className="bg-cream text-[10px] tracking-[0.12em] text-slate uppercase">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Leg</th>
                    <th className="px-3 py-2 font-semibold">Est. miles</th>
                    <th className="px-3 py-2 font-semibold">Est. at 65 mph</th>
                    <th className="px-3 py-2 font-semibold">Est. at 70 mph</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {legs.map((leg) => (
                    <tr key={`${leg.from}-${leg.to}`} className="bg-paper">
                      <td className="px-3 py-2 font-semibold">
                        {hubSlugs[leg.from] ? (
                          <Link
                            href={`/cities/${hubSlugs[leg.from]}`}
                            className="text-highway underline decoration-amber underline-offset-2"
                          >
                            {leg.from}
                          </Link>
                        ) : (
                          leg.from
                        )}
                        {" → "}
                        {hubSlugs[leg.to] ? (
                          <Link
                            href={`/cities/${hubSlugs[leg.to]}`}
                            className="text-highway underline decoration-amber underline-offset-2"
                          >
                            {leg.to}
                          </Link>
                        ) : (
                          leg.to
                        )}
                      </td>
                      <td className="px-3 py-2 tabular-nums text-ink-soft">{leg.miles} mi</td>
                      <td className="px-3 py-2 tabular-nums text-ink-soft">
                        {formatMinutes(leg.minutesAt65)}
                      </td>
                      <td className="px-3 py-2 tabular-nums text-ink-soft">
                        {formatMinutes(leg.minutesAt70)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-10">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink pb-2">
              <h2 className="font-serif text-2xl font-semibold">From Omaha, heading west</h2>
              <p className="text-[11px] font-semibold tracking-wide text-slate uppercase">
                Reference miles from mile 454
              </p>
            </div>
            <div className="mt-3 overflow-x-auto border border-line">
              <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
                <thead className="bg-cream text-[10px] tracking-[0.12em] text-slate uppercase">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Hub</th>
                    <th className="px-3 py-2 font-semibold">Ref. mile</th>
                    <th className="px-3 py-2 font-semibold">Est. miles from Omaha</th>
                    <th className="px-3 py-2 font-semibold">Est. at 65 mph</th>
                    <th className="px-3 py-2 font-semibold">Est. at 70 mph</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {fromOmaha.map((row) => (
                    <tr key={row.hub} className="bg-paper">
                      <td className="px-3 py-2 font-semibold">
                        {hubSlugs[row.hub] ? (
                          <Link
                            href={`/cities/${hubSlugs[row.hub]}`}
                            className="text-highway underline decoration-amber underline-offset-2"
                          >
                            {row.hub}
                          </Link>
                        ) : (
                          row.hub
                        )}
                      </td>
                      <td className="px-3 py-2 tabular-nums text-ink-soft">{row.referenceMile}</td>
                      <td className="px-3 py-2 tabular-nums text-ink-soft">
                        {row.milesFromOmaha} mi
                      </td>
                      <td className="px-3 py-2 tabular-nums text-ink-soft">
                        {formatMinutes(row.minutesAt65)}
                      </td>
                      <td className="px-3 py-2 tabular-nums text-ink-soft">
                        {formatMinutes(row.minutesAt70)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-10 border border-line bg-cream p-5 md:p-7">
            <p className="kicker text-amber-dark">Off-interstate spur</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold">
              Hastings is not on the chain
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">
              Hastings sits off I-80: Exit {spur.fromExit} to Hastings is about{" "}
              {spur.roadMiles} miles by road via {spur.route} — roughly{" "}
              {formatMinutes(spur.minutesAt65)} at steady highway speed. That
              figure comes from{" "}
              <a
                href={spur.sourceUrl}
                className="font-semibold text-highway underline decoration-amber underline-offset-2"
              >
                {spur.source} directions
              </a>
              , not from reference-mile math, so keep it separate from the
              hub-to-hub tables above.
            </p>
          </section>

          <section className="mt-10 border-t border-line pt-5">
            <h2 className="font-serif text-2xl font-semibold">Keep exploring</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-3">
              <li className="border border-line bg-paper p-4 text-sm">
                <Link
                  href="/exits"
                  className="font-semibold text-highway underline decoration-amber underline-offset-2"
                >
                  I-80 exit guide
                </Link>
                <p className="mt-1 text-[12px] leading-relaxed text-slate">
                  Every Nebraska exit with mile markers.
                </p>
              </li>
              <li className="border border-line bg-paper p-4 text-sm">
                <Link
                  href="/cities"
                  className="font-semibold text-highway underline decoration-amber underline-offset-2"
                >
                  Corridor towns
                </Link>
                <p className="mt-1 text-[12px] leading-relaxed text-slate">
                  Hub pages with exits and local coverage.
                </p>
              </li>
              <li className="border border-line bg-paper p-4 text-sm">
                <Link
                  href="/conditions"
                  className="font-semibold text-highway underline decoration-amber underline-offset-2"
                >
                  Corridor conditions
                </Link>
                <p className="mt-1 text-[12px] leading-relaxed text-slate">
                  Current status before you drive — check 511 too.
                </p>
              </li>
            </ul>
          </section>

          <p className="mt-8 border-t border-line pt-4 text-[12px] leading-relaxed text-slate">
            Data source / method / last checked: reference miles compiled from{" "}
            <span className="font-semibold">data/places.ts</span> hub ranges and
            cross-checked against <span className="font-semibold">data/i80-exits.json</span>{" "}
            exit mileposts; last checked {hubData.lastChecked}. Distances are
            reference-mile differences and times are steady-speed estimates
            rounded to 5 minutes. They are not live traffic, not current drive
            times, and not official NDOT figures — verify with{" "}
            <a
              href="https://511.nebraska.gov/"
              className="font-semibold text-highway underline decoration-amber underline-offset-2"
            >
              Nebraska 511
            </a>{" "}
            before you drive.
          </p>
        </div>
      </div>
      <div className="container-page pb-10">
        <div className="mx-auto max-w-5xl">
          <DataPageLinks current="/distances" />
        </div>
      </div>
    </main>
  );
}
