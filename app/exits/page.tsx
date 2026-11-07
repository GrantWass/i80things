import type { Metadata } from "next";
import Link from "next/link";
import { DataPage, Explainer, RowSection } from "@/components/data-page";
import { ExitLookup, type ExitLookupRow } from "@/components/ExitLookup";
import { nearestHub } from "@/lib/corridor-position";
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

const featuredExits = new Set([22, 59, 126, 177, 237, 272, 312, 353, 379, 401, 454]);

const lookupRows: ExitLookupRow[] = rows.map((row) => {
  const place = nearestHub(row.mile);
  return {
    exit: row.exit,
    mile: row.mile,
    road: row.road ?? "Interchange",
    placeName:
      row.exit === 312
        ? "Grand Island / Hastings"
        : place?.name ?? null,
    placeSlug: place?.slug ?? null,
    featured: featuredExits.has(row.exit),
  };
});

const regions = [
  { name: "West", note: "Kimball, Sidney and the Wyoming line", min: 0, max: 125 },
  { name: "Central", note: "Ogallala, North Platte, Lexington and Kearney", min: 126, max: 299 },
  { name: "East", note: "Grand Island, York, Seward, Lincoln and Omaha", min: 300, max: 455 },
];

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
    <DataPage
      jsonLd={jsonLd}
      kicker="Mile markers & interchanges"
      title="I-80 Nebraska exit guide"
      intro={
        <>
          Every Interstate 80 exit in Nebraska, from the Wyoming line to the
          Missouri River. Exit numbers match mile markers; use the nearest town
          as a starting point, then check{" "}
          <a href="https://511.nebraska.gov/" className="font-semibold text-highway underline decoration-amber underline-offset-2">
            Nebraska 511
          </a>{" "}
          for current services, closures and construction.
        </>
      }
      current="/exits"
    >
      <ExitLookup rows={lookupRows} />

      {longestGap ? (
        <p className="mt-3 text-[11px] leading-relaxed text-slate">
          Longest gap between consecutive exits:{" "}
          <strong className="font-semibold text-ink">
            {longestGap.miles} miles
          </strong>{" "}
          ({longestGap.from.exit} → {longestGap.to.exit}). The full table is
          below.
        </p>
      ) : null}

      <Explainer
        className="mt-4"
        items={[
          {
            title: "How to use it",
            body: (
              <>
                Find the exit number or mile marker from 511, a dispatch call or
                a road sign. The nearest town is a direction, not a promise of
                services at that ramp.
              </>
            ),
          },
          {
            title: "The rule",
            body: (
              <>
                Nebraska exit numbers count up from west to east. Mile 22 is
                Kimball; mile 454 is Omaha. The two numbers normally match.
              </>
            ),
          },
          {
            title: "Before you drive",
            body: (
              <>
                Check the{" "}
                <Link href="/conditions" className="font-semibold text-highway underline decoration-amber underline-offset-2">
                  corridor conditions page
                </Link>{" "}
                and our{" "}
                <Link href="/news/i-80-mile-markers-nebraska-explained" className="font-semibold text-highway underline decoration-amber underline-offset-2">
                  mile marker guide
                </Link>
                .
              </>
            ),
          },
        ]}
      />

      {regions.map((region) => {
        const regionRows = rows.filter(
          (row) => row.mile >= region.min && row.mile <= region.max,
        );
        if (!regionRows.length) return null;
        return (
          <RowSection<ExitRow>
            key={region.name}
            title={region.name}
            note={region.note}
            rows={regionRows}
            rowKey={(row) => String(row.exit)}
            rowId={(row) => `exit-${row.exit}`}
            minWidth="min-w-[48rem]"
            tableLabel={`${region.name} exits table, scroll horizontally to see all columns`}
            mobileHint="Swipe sideways to see every column →"
            columns={[
              { label: "Exit" },
              { label: "Mile" },
              { label: "Nearest corridor town" },
              { label: "Connects to" },
            ]}
            renderCells={(row) => {
              const place = nearestHub(row.mile);
              return (
                <>
                  <td className="px-3 py-3 font-semibold">Exit {row.exit}</td>
                  <td className="px-3 py-3 tabular-nums text-ink-soft">
                    {row.mile.toFixed(1)}
                  </td>
                  <td className="px-3">
                    {place ? (
                      <Link
                        href={`/cities/${place.slug}`}
                        className="block py-3 font-medium text-highway underline decoration-amber underline-offset-2"
                      >
                        {place.name}
                      </Link>
                    ) : (
                      <span className="block py-3 text-slate">Open corridor</span>
                    )}
                  </td>
                  <td className="max-w-[16rem] px-3 py-3 text-[12px] leading-snug text-ink-soft">
                    {row.road ?? "—"}
                  </td>
                </>
              );
            }}
          />
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
                className="flex items-center justify-between gap-3 border border-line bg-paper px-3 text-sm"
              >
                <span>
                  <a
                    href={`#exit-${gap.from.exit}`}
                    className="inline-block py-3 font-semibold text-highway underline decoration-amber underline-offset-2"
                  >
                    Exit {gap.from.exit}
                  </a>
                  {" → "}
                  <a
                    href={`#exit-${gap.to.exit}`}
                    className="inline-block py-3 font-semibold text-highway underline decoration-amber underline-offset-2"
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
    </DataPage>
  );
}
