import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlace, places } from "@/data/places";
import { firstMile, mileRange } from "@/lib/corridor-position";
import { getAllPosts, getPostsByCity } from "@/lib/content";
import { getSourcesForPlace } from "@/lib/sources";
import { getPointForecast } from "@/lib/nws";
import { getRoadConditions } from "@/lib/road-conditions";
import { site } from "@/lib/site";
import { absoluteUrl, formatDateTime } from "@/lib/utils";
import { SectionHeading, StandardCard } from "@/components/PostCards";
import { JsonLd } from "@/components/JsonLd";
import { AdSlot } from "@/components/AdSlot";
import { Arrow, Icon } from "@/components/Icon";
import { topicLabel } from "@/data/topics";

export const revalidate = 300;

export function generateStaticParams() {
  return places.map((place) => ({ slug: place.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const place = getPlace(slug);
  if (!place) return {};
  const title = `${place.name}, Nebraska — I-80 exits, news and conditions`;
  const description = `${place.name}, Nebraska: I-80 exits ${place.exit}, mile ${place.mileMarker}. Local news, road conditions and sources.`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/cities/${place.slug}` },
    openGraph: {
      url: absoluteUrl(`/cities/${place.slug}`),
      title,
      description,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(`${place.name}, Nebraska`)}&kicker=${encodeURIComponent(`I-80 · MILE ${place.mileMarker}`)}`,
          width: 1200,
          height: 675,
        },
      ],
    },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = getPlace(slug);
  if (!place) notFound();

  const localPosts = getPostsByCity(place.slug);
  const statewide = getAllPosts().filter((p) => p.city === "statewide");
  const posts = localPosts.length > 0 ? localPosts : statewide.slice(0, 4);
  const sources = getSourcesForPlace(place.slug);
  const [roads, forecast] = await Promise.all([
    getRoadConditions(),
    getPointForecast(place.lat, place.lon),
  ]);
  const range = mileRange(place.mileMarker);
  const bounds = range
    ? { min: range.min - 15, max: range.max + 15 }
    : null;
  const localRoadEvents = bounds
    ? roads.events
        .filter((event) => {
          const mile = Number(event.location?.primaryLinearReference);
          return Number.isFinite(mile) && mile >= bounds.min && mile <= bounds.max;
        })
        .slice(0, 3)
    : [];
  const index = places.findIndex((p) => p.slug === place.slug);
  const west = places[index - 1];
  const east = places[index + 1];
  const nearby = place.nearby
    .map((name) => places.find((p) => p.slug === name || p.name === name))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 4);
  for (const candidate of [west, east, ...places]) {
    if (nearby.length >= 4 || !candidate || candidate.slug === place.slug) break;
    if (!nearby.some((p) => p.slug === candidate.slug)) nearby.push(candidate);
  }

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Place",
              name: `${place.name}, Nebraska`,
              url: absoluteUrl(`/cities/${place.slug}`),
              description: place.blurb,
              address: {
                "@type": "PostalAddress",
                addressLocality: place.name,
                addressRegion: "NE",
                addressCountry: "US",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: place.lat,
                longitude: place.lon,
              },
              containedInPlace: {
                "@type": "AdministrativeArea",
                name: place.county,
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: site.url },
                { "@type": "ListItem", position: 2, name: "Corridor towns", item: `${site.url}/cities` },
                { "@type": "ListItem", position: 3, name: place.name, item: absoluteUrl(`/cities/${place.slug}`) },
              ],
            },
            {
              "@type": "ItemList",
              name: `Stories about ${place.name}`,
              itemListElement: posts.slice(0, 10).map((post, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: absoluteUrl(`/news/${post.slug}`),
                name: post.title,
              })),
            },
          ],
        }}
      />

      <header className="border-b border-line bg-cream">
        <div className="container-page py-9 md:py-12">
          <nav aria-label="Breadcrumb" className="mb-4 text-[11px] font-medium tracking-wide text-slate">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link href="/" className="hover:text-ink">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/cities" className="hover:text-ink">Corridor towns</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-ink">{place.name}</li>
            </ol>
          </nav>
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="kicker text-amber-dark">{place.county} · I-80 mile {place.mileMarker}</p>
              <h1 className="mt-2 font-serif text-4xl leading-[1.03] font-semibold tracking-tight md:text-6xl">
                {place.name}, Nebraska
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate">
                {place.blurb}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {place.knownFor.map((item) => (
                  <span key={item} className="border border-line bg-paper px-2.5 py-1 text-[10px] font-bold tracking-[0.06em] text-ink-soft uppercase">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px border border-line bg-line text-center md:w-64">
              <div className="bg-paper p-3">
                <p className="kicker text-slate">Mile</p>
                <p className="mt-1 font-serif text-2xl font-semibold">{place.mileMarker}</p>
              </div>
              <div className="bg-paper p-3">
                <p className="kicker text-slate">Exits</p>
                <p className="mt-1 text-xs leading-tight font-semibold">{place.exit}</p>
              </div>
              <div className="col-span-2 bg-paper p-3">
                <p className="kicker text-slate">Population</p>
                <p className="mt-1 font-serif text-xl font-semibold">
                  {place.population ? place.population.toLocaleString("en-US") : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container-page py-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
          <div>
            <section className="mb-10 border border-line bg-paper p-5 md:p-7">
              <p className="kicker text-amber-dark">Local guide</p>
              <h2 className="mt-1 font-serif text-2xl font-semibold md:text-3xl">
                {place.name} at a glance
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-soft md:text-[15px]">
                {place.localGuide.intro}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {place.localGuide.highlights.map((item) => (
                  <div key={item.title} className="border border-line bg-cream p-4">
                    <h3 className="font-serif text-base font-semibold">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-slate">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[10px] leading-relaxed text-slate">
                Service hours, fuel prices and road conditions change. Verify
                before you rely on them. This guide is reviewed with the town
                hub; see the source desk for the official feeds we monitor.
              </p>
            </section>

            <SectionHeading
              title={localPosts.length ? `Latest from ${place.name}` : "Statewide reporting that affects the corridor"}
              href="/news"
              kicker={localPosts.length ? `${localPosts.length} local stor${localPosts.length === 1 ? "y" : "ies"}` : "Start here"}
            />
            <div className="grid gap-8 sm:grid-cols-2">
              {posts.map((post, i) => (
                <StandardCard key={post.slug} post={post} priority={i === 0} />
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {["road-conditions", "weather", "crashes", "travel"].map((topic) => (
                <Link
                  key={topic}
                  href={`/topics/${topic}`}
                  className="border border-line px-3 py-1.5 text-[10px] font-bold tracking-[0.08em] text-ink-soft uppercase hover:border-ink"
                >
                  {topicLabel(topic)}
                </Link>
              ))}
            </div>

            <section className="mt-10 border-t-2 border-ink pt-4">
              <div className="flex items-end justify-between gap-4">
                <h2 className="font-serif text-2xl font-semibold">
                  Live on I-80 near {place.name}
                </h2>
                <Link
                  href="/conditions"
                  className="kicker text-highway hover:text-amber-dark"
                >
                  Full corridor status
                </Link>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-slate">
                Nebraska 511 events within roughly 15 miles of {place.name}.
                Unofficial reader; confirm with 511 before you drive.
              </p>
              {localRoadEvents.length ? (
                <ul className="mt-3 space-y-2">
                  {localRoadEvents.map((event) => (
                    <li key={event.id} className="border border-line bg-paper p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="border border-amber-dark bg-amber/10 px-1.5 py-0.5 text-[8px] font-bold tracking-[0.08em] text-amber-dark uppercase">
                          {event.category}
                        </span>
                        {event.location?.primaryLinearReference ? (
                          <span className="text-[9px] font-bold tracking-wide text-slate uppercase">
                            Mile {Number(event.location.primaryLinearReference).toFixed(1)}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-[13px] leading-snug font-semibold">
                        {event.title}
                      </p>
                      <p className="mt-1 text-[10px] text-slate">
                        {event.lastUpdated
                          ? `Updated ${formatDateTime(event.lastUpdated)}`
                          : event.agency ?? "Nebraska 511"}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 border border-line bg-paper p-3 text-[12px] leading-relaxed text-slate">
                  {roads.error
                    ? "The 511 reader is unavailable right now. Check the official map before you drive."
                    : "No I-80 events within about 15 miles were returned. That does not guarantee a clear stretch — check 511 and the weather."}
                </p>
              )}
            </section>

            <AdSlot
              slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD}
              minHeight={90}
              className="mt-10"
            />

            <section className="mt-10 border-t-2 border-ink pt-4">
              <h2 className="font-serif text-2xl font-semibold">Getting there & getting around</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate">
                {place.name} is served by {place.exit}. Before you drive, check
                live closures and conditions on Nebraska 511. The nearest
                full-service stops are listed below; the{" "}
                <Link href="/exits" className="font-semibold text-highway underline decoration-amber underline-offset-2">
                  full exit guide
                </Link>{" "}
                has every interchange and mile marker.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <a
                  href="https://511.nebraska.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group border border-line p-4 hover:border-ink"
                >
                  <span className="kicker text-amber-dark">Live conditions</span>
                  <span className="mt-1 flex items-center justify-between font-serif text-lg font-semibold">
                    Nebraska 511 <Arrow className="h-4 w-4 text-slate" />
                  </span>
                  <span className="mt-1 block text-[12px] text-slate">
                    Closures, cameras and plows near mile {firstMile(place.mileMarker)}
                  </span>
                </a>
                <a
                  href={`https://www.google.com/maps/place/${encodeURIComponent(`${place.name}, NE`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group border border-line p-4 hover:border-ink"
                >
                  <span className="kicker text-amber-dark">Location</span>
                  <span className="mt-1 flex items-center justify-between font-serif text-lg font-semibold">
                    Map & directions <Arrow className="h-4 w-4 text-slate" />
                  </span>
                  <span className="mt-1 block text-[12px] text-slate">
                    {place.name}, {place.county}
                  </span>
                </a>
                <Link
                  href="/exits"
                  className="group border border-line p-4 hover:border-ink"
                >
                  <span className="kicker text-amber-dark">All exits</span>
                  <span className="mt-1 flex items-center justify-between font-serif text-lg font-semibold">
                    I-80 exit guide <Arrow className="h-4 w-4 text-slate" />
                  </span>
                  <span className="mt-1 block text-[12px] text-slate">
                    Every exit, mile marker and nearest town
                  </span>
                </Link>
              </div>
            </section>
          </div>

          <aside className="space-y-7">
            <div className="border border-line bg-paper p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="kicker text-slate">Weather</h2>
                <a
                  href={`https://forecast.weather.gov/MapClick.php?lat=${place.lat}&lon=${place.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] font-bold tracking-[0.08em] text-highway uppercase hover:text-amber-dark"
                >
                  NWS forecast
                </a>
              </div>
              {forecast.length ? (
                <ul className="mt-3 divide-y divide-line">
                  {forecast.map((period) => (
                    <li key={`${period.name}-${period.isDaytime}`} className="py-2 first:pt-0 last:pb-0">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[11px] font-bold tracking-wide text-ink uppercase">
                          {period.name}
                        </span>
                        <span className="font-serif text-lg leading-none font-semibold">
                          {period.temperature}°{period.temperatureUnit}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] leading-snug text-slate">
                        {period.shortForecast}
                        {period.windSpeed ? ` · ${period.windDirection} ${period.windSpeed}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-[12px] leading-relaxed text-slate">
                  Forecast unavailable right now. Check the NWS before you
                  drive.
                </p>
              )}
              <p className="mt-3 border-t border-line pt-2 text-[9px] leading-relaxed text-slate">
                Point forecast near {place.name}, not a road report. Winter
                conditions can differ on I-80.
              </p>
            </div>

            <div className="border border-line p-4">
              <h2 className="kicker text-slate">Local sources</h2>
              {sources.length ? (
                <ul className="mt-3 space-y-2.5">
                  {sources.map((source) => (
                    <li key={source.id}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2 text-[13px] leading-snug text-ink-soft hover:text-ink"
                      >
                        <Icon
                          name={source.category === "scanner" ? "scanner" : "link"}
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-dark"
                        />
                        <span>
                          {source.name}
                          <span className="block text-[9px] tracking-wide text-slate uppercase">
                            {source.kind === "scanner" ? "Scanner" : source.kind === "rss" ? "News feed" : source.reliability}
                          </span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[13px] leading-relaxed text-slate">
                  No dedicated local feed yet. We monitor statewide sources and
                  add town-level feeds as we verify them.
                </p>
              )}
              <Link href="/sources" className="mt-3 block text-[10px] font-bold tracking-[0.08em] text-highway uppercase hover:text-amber-dark">
                Full source directory →
              </Link>
            </div>

            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR} minHeight={250} />

            <div className="border border-line p-4">
              <h2 className="kicker text-slate">Neighboring exits</h2>
              <ul className="mt-2 divide-y divide-line">
                {west ? (
                  <li className="py-2 first:pt-0 last:pb-0">
                    <Link href={`/cities/${west.slug}`} className="group flex items-center justify-between text-[13px]">
                      <span className="font-semibold group-hover:text-amber-dark">{west.name}</span>
                      <span className="text-[10px] text-slate">MM {west.mileMarker} · West</span>
                    </Link>
                  </li>
                ) : null}
                {east ? (
                  <li className="py-2 first:pt-0 last:pb-0">
                    <Link href={`/cities/${east.slug}`} className="group flex items-center justify-between text-[13px]">
                      <span className="font-semibold group-hover:text-amber-dark">{east.name}</span>
                      <span className="text-[10px] text-slate">MM {east.mileMarker} · East</span>
                    </Link>
                  </li>
                ) : null}
                {nearby.slice(0, 2).map((p) => (
                  <li key={p.slug} className="py-2">
                    <Link href={`/cities/${p.slug}`} className="group flex items-center justify-between text-[13px]">
                      <span className="font-semibold group-hover:text-amber-dark">{p.name}</span>
                      <span className="text-[10px] text-slate">MM {p.mileMarker}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-ink bg-ink p-4 text-paper">
              <p className="kicker text-amber">Local tip?</p>
              <p className="mt-2 text-[13px] leading-relaxed text-cream/75">
                Something happening in {place.name}? Send it to the desk. We
                verify before we publish.
              </p>
              <Link
                href="/contact"
                className="mt-3 inline-block border border-cream/30 px-3 py-2 text-[10px] font-bold tracking-[0.1em] uppercase hover:border-paper"
              >
                Send a tip
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
