import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { DataPageLinks } from "@/components/DataPageLinks";
import { places } from "@/data/places";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/utils";
import exitData from "@/data/i80-exits.json";

export const metadata: Metadata = {
  title: "I-80 Nebraska exit guide: Omaha to Kimball",
  description:
    "Every Interstate 80 exit in Nebraska, with mile markers and the nearest corridor town. A quick reference for the drive from Omaha to Kimball.",
  alternates: { canonical: "/exits" },
  openGraph: {
    title: "I-80 Nebraska exit guide",
    description:
      "Every Interstate 80 exit in Nebraska, with mile markers and the nearest corridor town.",
    url: absoluteUrl("/exits"),
  },
};

type ExitRow = { exit: number; mile: number; road?: string };

const rows = (exitData.exits as ExitRow[]).slice().sort((a, b) => a.mile - b.mile);
const gaps = rows
  .slice(1)
  .map((row, index) => ({
    from: rows[index],
    to: row,
    miles: Number((row.mile - rows[index].mile).toFixed(1)),
  }))
  .sort((a, b) => b.miles - a.miles);
const longestGap = gaps[0];

const regions = [
  { name: "West", note: "Kimball, Sidney and the Wyoming line", min: 0, max: 125 },
  { name: "Central", note: "Ogallala, North Platte, Lexington and Kearney", min: 126, max: 299 },
  { name: "East", note: "Grand Island, York, Seward, Lincoln and Omaha", min: 300, max: 455 },
];

function nearestPlace(mile: number) {
  let best: { place: (typeof places)[number]; distance: number } | null = null;
  for (const place of places) {
    const range = place.mileMarker.match(/\d+/g)?.map(Number) ?? [];
    if (!range.length) continue;
    const min = Math.min(...range);
    const max = Math.max(...range);
    const distance = mile < min ? min - mile : mile > max ? mile - max : 0;
    if (!best || distance < best.distance) best = { place, distance };
  }
  return best && best.distance <= 25 ? best.place : null;
}

