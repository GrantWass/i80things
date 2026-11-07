import type { Metadata } from "next";
import Link from "next/link";
import { DataPage, AnchorCard, Explainer, RowSection, StartHere } from "@/components/data-page";
import { RestAreaMap } from "@/components/RestAreaMap";
import { DataSummary } from "@/components/DataSummary";
import { getPlace } from "@/data/places";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/utils";
import parkingData from "@/data/truck-parking.json";

export const metadata: Metadata = {
  title: "Nebraska I-80 public truck parking by exit",
  description:
    "Public truck parking on Nebraska's I-80: rest-area stalls by mile marker and exit, plus the planned Dawson County project. Private lots excluded.",
  alternates: { canonical: "/truck-parking" },
  openGraph: {
    title: "Nebraska I-80 public truck parking",
    description:
      "Public truck parking on Nebraska's I-80: rest-area stalls by mile marker and exit, plus the planned Dawson County project.",
    url: absoluteUrl("/truck-parking"),
  },
};

type SiteRow = {
  id: string;
  name: string;
  mile: number | null;
  mileApproximate: boolean;
  direction: string;
  nearestExit: number | null;
  nearestTown: string;
  truckSpaces: number | null;
  carSpaces: number | null;
  notes: string;
  status: "open" | "planned";
  sourceUrl: string;
};

const sites = (parkingData.sites as SiteRow[]).slice().sort((a, b) => {
  if (a.mile == null) return 1;
  if (b.mile == null) return -1;
  return a.mile - b.mile;
});

const openSites = sites.filter((s) => s.status === "open");
const openTruckSpaces = openSites.reduce(
  (sum, s) => sum + (s.truckSpaces ?? 0),
  0,
);
const countedSites = openSites.filter((s) => s.truckSpaces != null).length;
const topSites = openSites
  .filter((site) => site.truckSpaces !== null)
  .sort((a, b) => (b.truckSpaces ?? 0) - (a.truckSpaces ?? 0))
  .slice(0, 4);

const regions = [
  { name: "West", note: "Wyoming line, Kimball, Sidney, Deuel County", min: 0, max: 125 },
  { name: "Central", note: "Ogallala, North Platte, Dawson County, Kearney", min: 126, max: 299 },
  { name: "East", note: "Grand Island, York, Seward County, Omaha", min: 300, max: 455 },
];

function townName(slug: string): string {
  return getPlace(slug)?.name ?? slug;
}

function formatSpaces(n: number | null): string {
  return n == null ? "Not stated" : n.toLocaleString("en-US");
}

function TopSiteCardBody({ row }: { row: SiteRow }) {
  return (
    <>
      <p className="text-[10px] font-bold tracking-[0.08em] text-slate uppercase">
        {row.mile !== null ? `Mile ${row.mile}` : "Site TBA"} · {row.direction}
      </p>
      <p className="mt-1 font-serif text-lg leading-tight font-semibold group-hover:underline group-hover:decoration-amber">
        {row.name}
      </p>
      <p className="mt-2 font-serif text-2xl font-semibold">
        {row.truckSpaces} <span className="text-xs font-sans font-semibold text-slate">truck spaces</span>
      </p>
      <span className="mt-1 block text-[11px] text-highway">
        {townName(row.nearestTown)} hub →
      </span>
    </>
  );
}

function StatusBadge({ status }: { status: SiteRow["status"] }) {
  return status === "open" ? (
    <span className="inline-block border border-highway px-2 py-0.5 text-[10px] font-bold tracking-[0.08em] text-highway uppercase">
      Open
    </span>
  ) : (
    <span className="inline-block border border-amber-dark px-2 py-0.5 text-[10px] font-bold tracking-[0.08em] text-amber-dark uppercase">
      Planned
    </span>
  );
}

