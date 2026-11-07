import type { Metadata } from "next";
import Link from "next/link";
import { DataPage, RowSection, StartHere } from "@/components/data-page";
import { DataSummary } from "@/components/DataSummary";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/utils";
import demoData from "@/data/town-demographics.json";

export const metadata: Metadata = {
  title: "I-80 corridor town demographics",
  description:
    "Exact 2020 and 2010 Census counts, plus 2025 Census estimates, for the 12 I-80 corridor hubs: population change, counties, mile markers and exits.",
  alternates: { canonical: "/demographics" },
  openGraph: {
    url: `${site.url}/demographics`,
    title: "I-80 corridor town demographics | I-80 Things",
    description:
      "Exact 2020 and 2010 Census counts, plus 2025 Census estimates, for the 12 I-80 corridor hubs.",
  },
};

type Town = (typeof demoData.towns)[number];

const towns = demoData.towns as Town[];
const meta = demoData.meta;

function change(town: Town) {
  return town.pop2020 - town.pop2010;
}

function pctChange(town: Town) {
  return ((town.pop2020 - town.pop2010) / town.pop2010) * 100;
}

function fmtSigned(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toLocaleString("en-US")}`;
}

function fmtPct(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(1)}%`;
}

const combined2020 = towns.reduce((sum, t) => sum + t.pop2020, 0);
const combined2025 = towns.reduce((sum, t) => sum + t.pop2025, 0);
const largest = [...towns].sort((a, b) => b.pop2025 - a.pop2025).slice(0, 4);
const growth = towns.map((town) => ({
  ...town,
  pct2010to2025: (town.pop2025 / town.pop2010 - 1) * 100,
}));
const fastestGrowth = growth.reduce((best, town) =>
  town.pct2010to2025 > best.pct2010to2025 ? town : best,
);
const maxAbsGrowth = Math.max(
  ...growth.map((town) => Math.abs(town.pct2010to2025)),
  1,
);

function changeTone(delta: number) {
  return delta > 0
    ? "font-semibold text-highway"
    : delta < 0
      ? "font-semibold text-alert"
      : "text-ink-soft";
}

