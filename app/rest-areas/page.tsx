import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { DataPageLinks } from "@/components/DataPageLinks";
import { places } from "@/data/places";
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
const truckSpacesListed = areas.reduce((sum, area) => sum + (area.truckSpaces ?? 0), 0);
const truckOnlyCount = areas.filter((area) => area.truckOnly).length;
const fullServiceCount = areaCount - truckOnlyCount;
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
    <main>
      <JsonLd data={jsonLd} />

      <header className="border-b border-line bg-cream">
        <div className="container-page py-10 md:py-14">
          <p className="kicker text-amber-dark">Mileposts, parking &amp; closures</p>
          <h1 className="mt-2 max-w-4xl font-serif text-4xl leading-[1.05] font-semibold tracking-tight md:text-6xl">
            Nebraska I-80 rest areas
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate">
            Every rest area and truck-parking-only lot on Nebraska&apos;s I-80,
            transcribed from the NDOT rest area guide. Counts below are the
            guide&apos;s figures — not a live count of open spaces — so check{" "}
            <a href="https://511.nebraska.gov/" className="font-semibold text-highway underline decoration-amber underline-offset-2">
              Nebraska 511
            </a>{" "}
            for current closures before you count on a stop.
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
                  The biggest public truck lots
                </h2>
              </div>
              <p className="max-w-sm text-[11px] leading-relaxed text-slate">
                Sorted by the guide&apos;s posted truck spaces. These are
                capacity figures, not live availability — check 511.
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {topTruckAreas.map((area) => (
                <a
                  key={area.id}
                  href={`#${area.id}`}
                  className="group border border-line bg-cream p-4 hover:border-ink"
                >
                  <p className="text-[10px] font-bold tracking-[0.08em] text-slate uppercase">
                    {area.milepost !== null ? `Mile ${area.milepost}` : `Exit ${area.nearestExit}`} · {directionShort(area.direction)}
                  </p>
                  <p className="mt-1 font-serif text-lg leading-tight font-semibold group-hover:underline group-hover:decoration-amber">
                    {area.name}
                  </p>
                  <p className="mt-2 font-serif text-2xl font-semibold">
                    {area.truckSpaces} <span className="text-xs font-sans font-semibold text-slate">truck spaces</span>
                  </p>
                  {area.citySlug ? (
                    <span className="mt-1 block text-[11px] text-highway">
                      {placeBySlug.get(area.citySlug)?.name} hub →
                    </span>
                  ) : null}
                </a>
              ))}
            </div>
          </section>

          <div className="mt-4 grid gap-px border border-line bg-line sm:grid-cols-3">
            <div className="bg-paper p-5">
              <p className="kicker text-amber-dark">At a glance</p>
              <p className="mt-1 font-serif text-3xl font-semibold">{areaCount}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate">
                I-80 sites listed ({fullServiceCount} rest areas, {truckOnlyCount} truck-only lots)
              </p>
            </div>
            <div className="bg-paper p-5">
              <p className="kicker text-amber-dark">Listed truck spaces</p>
              <p className="mt-1 font-serif text-3xl font-semibold">{truckSpacesListed}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate">
                Sum of the guide&apos;s posted truck counts (Goehner unstated)
              </p>
            </div>
            <div className="bg-paper p-5">
              <p className="kicker text-amber-dark">Data vintage</p>
              <p className="mt-1 font-serif text-3xl font-semibold">2015</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate">
                NDOT guide date — verify everything on 511
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 border border-line bg-paper p-5 sm:grid-cols-3">
            <div>
              <p className="kicker text-amber-dark">How to use it</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Match your direction of travel — most sites serve one side only,
                and the eastbound and westbound areas near a town sit at
                different mileposts. The milepost column tells you which comes
                first on your route.
              </p>
            </div>
            <div>
              <p className="kicker text-amber-dark">Not full-service stops</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Rest areas have toilets, picnic tables and room to stretch, not
                fuel or food. For gas, meals and overnight stays, use the town
                hub linked in each row or the{" "}
                <Link href="/exits" className="font-semibold text-highway underline decoration-amber underline-offset-2">
                  exit guide
                </Link>
                .
              </p>
            </div>
            <div>
              <p className="kicker text-amber-dark">Before you drive</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
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
              </p>
            </div>
          </div>

          {regions.map((region) => {
            const regionRows = areas.filter((area) => regionFor(area) === region.name);
            if (!regionRows.length) return null;
            return (
              <section key={region.name} className="mt-10">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink pb-2">
                  <h2 className="font-serif text-2xl font-semibold">{region.name}</h2>
                  <p className="text-[11px] font-semibold tracking-wide text-slate uppercase">
                    {region.note}
                  </p>
                </div>
                <div className="mt-3 overflow-x-auto border border-line">
                  <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
                    <thead className="bg-cream text-[10px] tracking-[0.12em] text-slate uppercase">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Rest area</th>
                        <th className="px-3 py-2 font-semibold">Mile</th>
                        <th className="px-3 py-2 font-semibold">Dir</th>
                        <th className="px-3 py-2 font-semibold">Parking</th>
                        <th className="px-3 py-2 font-semibold">Town &amp; exit</th>
                        <th className="px-3 py-2 font-semibold">Features</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {regionRows.map((area) => {
                        const place = area.citySlug ? placeBySlug.get(area.citySlug) : null;
                        return (
                          <tr key={area.id} id={area.id} className="bg-paper">
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
                                {area.locationNote}
                                {area.pullThru ? " · Pull-thru truck parking." : ""}
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
                              {area.amenities.length
                                ? area.amenities
                                    .map((amenity) => amenityLabels[amenity] ?? amenity)
                                    .join(" · ")
                                : "No amenities — parking only"}
                              {area.sculpture ? ` · Sculpture: ${area.sculpture}.` : ""}
                              {area.notes && !area.truckOnly ? ` ${area.notes}` : ""}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
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
                  href="#goehner-wb-truck"
                  className="font-semibold text-highway underline decoration-amber underline-offset-2"
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
                  href="#interchange-101-truck"
                  className="font-semibold text-highway underline decoration-amber underline-offset-2"
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
            (Oct. 2015), transcribed {restAreaData.lastVerified}. Parking counts
            and amenities are the guide&apos;s figures and may be out of date —
            sites may have been rebuilt, resized or closed since. For current
            status, use{" "}
            <a href="https://511.nebraska.gov/" className="font-semibold text-highway underline decoration-amber underline-offset-2">
              Nebraska 511
            </a>{" "}
            or call 511; for an emergency on the interstate, use *55.
          </p>
        </div>
      </div>
      <div className="container-page pb-10">
        <div className="mx-auto max-w-5xl">
          <DataPageLinks current="/rest-areas" />
        </div>
      </div>
    </main>
  );
}