export default function TruckParkingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${site.url}/truck-parking#page`,
        name: "Nebraska I-80 public truck parking by exit",
        url: absoluteUrl("/truck-parking"),
        description:
          "Public truck parking on Nebraska's I-80: rest-area stalls by mile marker and exit, plus the planned Dawson County project.",
        isPartOf: { "@id": `${site.url}/#website` },
        about: {
          "@type": "Place",
          name: "Interstate 80 in Nebraska",
          address: { "@type": "PostalAddress", addressRegion: "NE", addressCountry: "US" },
        },
      },
      {
        "@type": "ItemList",
        name: "Public truck parking on I-80 in Nebraska",
        numberOfItems: sites.length,
        itemListElement: sites.map((row, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name:
            row.mile != null
              ? `${row.name} — mile ${row.mile.toFixed(1)}`
              : `${row.name} — location to be announced`,
          url: `${absoluteUrl("/truck-parking")}#${row.id}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Truck parking", item: absoluteUrl("/truck-parking") },
        ],
      },
    ],
  };

  return (
    <DataPage
      jsonLd={jsonLd}
      kicker="Mile markers & exits"
      title="Public truck parking on I-80"
      intro={
        <>
          Every public truck-parking spot NDOT lists on I-80 in Nebraska:
          rest-area stalls and the state truck lots, ordered west to east.
          This page covers{" "}
          <strong className="text-ink">public rest-area and state parking only</strong>{" "}
          — private truck stops are not inventoried here. For the full
          rest-area picture, see our{" "}
          <Link href="/rest-areas" className="font-semibold text-highway underline decoration-amber underline-offset-2">
            I-80 rest-area guide
          </Link>
          .
        </>
      }
      current="/truck-parking"
    >
      <StartHere
        title="Largest open public lots"
        note="The four biggest public truck-parking sites in the NDOT guide. Counts are not live — confirm availability on 511."
      >
        {topSites.map((site) => (
          <AnchorCard key={site.id} id={site.id}>
            <TopSiteCardBody row={site} />
          </AnchorCard>
        ))}
      </StartHere>

      <div className="mt-4">
        <RestAreaMap
          variant="truck"
          areas={openSites.map((site) => ({
            id: site.id,
            name: site.name,
            milepost: site.mile,
            nearestExit: site.nearestExit ?? 0,
            truckOnly: false,
          }))}
        />
      </div>

      <DataSummary
        className="mt-4"
        items={[
          {
            value: openTruckSpaces.toLocaleString("en-US"),
            label: "open public truck spaces",
            detail: `${countedSites} sites with posted counts`,
          },
          {
            value: "~120",
            label: "planned in Dawson County",
            detail: "not open yet; release also cites ~92",
          },
          {
            value: "2015",
            label: "NDOT guide",
            detail: "counts may have changed; check 511",
          },
        ]}
      />

      <Explainer
        className="mt-4"
        items={[
          {
            title: "Public vs. private",
            body: (
              <>
                Rest areas and the Deuel County lot are free, state-run and
                open to any commercial driver. Private truck stops — fuel
                islands, reserved paid parking, showers — are a separate
                system this page does not track.
              </>
            ),
          },
          {
            title: "The rules",
            body: (
              <>
                NDOT prohibits camping at rest areas and limits stays to 10
                hours. Parking outside designated areas is prohibited — when
                the stalls fill, the legal move is the next lot, not the
                shoulder or the ramp.
              </>
            ),
          },
          {
            title: "Before a night run",
            body: (
              <>
                Check{" "}
                <a href="https://511.nebraska.gov/" className="font-semibold text-highway underline decoration-amber underline-offset-2">
                  Nebraska 511
                </a>{" "}
                for closures, and use a truck-parking app for private lots.
                For the corridor context, see our{" "}
                <Link href="/exits" className="font-semibold text-highway underline decoration-amber underline-offset-2">
                  exit guide
                </Link>
                .
              </>
            ),
          },
        ]}
      />

      {regions.map((region) => {
        const regionRows = sites.filter((row) => {
          if (row.mile == null) return region.name === "Central";
          return row.mile >= region.min && row.mile <= region.max;
        });
        if (!regionRows.length) return null;
        return (
          <RowSection<SiteRow>
            key={region.name}
            title={region.name}
            note={region.note}
            rows={regionRows}
            rowKey={(row) => row.id}
            rowId={(row) => row.id}
            mobileGap="2"
            minWidth="min-w-[52rem]"
            columns={[
              { label: "Site" },
              { label: "Mile" },
              { label: "Exit" },
              { label: "Truck spaces" },
              { label: "Status" },
              { label: "Notes" },
            ]}
            renderMobile={(row) => (
              <>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-serif text-lg leading-tight font-semibold">
                    {row.name}
                  </p>
                  <StatusBadge status={row.status} />
                </div>
                <p className="mt-1 text-[10px] font-bold tracking-[0.08em] text-slate uppercase">
                  {row.mile != null ? `Mile ${row.mile.toFixed(1)}${row.mileApproximate ? " ~" : ""}` : "Location TBA"} ·{" "}
                  {row.direction}
                </p>
                <p className="mt-2 font-serif text-xl font-semibold">
                  {formatSpaces(row.truckSpaces)}{" "}
                  <span className="text-xs font-sans font-semibold text-slate">truck spaces</span>
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-5 text-[12px]">
                  <Link
                    href={`/cities/${row.nearestTown}`}
                    className="inline-flex min-h-[44px] items-center font-medium text-highway underline decoration-amber underline-offset-2"
                  >
                    {townName(row.nearestTown)} hub →
                  </Link>
                  {row.nearestExit != null ? (
                    <Link
                      href={`/exits#exit-${row.nearestExit}`}
                      className="inline-flex min-h-[44px] items-center whitespace-nowrap text-highway underline decoration-amber underline-offset-2"
                    >
                      Exit {row.nearestExit} →
                    </Link>
                  ) : (
                    <span className="inline-flex min-h-[44px] items-center text-slate">
                      Exit TBA
                    </span>
                  )}
                </p>
                <p className="border-t border-line pt-2 text-[12px] leading-snug text-ink-soft">
                  {row.notes}
                </p>
              </>
            )}
            renderCells={(row) => (
              <>
                <td className="px-3 py-2 font-semibold">
                  {row.name}
                  <span className="mt-0.5 block text-[11px] font-normal text-slate capitalize">
                    {row.direction} · near{" "}
                    <Link
                      href={`/cities/${row.nearestTown}`}
                      className="font-medium text-highway underline decoration-amber underline-offset-2"
                    >
                      {townName(row.nearestTown)}
                    </Link>
                  </span>
                </td>
                <td className="px-3 py-2 tabular-nums whitespace-nowrap text-ink-soft">
                  {row.mile != null ? row.mile.toFixed(1) : "—"}
                  {row.mileApproximate && row.mile != null ? (
                    <span className="text-slate"> ~</span>
                  ) : null}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-ink-soft">
                  {row.nearestExit != null ? (
                    <Link
                      href={`/exits#exit-${row.nearestExit}`}
                      className="font-medium text-highway underline decoration-amber underline-offset-2"
                    >
                      Exit {row.nearestExit}
                    </Link>
                  ) : (
                    <span className="text-slate">TBA</span>
                  )}
                </td>
                <td className="px-3 py-2 font-serif text-lg font-semibold whitespace-nowrap">
                  {formatSpaces(row.truckSpaces)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <StatusBadge status={row.status} />
                </td>
                <td className="max-w-[22rem] px-3 py-2 text-[12px] leading-snug text-ink-soft">
                  {row.notes}
                </td>
              </>
            )}
          />
        );
      })}

      <section className="mt-10 border border-line bg-cream p-5 md:p-7">
        <p className="kicker text-amber-dark">Coming next</p>
        <h2 className="mt-1 font-serif text-2xl font-semibold">
          Dawson County: about 120 new stalls, still on paper
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">
          In November 2026 NDOT announced that USDOT selected a $7.46
          million INFRA grant for new public truck parking on I-80 between{" "}
          <Link href="/cities/kearney" className="font-semibold text-highway underline decoration-amber underline-offset-2">
            Elm Creek
          </Link>{" "}
          and{" "}
          <Link href="/cities/lexington" className="font-semibold text-highway underline decoration-amber underline-offset-2">
            Overton
          </Link>{" "}
          in Dawson County — a $15.5 million project in total. One
          paragraph of the release says approximately 120 new stalls;
          the director&apos;s quote in the same release says
          approximately 92. No site, mile markers, timeline or opening
          date have been announced. Read our full write-up:{" "}
          <Link
            href="/news/usdot-backs-120-new-i-80-truck-parking-stalls-in-dawson-county"
            className="font-semibold text-highway underline decoration-amber underline-offset-2"
          >
            USDOT backs 120 new I-80 truck parking stalls in Dawson County
          </Link>
          .
        </p>
      </section>

      <div className="mt-8 border-t border-line pt-4 text-[12px] leading-relaxed text-slate">
        <p className="font-serif text-base font-semibold text-ink">
          Sources &amp; last checked
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Truck-space counts:{" "}
            <a href="https://dot.nebraska.gov/media/fgceurxm/rest-areas.pdf" className="font-semibold text-highway underline decoration-amber underline-offset-2">
              NDOT Interstate 80 Rest Areas guide (Oct. 2015)
            </a>
            . The guide is a decade old — facilities may have been
            re-striped or reconfigured since, and short-term closures
            happen. Verify current availability on{" "}
            <a href="https://511.nebraska.gov/" className="font-semibold text-highway underline decoration-amber underline-offset-2">
              Nebraska 511
            </a>{" "}
            or by calling 511 before relying on a stall.
          </li>
          <li>
            Planned project:{" "}
            <a href="https://dot.nebraska.gov/media/tgzmld3a/20261105-comm-usdot-grants.pdf" className="font-semibold text-highway underline decoration-amber underline-offset-2">
              NDOT Nov. 5, 2026 release on USDOT grant selections
            </a>
            . The Dawson County stalls are planned capacity, not open
            parking.
          </li>
          <li>
            Exit numbers and mileposts cross-checked against our{" "}
            <Link href="/exits" className="font-semibold text-highway underline decoration-amber underline-offset-2">
              I-80 exit guide
            </Link>
            . Nearest-town links point to the closest corridor hub, not
            necessarily the closest community.
          </li>
        </ul>
        <p className="mt-2">
          Last checked: November 6, 2026. NDOT&apos;s official Rest Area
          Information page still linked the October 2015 guide on that
          date; no newer official capacity inventory was found. For
          emergencies on the interstate, use *55. Uncertainty we are carrying: the Goehner
          truck-only site has no published stall count; the Deuel County
          lot&apos;s milepost is approximate (at Exit 101); Melia Hill
          is 2 miles west of Exit 432, the Highway 31 interchange; and
          the Dawson County project&apos;s stall count (120 vs. 92) and
          location are unresolved in NDOT&apos;s own release.
        </p>
      </div>
    </DataPage>
  );
}