export default function DemographicsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${site.url}/demographics#page`,
        name: "I-80 corridor town demographics",
        url: absoluteUrl("/demographics"),
        description:
          "Exact 2020 and 2010 decennial Census counts plus 2025 population estimates for the 12 I-80 corridor hubs.",
        isPartOf: { "@id": `${site.url}/#website` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: towns.length,
          itemListElement: towns.map((town, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: `${town.town}, Nebraska — 2020 population ${town.pop2020.toLocaleString("en-US")}`,
            url: absoluteUrl(`/cities/${town.slug}`),
          })),
        },
      },
      {
        "@type": "Dataset",
        name: "I-80 corridor town demographics, 2010–2025",
        description:
          "Decennial Census counts (2010 and 2020) plus Vintage 2025 estimates for the 12 I-80 corridor hub towns, with county population, change, mile markers and main exits.",
        url: absoluteUrl("/demographics"),
        creator: {
          "@type": "Organization",
          name: "I-80 Things",
        },
        isBasedOn: "https://www.census.gov/",
        temporalCoverage: "2010/2025",
        dateModified: meta.lastVerified,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          {
            "@type": "ListItem",
            position: 2,
            name: "Demographics",
            item: absoluteUrl("/demographics"),
          },
        ],
      },
    ],
  };

  return (
    <DataPage
      jsonLd={jsonLd}
      kicker="Kimball to Omaha · 2010 Census → 2020 Census → 2025 estimate"
      title="I-80 corridor town demographics"
      intro={
        <>
          Exact decennial Census counts for 2010 and 2020, plus the latest
          Vintage 2025 estimates, for the 12 corridor hubs — not the rounded
          figures on the{" "}
          <Link
            href="/cities"
            className="font-semibold text-highway underline decoration-amber underline-offset-2"
          >
            corridor town pages
          </Link>
          . Hastings rides the US-281 spur south of Exit 312; the other
          eleven sit directly on I-80.
        </>
      }
      current="/demographics"
    >
      <StartHere
        title="The largest corridor hubs"
        note="2025 Census estimate inside city limits; 2020 Census count below. The full 12-town table is below."
      >
        {largest.map((town) => (
          <Link
            key={town.slug}
            href={`/cities/${town.slug}`}
            className="group border border-line bg-cream p-4 hover:border-ink"
          >
            <p className="text-[10px] font-bold tracking-[0.08em] text-slate uppercase">
              {town.county}
            </p>
            <p className="mt-1 font-serif text-xl leading-tight font-semibold group-hover:underline group-hover:decoration-amber">
              {town.town}
            </p>
            <p className="mt-2 font-serif text-2xl font-semibold">
              {town.pop2025.toLocaleString("en-US")}
            </p>
            <p className="mt-1 text-[10px] text-slate">
              2025 estimate · 2020: {town.pop2020.toLocaleString("en-US")}
            </p>
            <p className="mt-1 text-[11px] text-highway">
              City hub →
            </p>
          </Link>
        ))}
      </StartHere>

      <DataSummary
        className="mt-4"
        items={[
          {
            value: combined2025.toLocaleString("en-US"),
            label: "combined 2025 population",
            detail: `2020 Census: ${combined2020.toLocaleString("en-US")}`,
          },
          {
            value: towns.length,
            label: "corridor hubs",
            detail: "11 on I-80 + Hastings spur",
          },
          {
            value: fmtPct(fastestGrowth.pct2010to2025),
            label: `${fastestGrowth.town}, 2010–2025`,
            detail: "fastest-growing hub",
          },
        ]}
      />

      <section className="mt-8 border border-line bg-paper p-5 md:p-7">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="kicker text-amber-dark">Visual comparison</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold">
              Population change by hub
            </h2>
          </div>
          <p className="text-[11px] text-slate">
            Vintage 2025 estimate vs. 2010 Census
          </p>
        </div>
        <ul className="mt-5 space-y-3">
          {growth.map((town) => {
            const up = town.pct2010to2025 >= 0;
            return (
              <li key={town.slug}>
                <div className="flex items-baseline justify-between gap-3 text-[12px]">
                  <span className="font-semibold text-ink">{town.town}</span>
                  <span
                    className={`shrink-0 tabular-nums font-semibold ${
                      up ? "text-highway" : "text-amber-dark"
                    }`}
                  >
                    {up ? "+" : ""}
                    {town.pct2010to2025.toFixed(1)}%
                  </span>
                </div>
                <div
                  className="relative mt-1 h-2.5 w-full bg-cream"
                  aria-hidden="true"
                >
                  <span className="absolute inset-y-0 left-1/2 w-px bg-line" />
                  <span
                    className={`absolute top-0 h-2.5 ${
                      up ? "left-1/2 bg-highway" : "right-1/2 bg-amber-dark"
                    }`}
                    style={{
                      width: `${(Math.abs(town.pct2010to2025) / maxAbsGrowth) * 50}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate">
                  2025: {town.pop2025.toLocaleString("en-US")} · 2010:{" "}
                  {town.pop2010.toLocaleString("en-US")}
                </p>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 border-t border-line pt-3 text-[10px] text-slate">
          Green = growth. Amber = decline. Bars are scaled to the largest
          change, not to total population.
        </p>
      </section>

      <RowSection<Town>
        title="The 12 hubs, west to east"
        note={
          <Link
            href="/exits"
            className="inline-flex min-h-[44px] items-center kicker text-highway hover:text-amber-dark"
          >
            All I-80 exits →
          </Link>
        }
        rows={towns}
        rowKey={(town) => town.slug}
        minWidth="min-w-[56rem]"
        columns={[
          { label: "Town" },
          { label: "County (2020)" },
          { label: "2020", className: "text-right" },
          { label: "2025 est.", className: "text-right" },
          { label: "2010", className: "text-right" },
          { label: "Change 2010–20", className: "text-right" },
          { label: "I-80 miles" },
          { label: "Main exits" },
        ]}
        footer={
          <p className="text-[12px] leading-relaxed text-slate">
            Source: U.S. Census Bureau — 2020 and 2010 decennial counts, plus
            the Vintage 2025 city estimates (July 1, 2025). Last checked{" "}
            {meta.lastVerified}. Census counts are April 1; the 2025 column is
            an estimate, not a census. Populations cover incorporated city
            limits. Hastings is reached via US-281 south from Exit 312, about
            16 miles off the interstate.
          </p>
        }
        renderMobile={(town) => {
          const delta = change(town);
          const pct = pctChange(town);
          return (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Link
                  href={`/cities/${town.slug}`}
                  className="inline-flex min-h-[44px] items-center font-serif text-xl leading-tight font-semibold text-highway underline decoration-amber underline-offset-2"
                >
                  {town.town}
                </Link>
                <span className={`text-sm tabular-nums ${changeTone(delta)}`}>
                  {fmtSigned(delta)} · {fmtPct(pct)}
                </span>
              </div>
              {!town.onInterstate ? (
                <p className="mt-1 inline-block rounded-sm bg-cream px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-amber-dark uppercase">
                  US-281 spur
                </p>
              ) : null}
              <dl className="mt-2 grid grid-cols-2 gap-2 text-[12px] leading-relaxed text-ink-soft">
                <div>
                  <dt className="text-[10px] font-bold tracking-[0.08em] text-slate uppercase">
                    2025 est.
                  </dt>
                  <dd className="tabular-nums">
                    {town.pop2025.toLocaleString("en-US")}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold tracking-[0.08em] text-slate uppercase">
                    2020
                  </dt>
                  <dd className="tabular-nums">
                    {town.pop2020.toLocaleString("en-US")}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold tracking-[0.08em] text-slate uppercase">
                    2010
                  </dt>
                  <dd className="tabular-nums">
                    {town.pop2010.toLocaleString("en-US")}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold tracking-[0.08em] text-slate uppercase">
                    County
                  </dt>
                  <dd>
                    {town.county} ·{" "}
                    {town.countyPop2020.toLocaleString("en-US")}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold tracking-[0.08em] text-slate uppercase">
                    I-80
                  </dt>
                  <dd className="tabular-nums">
                    Miles {town.mileMarker} · {town.exits}
                  </dd>
                </div>
              </dl>
            </>
          );
        }}
        renderCells={(town) => {
          const delta = change(town);
          const pct = pctChange(town);
          return (
            <>
              <td className="px-3 py-2 font-semibold">
                <Link
                  href={`/cities/${town.slug}`}
                  className="text-highway underline decoration-amber underline-offset-2"
                >
                  {town.town}
                </Link>
                {!town.onInterstate ? (
                  <span className="ml-2 inline-block rounded-sm bg-cream px-1.5 py-0.5 align-middle text-[10px] font-bold tracking-wide text-amber-dark uppercase">
                    US-281 spur
                  </span>
                ) : null}
              </td>
              <td className="px-3 py-2 text-[12px] whitespace-nowrap text-ink-soft">
                {town.county} · {town.countyPop2020.toLocaleString("en-US")}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-ink-soft">
                {town.pop2020.toLocaleString("en-US")}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-ink-soft">
                {town.pop2025.toLocaleString("en-US")}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-ink-soft">
                {town.pop2010.toLocaleString("en-US")}
              </td>
              <td className={`px-3 py-2 text-right tabular-nums whitespace-nowrap ${changeTone(delta)}`}>
                {fmtSigned(delta)} · {fmtPct(pct)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap tabular-nums text-ink-soft">
                {town.mileMarker}
              </td>
              <td className="max-w-[14rem] px-3 py-2 text-[12px] leading-snug text-ink-soft">
                {town.exits}
              </td>
            </>
          );
        }}
      />

      <section className="mt-10 border border-line bg-cream p-5 md:p-7">
        <h2 className="font-serif text-2xl font-semibold">Methodology</h2>
        <div className="mt-3 max-w-3xl space-y-3 text-sm leading-relaxed text-ink-soft">
          <p>
            Town figures are the Census Bureau&apos;s place-level Table P1
            total population for 2020 and the equivalent 2010 count,
            matched to the Census place names (for example,{" "}
            <span className="font-semibold">“Omaha city”</span>). The 2025
            column is the Vintage 2025 estimate for July 1, 2025 — later
            than the 2020 census, but an estimate. County figures are the
            2020 Table P1 county totals. No statewide rank is shown because
            ranks shift with each boundary update and are easy to get wrong.
          </p>
          <p>
            Change is the simple arithmetic difference between the two
            April 1 counts; percent change is that difference divided by
            the 2010 count. Mile markers and exits match the{" "}
            <Link
              href="/exits"
              className="font-semibold text-highway underline decoration-amber underline-offset-2"
            >
              I-80 exit guide
            </Link>{" "}
            and each town&apos;s{" "}
            <Link
              href="/cities"
              className="font-semibold text-highway underline decoration-amber underline-offset-2"
            >
              city hub
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="mt-10 border-t-2 border-ink pt-4">
        <h2 className="font-serif text-2xl font-semibold">
          What this does and does not mean
        </h2>
        <div className="mt-3 max-w-3xl space-y-3 text-sm leading-relaxed text-ink-soft">
          <p>
            This table says how many people the Census counted inside each
            city&apos;s legal boundaries on two dates. It does not count
            the surrounding metro area — Omaha&apos;s suburbs, for example,
            live mostly outside the city line — and it does not say why a
            town grew or shrank. A smaller 2020 count can reflect fewer
            residents, a boundary change, or a different count, and a larger
            one says nothing by itself about jobs, housing, or traffic on
            I-80.
          </p>
          <p>
            Use it as a reference for the size of each stop on the drive,
            not as an explanation of what is happening in these towns. For
            the current picture in each place, start with its{" "}
            <Link
              href="/cities"
              className="font-semibold text-highway underline decoration-amber underline-offset-2"
            >
              city hub
            </Link>
            .
          </p>
        </div>
      </section>

      <p className="mt-8 border-t border-line pt-4 text-[12px] leading-relaxed text-slate">
        Counts come from the Census Bureau&apos;s decennial census, not
        from later estimates, and were last checked {meta.lastVerified}.
        City populations cover incorporated city limits only; county
        populations cover the full county, including towns not listed here.
      </p>
    </DataPage>
  );
}
