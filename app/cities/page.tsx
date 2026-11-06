import type { Metadata } from "next";
import Link from "next/link";
import { places } from "@/data/places";
import { getAllPosts } from "@/lib/content";
import { JsonLd } from "@/components/JsonLd";
import { AdSlot } from "@/components/AdSlot";
import { site } from "@/lib/site";
import { Arrow } from "@/components/Icon";

export const metadata: Metadata = {
  title: "I-80 corridor towns in Nebraska",
  description:
    "Every town on Nebraska's I-80 corridor, from Kimball at mile 22 to Omaha at mile 454 — mile markers, exits, counties and local coverage.",
  alternates: { canonical: "/cities" },
  openGraph: {
    url: `${site.url}/cities`,
    title: "I-80 corridor towns in Nebraska | I-80 Things",
    description: "Mile markers, exits and local coverage for every I-80 town in Nebraska.",
  },
};

function firstMile(mileMarker: string): number {
  const numbers = mileMarker.match(/\d+/g)?.map(Number) ?? [];
  return numbers.length ? Math.min(...numbers) : 0;
}

export default function CitiesPage() {
  const posts = getAllPosts();
  const count = new Map<string, number>();
  for (const post of posts) count.set(post.city, (count.get(post.city) ?? 0) + 1);
  const ordered = [...places].sort((a, b) => firstMile(a.mileMarker) - firstMile(b.mileMarker));

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "I-80 corridor towns in Nebraska",
          url: `${site.url}/cities`,
          isPartOf: { "@id": `${site.url}/#website` },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: places.map((place, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: `${place.name}, Nebraska`,
              url: `${site.url}/cities/${place.slug}`,
            })),
          },
        }}
      />

      <header className="border-b border-line bg-cream">
        <div className="container-page py-10 md:py-14">
          <p className="kicker text-amber-dark">Mile 22 to mile 454</p>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl leading-[1.05] font-semibold tracking-tight md:text-6xl">
            The towns on Nebraska&apos;s I-80
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate">
            Eleven on-corridor hubs, plus Hastings and the towns that fill the
            gaps. Each page collects our reporting, the mile markers, the exits,
            a local guide and the sources we monitor. For the complete list, use
            the{" "}
            <Link href="/exits" className="font-semibold text-highway underline decoration-amber underline-offset-2">
              I-80 exit guide
            </Link>
            .
          </p>
        </div>
      </header>

      <div className="container-page py-10">
        <div className="grid gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
          {places.map((place) => {
            const placePosts = posts.filter(
              (p) => p.city === place.slug || (p.city === "statewide" && p.tags.includes(place.slug)),
            );
            return (
              <Link
                key={place.slug}
                href={`/cities/${place.slug}`}
                className="group flex flex-col bg-paper p-5 transition hover:bg-cream"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-serif text-2xl font-semibold group-hover:underline group-hover:decoration-amber group-hover:decoration-2 group-hover:underline-offset-4">
                    {place.name}
                  </h2>
                  <span className="shrink-0 text-[10px] font-bold tracking-wider text-amber-dark">
                    MM {place.mileMarker}
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] font-semibold tracking-[0.1em] text-slate uppercase">
                  {place.county}
                </p>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-ink-soft">
                  {place.blurb}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-2.5 text-[10px] font-bold tracking-[0.08em] uppercase">
                  <span className="text-slate">
                    {placePosts.length} stor{placePosts.length === 1 ? "y" : "ies"}
                  </span>
                  <span className="flex items-center gap-1 text-highway">
                    Visit hub <Arrow className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 border border-line bg-cream p-5 md:p-7">
          <h2 className="font-serif text-2xl font-semibold">Not on the interstate?</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate">
            Hastings sits about 16 miles south of Exit 312 via US-281, and it is
            one of the corridor&apos;s biggest markets. We also track Fremont,
            Columbus, Beatrice and McCook when their news spills onto I-80.
          </p>
          <Link
            href="/sources"
            className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.08em] text-highway uppercase hover:text-amber-dark"
          >
            See the full source list <Arrow className="h-3.5 w-3.5" />
          </Link>
        </div>

        <section className="mt-10 border-t-2 border-ink pt-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-serif text-2xl font-semibold">Corridor town comparison</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate">
                Mile markers, exits and population in one table. Populations are
                approximate; use the Census link on each hub for the exact count.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/exits"
                className="kicker text-highway hover:text-amber-dark"
              >
                All I-80 exits →
              </Link>
              <Link
                href="/demographics"
                className="kicker text-highway hover:text-amber-dark"
              >
                Demographics →
              </Link>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto border border-line">
            <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
              <thead className="bg-cream text-[10px] tracking-[0.12em] text-slate uppercase">
                <tr>
                  <th className="px-3 py-2 font-semibold">Town</th>
                  <th className="px-3 py-2 font-semibold">County</th>
                  <th className="px-3 py-2 font-semibold">I-80 miles</th>
                  <th className="px-3 py-2 font-semibold">Main exits</th>
                  <th className="px-3 py-2 font-semibold">Population</th>
                  <th className="px-3 py-2 font-semibold">Local stories</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {ordered.map((place) => (
                  <tr key={place.slug} className="bg-paper">
                    <td className="px-3 py-2 font-semibold">
                      <Link
                        href={`/cities/${place.slug}`}
                        className="text-highway underline decoration-amber underline-offset-2"
                      >
                        {place.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[12px] text-ink-soft">{place.county}</td>
                    <td className="px-3 py-2 tabular-nums text-ink-soft">{place.mileMarker}</td>
                    <td className="px-3 py-2 text-[12px] text-ink-soft">{place.exit}</td>
                    <td className="px-3 py-2 tabular-nums text-ink-soft">
                      {place.population ? place.population.toLocaleString("en-US") : "—"}
                    </td>
                    <td className="px-3 py-2 tabular-nums text-ink-soft">
                      {count.get(place.slug) ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <AdSlot
          slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD}
          minHeight={90}
          className="mt-10"
        />
      </div>
    </main>
  );
}
