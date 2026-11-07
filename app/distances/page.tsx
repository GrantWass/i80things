import type { Metadata } from "next";
import Link from "next/link";
import { DataPage, RowSection, StartHere } from "@/components/data-page";
import { DataSummary } from "@/components/DataSummary";
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

function HubLink({ hub, className }: { hub: string; className: string }) {
  const slug = hubSlugs[hub];
  return slug ? (
    <Link href={`/cities/${slug}`} className={className}>
      {hub}
    </Link>
  ) : (
    <>{hub}</>
  );
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
    <DataPage
      jsonLd={jsonLd}
      kicker="Estimates, not live times"
      title="I-80 Nebraska hub-to-hub distances"
      intro={
        <>
          Estimated miles and drive times between the corridor&apos;s main
          hubs, from Kimball to Omaha. These are planning estimates at steady
          highway speeds — not live traffic, not official NDOT drive times,
          and not adjusted for weather, stops or construction.
        </>
      }
      current="/distances"
    >
      <StartHere
        title="From Omaha"
        note="Distance and a steady-speed estimate. No stops, traffic, weather or construction included."
      >
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
      </StartHere>

      <DataSummary
        className="mt-4"
        items={[
          {
            value: `${totals.kimballToOmahaMiles} mi`,
            label: "Kimball to Omaha",
            detail: "reference miles 22–454",
          },
          {
            value: formatMinutes(totals.minutesAt70),
            label: "at 70 mph",
            detail: "no stops or delays",
          },
          {
            value: formatMinutes(totals.minutesAt65),
            label: "at 65 mph",
            detail: "no stops or delays",
          },
        ]}
      />

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

      <RowSection<Leg>
        title="Consecutive hubs, west to east"
        note="Estimates at steady speed"
        rows={legs}
        rowKey={(leg) => `${leg.from}-${leg.to}`}
        minWidth="min-w-[44rem]"
        columns={[
          { label: "Leg" },
          { label: "Est. miles" },
          { label: "Est. at 65 mph" },
          { label: "Est. at 70 mph" },
        ]}
        renderMobile={(leg) => (
          <>
            <p className="flex flex-wrap items-center gap-x-1 font-semibold">
              <HubLink
                hub={leg.from}
                className="inline-flex min-h-[44px] items-center text-highway underline decoration-amber underline-offset-2"
              />
              <span aria-hidden="true"> → </span>
              <HubLink
                hub={leg.to}
                className="inline-flex min-h-[44px] items-center text-highway underline decoration-amber underline-offset-2"
              />
            </p>
            <p className="mt-1 text-sm tabular-nums text-ink-soft">
              {leg.miles} mi · {formatMinutes(leg.minutesAt65)} at 65 mph ·{" "}
              {formatMinutes(leg.minutesAt70)} at 70 mph
            </p>
          </>
        )}
        renderCells={(leg) => (
          <>
            <td className="px-3 py-2 font-semibold">
              <HubLink
                hub={leg.from}
                className="text-highway underline decoration-amber underline-offset-2"
              />
              {" → "}
              <HubLink
                hub={leg.to}
                className="text-highway underline decoration-amber underline-offset-2"
              />
            </td>
            <td className="px-3 py-2 tabular-nums text-ink-soft">{leg.miles} mi</td>
            <td className="px-3 py-2 tabular-nums text-ink-soft">
              {formatMinutes(leg.minutesAt65)}
            </td>
            <td className="px-3 py-2 tabular-nums text-ink-soft">
              {formatMinutes(leg.minutesAt70)}
            </td>
          </>
        )}
      />

      <RowSection<FromOmaha>
        title="From Omaha, heading west"
        note="Reference miles from mile 454"
        rows={fromOmaha}
        rowKey={(row) => row.hub}
        minWidth="min-w-[44rem]"
        columns={[
          { label: "Hub" },
          { label: "Ref. mile" },
          { label: "Est. miles from Omaha" },
          { label: "Est. at 65 mph" },
          { label: "Est. at 70 mph" },
        ]}
        renderMobile={(row) => (
          <>
            <HubLink
              hub={row.hub}
              className="inline-flex min-h-[44px] items-center font-serif text-xl leading-tight font-semibold text-highway underline decoration-amber underline-offset-2"
            />
            <p className="mt-1 text-sm tabular-nums text-ink-soft">
              {row.milesFromOmaha} mi from Omaha · Ref. mile{" "}
              {row.referenceMile}
            </p>
            <p className="mt-1 text-sm tabular-nums text-ink-soft">
              {formatMinutes(row.minutesAt65)} at 65 mph ·{" "}
              {formatMinutes(row.minutesAt70)} at 70 mph
            </p>
          </>
        )}
        renderCells={(row) => (
          <>
            <td className="px-3 py-2 font-semibold">
              <HubLink
                hub={row.hub}
                className="text-highway underline decoration-amber underline-offset-2"
              />
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
          </>
        )}
      />

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
            {spur.source}
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
              className="inline-flex min-h-[44px] items-center font-semibold text-highway underline decoration-amber underline-offset-2"
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
              className="inline-flex min-h-[44px] items-center font-semibold text-highway underline decoration-amber underline-offset-2"
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
              className="inline-flex min-h-[44px] items-center font-semibold text-highway underline decoration-amber underline-offset-2"
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
    </DataPage>
  );
}
