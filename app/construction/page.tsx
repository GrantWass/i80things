import type { Metadata } from "next";
import Link from "next/link";
import { AutoRefresh } from "@/components/AutoRefresh";
import { CorridorMap } from "@/components/CorridorMap";
import { DataPage } from "@/components/data-page";
import { DataSummary } from "@/components/DataSummary";
import { TrackedLink } from "@/components/TrackedLink";
import {
  getRoadConditions,
  type RoadConditionEvent,
} from "@/lib/road-conditions";
import { site } from "@/lib/site";
import { absoluteUrl, formatDateTime } from "@/lib/utils";
import districtData from "@/data/ndot-districts.json";

export const revalidate = 300;

const NDOT_REPORT_URL =
  "https://dot.nebraska.gov/media/4v5lbeay/construction-detours-info.pdf";

export const metadata: Metadata = {
  title: "I-80 construction tracker: Nebraska work zones",
  description:
    "Nebraska I-80 construction and closures by NDOT district, read from Nebraska 511. Unofficial reader — confirm on 511 and the NDOT weekly report.",
  alternates: { canonical: "/construction" },
  openGraph: {
    url: `${site.url}/construction`,
    title: "I-80 construction tracker: Nebraska work zones",
    description:
      "I-80 work zones and closures grouped by NDOT district, from an unofficial Nebraska 511 reader.",
    images: [
      {
        url: "/api/og?title=I-80%20construction%20tracker&kicker=I-80%20NEBRASKA",
        width: 1200,
        height: 675,
      },
    ],
  },
};

type District = {
  id: string;
  district: string;
  label: string;
  minMile: number;
  maxMile: number;
  maxInclusive: boolean;
  counties: string[];
  note: string;
};

const DISTRICTS = districtData.districts as District[];

