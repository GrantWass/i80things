import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "I-80 Nebraska data & reference pages",
  description:
    "Original I-80 Nebraska reference data: exits, rest areas, public truck parking, construction, town demographics and hub distances.",
  alternates: { canonical: "/data" },
};

const pages = [
  {
    href: "/exits",
    title: "Exit guide",
    description:
      "Every Nebraska I-80 exit, mile marker, connecting road and nearest corridor town.",
    stat: "79 exits",
  },
  {
    href: "/rest-areas",
    title: "Rest areas & services",
    description:
      "The state's I-80 rest areas, truck and car parking, amenities and the nearest town.",
    stat: "2015 NDOT guide",
  },
  {
    href: "/truck-parking",
    title: "Public truck parking",
    description:
      "Public rest-area truck capacity by mile and exit, plus the planned Dawson County expansion.",
    stat: "By exit",
  },
  {
    href: "/construction",
    title: "Construction tracker",
    description:
      "Current I-80 work zones and closures from Nebraska 511, grouped by NDOT district.",
    stat: "Updated every 5 min",
  },
  {
    href: "/demographics",
    title: "Town demographics",
    description:
      "Exact 2020 and 2010 Census counts for the corridor's town hubs, with county totals.",
    stat: "Census 2020",
  },
  {
    href: "/distances",
    title: "Hub distances & times",
    description:
      "Estimated mile-by-mile legs between corridor hubs, with 65 and 70 mph planning times.",
    stat: "Estimates",
  },
];

export default function DataPage() {
  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": `${site.url}/data#page`,
              name: "I-80 Nebraska data & reference pages",
              url: absoluteUrl("/data"),
              description:
                "Original I-80 Nebraska reference data: exits, rest areas, truck parking, construction, demographics and distances.",
              isPartOf: { "@id": `${site.url}/#website` },
            },
            {
              "@type": "ItemList",
              name: "I-80 Things data pages",
              itemListElement: pages.map((page, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: page.title,
                url: absoluteUrl(page.href),
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: site.url },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Data",
                  item: absoluteUrl("/data"),
                },
              ],
            },
          ],
        }}
      />

      <header className="border-b border-line bg-cream">
        <div className="container-page py-10 md:py-14">
          <p className="kicker text-amber-dark">Reference desk</p>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl leading-[1.05] font-semibold tracking-tight md:text-6xl">
            I-80 Nebraska data pages
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate">
            Original reference pages built from NDOT, Nebraska 511, the Census
            Bureau and the corridor&apos;s own exit data. Each page names its
            source and says what it does not claim.
          </p>
        </div>
      </header>

      <div className="container-page py-10">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-px border border-line bg-line sm:grid-cols-2">
            {pages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="group flex flex-col bg-paper p-6 transition hover:bg-cream"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-serif text-2xl font-semibold group-hover:underline group-hover:decoration-amber group-hover:decoration-2 group-hover:underline-offset-4">
                    {page.title}
                  </h2>
                  <span className="shrink-0 text-[10px] font-bold tracking-wide text-amber-dark uppercase">
                    {page.stat}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {page.description}
                </p>
                <span className="mt-4 text-[10px] font-bold tracking-[0.1em] text-highway uppercase">
                  Open page →
                </span>
              </Link>
            ))}
          </div>

          <p className="mt-8 border-t border-line pt-4 text-[12px] leading-relaxed text-slate">
            For live closures and cameras, use{" "}
            <Link href="/conditions" className="font-semibold text-highway underline decoration-amber underline-offset-2">
              corridor conditions
            </Link>{" "}
            or{" "}
            <a href="https://511.nebraska.gov/" className="font-semibold text-highway underline decoration-amber underline-offset-2">
              Nebraska 511
            </a>
            . For the reporting behind these pages, see the{" "}
            <Link href="/sources" className="font-semibold text-highway underline decoration-amber underline-offset-2">
              source desk
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
