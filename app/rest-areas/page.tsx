import type { Metadata } from "next";
import Link from "next/link";
import { DataPage, AnchorCard, Explainer, RowSection, StartHere } from "@/components/data-page";
import { RestAreaMap } from "@/components/RestAreaMap";
import { DataSummary } from "@/components/DataSummary";
import { places } from "@/data/places";
import { inventoryTotals } from "@/lib/inventory";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/utils";
import restAreaData from "@/data/rest-areas.json";

export const metadata: Metadata = {
  title: "I-80 Nebraska rest areas & services",
  description:
    "Every rest area on Nebraska's I-80, with mileposts, directions, truck and car parking counts, and amenities — plus truck-only lots and 511 closure checks.",
  alternates: { canonical: "/rest-areas" },
  openGraph: {
    title: "I-80 Nebraska rest areas & services",
    description:
      "Every rest area on Nebraska's I-80, with mileposts, truck and car parking counts, and amenities. Check 511 for current closures.",
    url: absoluteUrl("/rest-areas"),
  },
};

type Direction = "eastbound" | "westbound" | "both";

type RestArea = {
  id: string;
  name: string;
  milepost: number | null;
  direction: Direction;
  locationNote: string;
  nearestExit: number;
  citySlug: string | null;
  corridor: string;
  truckOnly: boolean;
  pullThru: boolean;
  truckSpaces: number | null;
  carSpaces: number | null;
  rvSpaces: number | null;
  acres: number | null;
  amenities: string[];
  shelterCount: number | null;
  tableCount: number | null;
  sculpture: string | null;
  notes: string | null;
};

const areas = restAreaData.areas as RestArea[];

const placeBySlug = new Map(places.map((place) => [place.slug, place]));

const amenityLabels: Record<string, string> = {
  restrooms: "Restrooms",
  "family-restroom": "Family restroom",
  "picnic-shelters": "Picnic shelters",
  "picnic-tables": "Picnic tables",
  playground: "Playground",
  "tourist-info": "Tourist info",
  fishing: "Fishing lake",
  "observation-area": "Observation area",
  "historic-site": "Historic site",
};

const regions = [
  { name: "East", note: "Omaha to York — MM 300 to 454", min: 300, max: 500 },
  { name: "Central", note: "Grand Island to Ogallala — MM 126 to 299", min: 126, max: 299 },
  { name: "West", note: "Deuel County to Sidney — MM 0 to 125", min: -1, max: 125 },
];

function regionFor(area: RestArea) {
  if (area.milepost === null) return "West";
  const region = regions.find((r) => area.milepost! >= r.min && area.milepost! <= r.max);
  return region ? region.name : "West";
}

const areaCount = areas.length;
const { openTruckSpaces: truckSpacesListed } = inventoryTotals({ guide: "rest" });

const topTruckAreas = areas
  .filter((area) => area.truckSpaces !== null)
  .sort((a, b) => (b.truckSpaces ?? 0) - (a.truckSpaces ?? 0))
  .slice(0, 4);

function directionShort(direction: Direction) {
  if (direction === "eastbound") return "EB";
  if (direction === "westbound") return "WB";
  return "EB+WB";
}

function parkingLabel(area: RestArea) {
  if (area.truckOnly && area.truckSpaces === null) return "Trucks only";
  const parts: string[] = [];
  if (area.truckSpaces !== null) parts.push(`${area.truckSpaces} truck`);
  if (area.carSpaces !== null) parts.push(`${area.carSpaces} car`);
  if (area.rvSpaces !== null) parts.push(`${area.rvSpaces} RV`);
  return parts.length ? parts.join(" · ") : "—";
}

function featureText(area: RestArea): string {
  const base = area.amenities.length
    ? area.amenities
        .map((amenity) => amenityLabels[amenity] ?? amenity)
        .join(" · ")
    : "No amenities — parking only";
  const sculpture = area.sculpture ? ` · Sculpture: ${area.sculpture}.` : "";
  const notes = area.notes && !area.truckOnly ? ` ${area.notes}` : "";
  return `${base}${sculpture}${notes}`;
}

function locationText(area: RestArea, separator: string): string {
  return `${area.locationNote}${area.pullThru ? `${separator}Pull-thru truck parking.` : ""}`;
}