function mileOf(event: RoadConditionEvent): number | null {
  const raw = event.location?.primaryLinearReference;
  if (raw === undefined || raw === null) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function districtFor(mile: number | null): District | null {
  if (mile === null) return null;
  return (
    DISTRICTS.find((d) =>
      d.maxInclusive
        ? mile >= d.minMile && mile <= d.maxMile
        : mile >= d.minMile && mile < d.maxMile,
    ) ?? null
  );
}

function formatMile(mile: number | null): string | null {
  if (mile === null) return null;
  return `Mile ${mile.toFixed(1)}`;
}

const CATEGORY_STYLE: Record<string, string> = {
  closure: "border-alert bg-alert/10 text-alert",
  incident: "border-amber-dark bg-amber/10 text-amber-dark",
  construction: "border-amber-dark bg-amber/10 text-amber-dark",
  conditions: "border-highway bg-highway/10 text-highway",
  other: "border-line bg-cream text-slate",
};

export default async function ConstructionPage() {
  const roads = await getRoadConditions();

  const workZones = roads.events.filter(
    (e) => e.category === "construction" || e.category === "closure",
  );
  const incidents = roads.events.filter((e) => e.category === "incident");

  const withMiles = workZones.map((event) => ({
    event,
    mile: mileOf(event),
  }));
  withMiles.sort((a, b) => (a.mile ?? 9999) - (b.mile ?? 9999));

  const unlocated = withMiles.filter((w) => districtFor(w.mile) === null);
  const districtsRepresented = new Set(
    withMiles
      .map((w) => districtFor(w.mile)?.id)
      .filter((id): id is string => Boolean(id)),
  ).size;

  const checked = roads.fetchedAt
    ? formatDateTime(roads.fetchedAt)
    : "Unavailable right now";
  const dateModified = roads.fetchedAt ?? new Date().toISOString();

  const itemList = withMiles.map((w, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: w.mile !== null ? `${w.event.title} (${formatMile(w.mile)})` : w.event.title,
    url: w.event.url,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${site.url}/construction#page`,
        name: "I-80 construction tracker: Nebraska work zones",
        url: absoluteUrl("/construction"),
        description:
          "Nebraska I-80 construction and closures grouped by NDOT district, read from an unofficial Nebraska 511 reader.",
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
      },
      {
        "@type": "Dataset",
        name: "I-80 Nebraska construction and closure events (511 reader snapshot)",
        description:
          "Snapshot of I-80 construction and closure events returned by the site's unofficial Nebraska 511 reader, grouped by approximate NDOT district mile ranges. Not an official NDOT dataset.",
        url: absoluteUrl("/construction"),
        isBasedOn: [
          "https://511.nebraska.gov/",
          "https://dot.nebraska.gov/about/divisions-districts/",
        ],
        temporalCoverage: roads.fetchedAt ?? undefined,
        dateModified,
        spatialCoverage: {
          "@type": "Place",
          name: "Interstate 80 in Nebraska",
        },
      },
      {
        "@type": "ItemList",
        name: "Current I-80 work zones",
        numberOfItems: withMiles.length,
        itemListElement: itemList,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          {
            "@type": "ListItem",
            position: 2,
            name: "Construction",
            item: absoluteUrl("/construction"),
          },
        ],
      },
    ],
  };

  return (
    <DataPage
      jsonLd={jsonLd}
      before={<AutoRefresh />}
      kicker="Work zones &amp; closures"
      title="I-80 construction tracker"
      introWidth="3xl"
      intro={
        <>
          Work zones and closures on I-80 in Nebraska, grouped by NDOT
          district from west to east. This page is an{" "}
          <strong className="font-semibold text-ink">
            unofficial reader of Nebraska 511
          </strong>
          , not a live official NDOT feed — confirm every work zone on the
          official map before you drive.
        </>
      }
      actions={
        <>
          <TrackedLink
            href="https://511.nebraska.gov/"
            external
            event="construction_511_click"
            eventData={{ placement: "header" }}
            className="inline-flex min-h-[44px] items-center bg-ink px-5 py-3 text-[11px] font-bold tracking-[0.1em] text-paper uppercase hover:bg-highway"
          >
            Open Nebraska 511
          </TrackedLink>
          <TrackedLink
            href={NDOT_REPORT_URL}
            external
            event="construction_ndot_report_click"
            eventData={{ placement: "header" }}
            className="inline-flex min-h-[44px] items-center border border-ink px-5 py-3 text-[11px] font-bold tracking-[0.1em] uppercase transition hover:bg-ink hover:text-paper"
          >
            NDOT weekly report (PDF)
          </TrackedLink>
        </>
      }
      current="/construction"
    >
      <DataSummary
            items={[
              {
                value: workZones.length,
                label: "active work zones",
                detail: `${districtsRepresented} of ${DISTRICTS.length} district areas`,
              },
              {
                value: checked,
                label: "last checked",
                detail: "5-min cache",
              },
            ]}
          />

          <div className="mt-6">
            <CorridorMap events={workZones} maxEvents={workZones.length} />
          </div>



          {roads.error || !workZones.length ? (
            <div className="mt-8 border border-amber-dark/40 bg-amber/5 p-5">
              <h2 className="font-serif text-2xl font-semibold">
                {roads.error
                  ? "The 511 reader is unavailable right now"
                  : "No I-80 work zones returned right now"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {roads.error
                  ? "This page could not reach the 511 reader on its last check. That says nothing about the road — check the official sources directly."
                  : "The reader returned no I-80 construction or closure events on its last check. That does not guarantee a clear road: short-term work may post late, and long-term projects live in NDOT's weekly report rather than 511."}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-[11px] font-bold tracking-[0.08em] uppercase">
                <TrackedLink
                  href="https://511.nebraska.gov/"
                  external
                  event="construction_511_click"
                  eventData={{ placement: "fallback" }}
                  className="inline-flex min-h-[44px] items-center bg-ink px-4 py-2.5 text-paper hover:bg-highway"
                >
                  Open Nebraska 511
                </TrackedLink>
                <TrackedLink
                  href={NDOT_REPORT_URL}
                  external
                  event="construction_ndot_report_click"
                  eventData={{ placement: "fallback" }}
                  className="inline-flex min-h-[44px] items-center border border-ink px-4 py-2.5 hover:bg-ink hover:text-paper"
                >
                  NDOT weekly report (PDF)
                </TrackedLink>
              </div>
            </div>
          ) : (
            <div id="all-work-zones" className="mt-8 space-y-10">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-ink pb-2">
                <div>
                  <p className="kicker text-amber-dark">All active work zones</p>
                  <h2 className="mt-1 font-serif text-2xl font-semibold">
                    Every current construction and closure
                  </h2>
                </div>
                <p className="text-[11px] font-semibold tracking-wide text-slate uppercase">
                  West to east · grouped by NDOT district
                </p>
              </div>
              {DISTRICTS.map((district) => {
                const rows = withMiles.filter(
                  (w) => districtFor(w.mile)?.id === district.id,
                );
                if (!rows.length) return null;
                return (
                  <section key={district.id}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-ink pb-2">
                      <h2 className="font-serif text-2xl font-semibold">
                        {district.district} — {district.label}
                      </h2>
                      <p className="text-[11px] font-semibold tracking-wide text-slate uppercase">
                        Approx. miles {district.minMile}–{district.maxMile} ·{" "}
                        {district.counties.join(", ")}
                      </p>
                    </div>
                    <ul className="mt-4 space-y-3">
                      {rows.map(({ event, mile }) => (
                        <li
                          key={event.id}
                          className="border border-line bg-paper p-4 md:p-5"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`border px-2 py-0.5 text-[9px] font-bold tracking-[0.1em] uppercase ${
                                CATEGORY_STYLE[event.category] ??
                                CATEGORY_STYLE.other
                              }`}
                            >
                              {event.category === "closure"
                                ? "Closure"
                                : "Construction"}
                            </span>
                            {mile !== null ? (
                              <span className="text-[10px] font-semibold tracking-wide text-slate uppercase">
                                {formatMile(mile)}
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
                              <span>
                                Updated {formatDateTime(event.lastUpdated)}
                              </span>
                            ) : null}
                            {event.beginTime ? (
                              <span>
                                Started {formatDateTime(event.beginTime)}
                              </span>
                            ) : null}
                            <TrackedLink
                              href={event.url}
                              external
                              event="construction_event_click"
                              eventData={{
                                category: event.category,
                                mile: mile ?? null,
                              }}
                              className="inline-flex min-h-[44px] items-center py-1 font-bold tracking-[0.06em] text-highway uppercase hover:text-amber-dark"
                            >
                              Open on 511
                            </TrackedLink>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}

              {unlocated.length ? (
                <section>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-ink pb-2">
                    <h2 className="font-serif text-2xl font-semibold">
                      Location unclear
                    </h2>
                    <p className="text-[11px] font-semibold tracking-wide text-slate uppercase">
                      No mile marker in the 511 record
                    </p>
                  </div>
                  <ul className="mt-4 space-y-3">
                    {unlocated.map(({ event }) => (
                      <li
                        key={event.id}
                        className="border border-line bg-paper p-4 md:p-5"
                      >
                        <h3 className="font-serif text-xl leading-tight font-semibold text-ink">
                          {event.title}
                        </h3>
                        {event.description ? (
                          <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                            {event.description}
                          </p>
                        ) : null}
                        <div className="mt-3 text-[10px] text-slate">
                          <TrackedLink
                            href={event.url}
                            external
                            event="construction_event_click"
                            eventData={{ category: event.category, mile: null }}
                            className="inline-flex min-h-[44px] items-center py-1 font-bold tracking-[0.06em] text-highway uppercase hover:text-amber-dark"
                          >
                            Open on 511
                          </TrackedLink>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          )}

          {incidents.length ? (
            <section className="mt-10 border-t border-line pt-5">
              <h2 className="font-serif text-2xl font-semibold">
                Also on I-80: crashes &amp; disabled vehicles
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate">
                These are incidents, not scheduled work — included so a closure
                listed above isn&apos;t mistaken for construction, or vice
                versa.
              </p>
              <ul className="mt-4 space-y-3">
                {incidents.map((event) => (
                  <li
                    key={event.id}
                    className="border-l-4 border-amber-dark bg-paper p-4"
                  >
                    <p className="text-[9px] font-bold tracking-[0.1em] text-amber-dark uppercase">
                      Incident
                      {mileOf(event) !== null
                        ? ` · ${formatMile(mileOf(event))}`
                        : ""}
                    </p>
                    <p className="mt-1 font-serif text-lg leading-snug font-semibold">
                      {event.title}
                    </p>
                    {event.description ? (
                      <p className="mt-1 text-[12px] leading-relaxed text-slate">
                        {event.description}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-10 border border-amber-dark/30 bg-amber/5 p-5">
            <p className="text-[10px] font-bold tracking-[0.1em] text-amber-dark uppercase">
              Read this before you drive
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">
              This page is an unofficial reader of Nebraska 511, not an
              official NDOT publication. It can lag, omit a new work zone, or
              change without notice. District mile ranges are approximate
              groupings, not official boundary claims. Long-term projects may
              appear only in NDOT&apos;s weekly Construction &amp; Detour
              Report, not in 511. Confirm work zones, lane closures and detours
              with{" "}
              <a
                href="https://511.nebraska.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-highway underline decoration-amber underline-offset-2"
              >
                Nebraska 511
              </a>{" "}
              (or 511 by phone) and the{" "}
              <a
                href={NDOT_REPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-highway underline decoration-amber underline-offset-2"
              >
                NDOT weekly report (PDF)
              </a>
              . For an emergency on the interstate, use *55.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-bold tracking-[0.06em] uppercase">
              <Link
                href="/conditions"
                className="inline-flex min-h-[44px] items-center text-highway hover:text-amber-dark"
              >
                Corridor conditions →
              </Link>
              <Link
                href="/exits"
                className="inline-flex min-h-[44px] items-center text-highway hover:text-amber-dark"
              >
                All I-80 exits →
              </Link>
              <Link
                href="/sources"
                className="inline-flex min-h-[44px] items-center text-highway hover:text-amber-dark"
              >
                Full source directory →
              </Link>
            </div>
          </section>
    </DataPage>
  );
}