export default function ExitsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${site.url}/exits#page`,
        name: "I-80 Nebraska exit guide",
        url: absoluteUrl("/exits"),
        description:
          "Every Interstate 80 exit in Nebraska, with mile markers and the nearest corridor town.",
        isPartOf: { "@id": `${site.url}/#website` },
        about: {
          "@type": "Place",
          name: "Interstate 80 in Nebraska",
          address: { "@type": "PostalAddress", addressRegion: "NE", addressCountry: "US" },
        },
      },
      {
        "@type": "ItemList",
        name: "I-80 Nebraska exits",
        numberOfItems: rows.length,
        itemListElement: rows.map((row, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `Exit ${row.exit} — mile ${row.mile.toFixed(1)}`,
          url: `${absoluteUrl("/exits")}#exit-${row.exit}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Exits", item: absoluteUrl("/exits") },
        ],
      },
    ],
  };

  return (
    <main>
      <JsonLd data={jsonLd} />

      <header className="border-b border-line bg-cream">
        <div className="container-page py-10 md:py-14">
          <p className="kicker text-amber-dark">Mile markers &amp; interchanges</p>
          <h1 className="mt-2 max-w-4xl font-serif text-4xl leading-[1.05] font-semibold tracking-tight md:text-6xl">
            I-80 Nebraska exit guide
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate">
            Every Interstate 80 exit in Nebraska, from the Wyoming line to the
            Missouri River. Exit numbers match mile markers; use the nearest town
            as a starting point, then check{" "}
            <a href="https://511.nebraska.gov/" className="font-semibold text-highway underline decoration-amber underline-offset-2">
              Nebraska 511
            </a>{" "}
            for current services, closures and construction.
          </p>
        </div>
      </header>

      <div className="container-page py-10">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-px border border-line bg-line sm:grid-cols-3">
            <div className="bg-paper p-5">
              <p className="kicker text-amber-dark">At a glance</p>
              <p className="mt-1 font-serif text-3xl font-semibold">{rows.length}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate">
                Nebraska I-80 exits in this table
              </p>
            </div>
            <div className="bg-paper p-5">
              <p className="kicker text-amber-dark">Corridor hubs</p>
              <p className="mt-1 font-serif text-3xl font-semibold">{places.length}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate">
                Town hubs with local coverage
              </p>
            </div>
            <div className="bg-paper p-5">
              <p className="kicker text-amber-dark">Longest gap</p>
              <p className="mt-1 font-serif text-3xl font-semibold">
                {longestGap ? `${longestGap.miles} mi` : "—"}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate">
                {longestGap
                  ? `Exit ${longestGap.from.exit} to Exit ${longestGap.to.exit}`
                  : "Between consecutive exits"}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 border border-line bg-paper p-5 sm:grid-cols-3">
            <div>
              <p className="kicker text-amber-dark">How to use it</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Find the exit number or mile marker from 511, a dispatch call or
                a road sign. The nearest town is a direction, not a promise of
                services at that ramp.
              </p>
            </div>
            <div>
              <p className="kicker text-amber-dark">The rule</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Nebraska exit numbers count up from west to east. Mile 22 is
                Kimball; mile 454 is Omaha. The two numbers normally match.
              </p>
            </div>
            <div>
              <p className="kicker text-amber-dark">Before you drive</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Check the{" "}
                <Link href="/conditions" className="font-semibold text-highway underline decoration-amber underline-offset-2">
                  corridor conditions page
                </Link>{" "}
                and our{" "}
                <Link href="/news/i-80-mile-markers-nebraska-explained" className="font-semibold text-highway underline decoration-amber underline-offset-2">
                  mile marker guide
                </Link>
                .
              </p>
            </div>
          </div>

          {regions.map((region) => {
            const regionRows = rows.filter(
              (row) => row.mile >= region.min && row.mile <= region.max,
            );
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
                  <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
                    <thead className="bg-cream text-[10px] tracking-[0.12em] text-slate uppercase">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Exit</th>
                        <th className="px-3 py-2 font-semibold">Mile</th>
                        <th className="px-3 py-2 font-semibold">Nearest corridor town</th>
                        <th className="px-3 py-2 font-semibold">Connects to</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {regionRows.map((row) => {
                        const place = nearestPlace(row.mile);
                        return (
                          <tr key={row.exit} id={`exit-${row.exit}`} className="bg-paper">
                            <td className="px-3 py-2 font-semibold">Exit {row.exit}</td>
                            <td className="px-3 py-2 tabular-nums text-ink-soft">
                              {row.mile.toFixed(1)}
                            </td>
                            <td className="px-3 py-2">
                              {place ? (
                                <Link
                                  href={`/cities/${place.slug}`}
                                  className="font-medium text-highway underline decoration-amber underline-offset-2"
                                >
                                  {place.name}
                                </Link>
                              ) : (
                                <span className="text-slate">Open corridor</span>
                              )}
                            </td>
                            <td className="max-w-[16rem] px-3 py-2 text-[12px] leading-snug text-ink-soft">
                              {row.road ?? "—"}
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

          {gaps.length ? (
            <section className="mt-10 border-t border-line pt-5">
              <h2 className="font-serif text-2xl font-semibold">
                Longest gaps between exits
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate">
                Long spacing is normal west of Kearney. Use these gaps when you
                are deciding where to fuel or stop; the next exit may be farther
                than it looks.
              </p>
              <ol className="mt-4 grid gap-2 sm:grid-cols-2">
                {gaps.slice(0, 6).map((gap) => (
                  <li
                    key={`${gap.from.exit}-${gap.to.exit}`}
                    className="flex items-center justify-between gap-3 border border-line bg-paper px-3 py-2 text-sm"
                  >
                    <span>
                      <a
                        href={`#exit-${gap.from.exit}`}
                        className="font-semibold text-highway underline decoration-amber underline-offset-2"
                      >
                        Exit {gap.from.exit}
                      </a>
                      {" → "}
                      <a
                        href={`#exit-${gap.to.exit}`}
                        className="font-semibold text-highway underline decoration-amber underline-offset-2"
                      >
                        Exit {gap.to.exit}
                      </a>
                    </span>
                    <span className="shrink-0 text-[11px] font-bold tracking-wide text-slate uppercase">
                      {gap.miles} mi
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          <p className="mt-8 border-t border-line pt-4 text-[12px] leading-relaxed text-slate">
            Exit and mile data is a reference, not a live conditions feed. The
            table is compiled from the NDOT reference log and cross-checked
            against the current exit list; verify with{" "}
            <a href="https://511.nebraska.gov/" className="font-semibold text-highway underline decoration-amber underline-offset-2">
              Nebraska 511
            </a>{" "}
            before relying on an exit for fuel, food or lodging. For the current
            status, use{" "}
            <a href="https://511.nebraska.gov/" className="font-semibold text-highway underline decoration-amber underline-offset-2">
              Nebraska 511
            </a>{" "}
            or call 511. For an emergency on the interstate, use *55.
          </p>
        </div>
      </div>
      <div className="container-page pb-10">
        <div className="mx-auto max-w-5xl">
          <DataPageLinks current="/exits" />
        </div>
      </div>
    </main>
  );
}