function TopLotCardBody({ area }: { area: RestArea }) {
  const place = area.citySlug ? placeBySlug.get(area.citySlug) : null;
  return (
    <>
      <p className="text-[10px] font-bold tracking-[0.08em] text-slate uppercase">
        {area.milepost !== null ? `Mile ${area.milepost}` : `Exit ${area.nearestExit}`} · {directionShort(area.direction)}
      </p>
      <p className="mt-1 font-serif text-lg leading-tight font-semibold group-hover:underline group-hover:decoration-amber">
        {area.name}
      </p>
      <p className="mt-2 font-serif text-2xl font-semibold">
        {area.truckSpaces} <span className="text-xs font-sans font-semibold text-slate">truck spaces</span>
      </p>
      {place ? (
        <span className="mt-1 block text-[11px] text-highway">
          {place.name} hub →
        </span>
      ) : null}
    </>
  );
}

export default function RestAreasPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${site.url}/rest-areas#page`,
        name: "Nebraska I-80 rest areas & truck parking guide",
        url: absoluteUrl("/rest-areas"),
        description:
          "Every rest area on Nebraska's I-80, with mileposts, truck and car parking counts, and amenities.",
        isPartOf: { "@id": `${site.url}/#website` },
        about: {
          "@type": "Place",
          name: "Interstate 80 in Nebraska",
          address: { "@type": "PostalAddress", addressRegion: "NE", addressCountry: "US" },
        },
      },
      {
        "@type": "ItemList",
        name: "Nebraska I-80 rest areas and truck parking sites",
        numberOfItems: areas.length,
        itemListElement: areas.map((area, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `${area.name} — ${directionShort(area.direction)}${area.milepost !== null ? `, mile ${area.milepost}` : `, Exit ${area.nearestExit}`}`,
          url: `${absoluteUrl("/rest-areas")}#${area.id}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Rest areas", item: absoluteUrl("/rest-areas") },
        ],
      },
    ],
  };

  return (
    <DataPage
      jsonLd={jsonLd}
      kicker="Mileposts, parking & closures"
      title={
        <>
          Nebraska <span className="whitespace-nowrap">I-80</span> rest areas
        </>
      }
      intro={
        <>
          Every rest area and truck-parking-only lot on Nebraska&apos;s I-80,
          transcribed from the NDOT rest area guide. Counts below are the
          guide&apos;s figures — not a live count of open spaces — so check{" "}
          <a href="https://511.nebraska.gov/" className="font-semibold text-highway underline decoration-amber underline-offset-2">
            Nebraska 511
          </a>{" "}
          for current closures before you count on a stop.
        </>
      }
      current="/rest-areas"
    >
      <RestAreaMap areas={areas} />

      <StartHere
        className="mt-4"
        title="The biggest public truck lots"
        note="Sorted by the guide's posted truck spaces. These are capacity figures, not live availability — check 511."
      >
        {topTruckAreas.map((area) => (
          <AnchorCard key={area.id} id={area.id}>
            <TopLotCardBody area={area} />
          </AnchorCard>
        ))}
      </StartHere>

      <DataSummary
        className="mt-4"
        items={[
          {
            value: truckSpacesListed,
            label: "listed truck spaces",
            detail: "Goehner unstated",
          },
          {
            value: "2015",
            label: "NDOT guide",
            detail: "verify on 511 before you go",
          },
        ]}
      />

      <Explainer
        className="mt-4"
        items={[
          {
            title: "How to use it",
            body: (
              <>
                Match your direction of travel — most sites serve one side only,
                and the eastbound and westbound areas near a town sit at
                different mileposts. The milepost column tells you which comes
                first on your route.
              </>
            ),
          },
          {
            title: "Not full-service stops",
            body: (
              <>
                Rest areas have toilets, picnic tables and room to stretch, not
                fuel or food. For gas, meals and overnight stays, use the town
                hub linked in each row or the{" "}
                <Link href="/exits" className="font-semibold text-highway underline decoration-amber underline-offset-2">
                  exit guide
                </Link>
                .
              </>
            ),
          },
          {
            title: "Before you drive",
            body: (
              <>
                The guide is dated October 2015. For short-term closures call
                511 or check{" "}
                <a href="https://511.nebraska.gov/" className="font-semibold text-highway underline decoration-amber underline-offset-2">
                  511.nebraska.gov
                </a>
                . Truck drivers should also see our{" "}
                <Link href="/truck-parking" className="font-semibold text-highway underline decoration-amber underline-offset-2">
                  truck parking page
                </Link>
                .
              </>
            ),
          },
        ]}
      />

      {regions.map((region) => {
        const regionRows = areas.filter((area) => regionFor(area) === region.name);
        if (!regionRows.length) return null;
        return (
          <RowSection<RestArea>
            key={region.name}
            title={region.name}
            note={region.note}
            rows={regionRows}
            rowKey={(area) => area.id}
            rowId={(area) => area.id}
            mobileGap="2"
            minWidth="min-w-[52rem]"
            columns={[
              { label: "Rest area" },
              { label: "Mile" },
              { label: "Dir" },
              { label: "Parking" },
              { label: "Town & exit" },
              { label: "Features" },
            ]}
            renderMobile={(area) => {
              const place = area.citySlug ? placeBySlug.get(area.citySlug) : null;
              return (
                <>
                  <p className="text-[10px] font-bold tracking-[0.08em] text-slate uppercase">
                    {area.milepost !== null ? `Mile ${area.milepost}` : `Exit ${area.nearestExit}`} ·{" "}
                    {directionShort(area.direction)}
                    {area.truckOnly ? " · Trucks only" : ""}
                  </p>
                  <p className="mt-1 font-serif text-lg leading-tight font-semibold">
                    {area.name}
                  </p>
                  <p className="mt-2 font-serif text-xl font-semibold">
                    {parkingLabel(area)}
                  </p>
                  <p className="mt-1 text-[12px] leading-snug text-slate">
                    {locationText(area, " ")}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-5 text-[12px]">
                    {place ? (
                      <Link
                        href={`/cities/${place.slug}`}
                        className="inline-flex min-h-[44px] items-center font-medium text-highway underline decoration-amber underline-offset-2"
                      >
                        {place.name} hub →
                      </Link>
                    ) : (
                      <span className="inline-flex min-h-[44px] items-center text-slate">
                        {area.corridor}
                      </span>
                    )}
                    <Link
                      href={`/exits#exit-${area.nearestExit}`}
                      className="inline-flex min-h-[44px] items-center whitespace-nowrap text-highway underline decoration-amber underline-offset-2"
                    >
                      Exit {area.nearestExit} →
                    </Link>
                  </p>
                  <p className="border-t border-line pt-2 text-[12px] leading-snug text-ink-soft">
                    {featureText(area)}
                  </p>
                </>
              );
            }}
            renderCells={(area) => {
              const place = area.citySlug ? placeBySlug.get(area.citySlug) : null;
              return (
                <>
                  <td className="px-3 py-2">
                    <p className="font-semibold">
                      {area.name}
                      {area.truckOnly ? (
                        <span className="ml-2 inline-block bg-cream px-1.5 py-0.5 align-middle text-[10px] font-bold tracking-wide text-amber-dark uppercase">
                          Trucks only
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 max-w-[16rem] text-[12px] leading-snug text-slate">
                      {locationText(area, " · ")}
                    </p>
                  </td>
                  <td className="px-3 py-2 tabular-nums whitespace-nowrap text-ink-soft">
                    {area.milepost !== null ? area.milepost.toFixed(2) : "—"}
                  </td>
                  <td className="px-3 py-2 font-semibold whitespace-nowrap text-ink-soft">
                    {directionShort(area.direction)}
                  </td>
                  <td className="px-3 py-2 text-[12px] whitespace-nowrap text-ink-soft">
                    {parkingLabel(area)}
                  </td>
                  <td className="px-3 py-2 text-[12px] leading-snug">
                    {place ? (
                      <Link
                        href={`/cities/${place.slug}`}
                        className="font-medium text-highway underline decoration-amber underline-offset-2"
                      >
                        {place.name}
                      </Link>
                    ) : (
                      <span className="text-slate">{area.corridor}</span>
                    )}{" "}
                    <Link
                      href={`/exits#exit-${area.nearestExit}`}
                      className="whitespace-nowrap text-highway underline decoration-amber underline-offset-2"
                    >
                      Exit {area.nearestExit}
                    </Link>
                  </td>
                  <td className="max-w-[18rem] px-3 py-2 text-[12px] leading-snug text-ink-soft">
                    {featureText(area)}
                  </td>
                </>
              );
            }}
          />
        );
      })}

      <section className="mt-10 border-t border-line pt-5">
        <h2 className="font-serif text-2xl font-semibold">Truck parking notes</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate">
          Two of the {areaCount} sites are trucks-only. The rest areas above
          list a small number of truck spaces each — typically seven — with a
          few exceptions: Melia Hill (24), Platte River (10), Brady
          eastbound (18), Brady westbound (22) and Sidney eastbound (28).
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          <li className="border border-line bg-paper px-3 py-2 text-sm">
            <a
              href="#goehner-wb-truck-m"
              className="font-semibold text-highway underline decoration-amber underline-offset-2 sm:hidden"
            >
              Goehner truck parking
            </a>
            <a
              href="#goehner-wb-truck"
              className="hidden font-semibold text-highway underline decoration-amber underline-offset-2 sm:inline"
            >
              Goehner truck parking
            </a>
            <span className="text-ink-soft"> (MM 375.50 WB)</span>
            <p className="mt-1 text-[12px] leading-snug text-slate">
              Trucks only; the guide gives no space count. For food, fuel
              and overnight parking, see{" "}
              <Link href="/truck-parking" className="font-semibold text-highway underline decoration-amber underline-offset-2">
                truck parking
              </Link>{" "}
              and the{" "}
              <Link href="/cities/seward" className="font-semibold text-highway underline decoration-amber underline-offset-2">
                Seward hub
              </Link>
              .
            </p>
          </li>
          <li className="border border-line bg-paper px-3 py-2 text-sm">
            <a
              href="#interchange-101-truck-m"
              className="font-semibold text-highway underline decoration-amber underline-offset-2 sm:hidden"
            >
              Interchange 101 truck parking
            </a>
            <a
              href="#interchange-101-truck"
              className="hidden font-semibold text-highway underline decoration-amber underline-offset-2 sm:inline"
            >
              Interchange 101 truck parking
            </a>
            <span className="text-ink-soft"> (Exit 101, Deuel County)</span>
            <p className="mt-1 text-[12px] leading-snug text-slate">
              About 60 truck spaces on a surfaced lot off US-138, serving
              both directions. No amenities of any kind — plan accordingly.
            </p>
          </li>
        </ul>
      </section>

      <section className="mt-10 border-t border-line pt-5">
        <h2 className="font-serif text-2xl font-semibold">Amenities and rules</h2>
        <div className="mt-3 grid gap-4 text-sm leading-relaxed text-ink-soft md:grid-cols-2">
          <div className="border border-line bg-paper p-5">
            <p className="kicker text-amber-dark">What to expect</p>
            <p className="mt-2">
              The guide describes rest areas as offering some or all of:
              full toilet facilities, drinking fountains, accessible
              facilities, vending, pet exercise areas, picnic shelters and
              tables, night lighting, real-time weather and road-condition
              information, historical plaques, and summer tourist information
              stations. Per-site details are in the tables above; anything
              not listed for a site was not stated in the guide.
            </p>
          </div>
          <div className="border border-line bg-paper p-5">
            <p className="kicker text-amber-dark">The rules</p>
            <p className="mt-2">
              No camping; maximum stay is ten hours. Park only in
              designated areas, keep pets leashed and in pet areas, use
              provided grills for fires, and don&apos;t dump household
              trash. Alcohol, weapons, loitering around buildings and
              soliciting are prohibited.
            </p>
          </div>
        </div>
      </section>

      <p className="mt-8 border-t border-line pt-4 text-[12px] leading-relaxed text-slate">
        Data source: NDOT&apos;s{" "}
        <a href="https://dot.nebraska.gov/media/fgceurxm/rest-areas.pdf" className="font-semibold text-highway underline decoration-amber underline-offset-2">
          Nebraska&apos;s Interstate 80 Rest Areas
        </a>{" "}
        (Oct. 2015), transcribed {restAreaData.lastVerified}. NDOT&apos;s
        Rest Area Information page still linked that guide when checked on
        November 6, 2026; no newer official capacity inventory was found.
        Parking counts and amenities are the guide&apos;s figures and may be
        out of date — sites may have been rebuilt, resized or closed since. For current
        status, use{" "}
        <a href="https://511.nebraska.gov/" className="font-semibold text-highway underline decoration-amber underline-offset-2">
          Nebraska 511
        </a>{" "}
        or call 511; for an emergency on the interstate, use *55.
      </p>
    </DataPage>
  );
}
