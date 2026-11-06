import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, getFeaturedPosts } from "@/lib/content";
import { getCorridorAlerts } from "@/lib/nws";
import { site } from "@/lib/site";
import { places } from "@/data/places";
import { topics } from "@/data/topics";
import { LeadCard, SectionHeading, StandardCard, HorizontalCard } from "@/components/PostCards";
import { CorridorPanel, CityRail } from "@/components/CorridorPanel";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { Icon, Arrow } from "@/components/Icon";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "I-80 Things — Nebraska I-80 news, crashes, weather & road conditions",
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    url: site.url,
    title: "I-80 Things — Nebraska's I-80 corridor, covered daily",
    description: site.description,
    images: [{ url: "/api/og?title=Nebraska%27s%20I-80%20corridor%2C%20covered%20daily&kicker=I-80%20THINGS", width: 1200, height: 675 }],
  },
};

export default async function HomePage() {
  const alerts = await getCorridorAlerts();
  const [lead, ...secondary] = getFeaturedPosts(3);
  const posts = getAllPosts();
  const latest = posts.filter((p) => p.slug !== lead.slug).slice(0, 6);
  const countByCity = new Map<string, number>();
  for (const post of posts) {
    countByCity.set(post.city, (countByCity.get(post.city) ?? 0) + 1);
  }

  const graph = [
    {
      "@type": "NewsMediaOrganization",
      "@id": `${site.url}/#organization`,
      name: site.name,
      url: site.url,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/brand/logo.png"),
        width: 512,
        height: 512,
      },
      description: site.description,
      email: site.email,
      foundingDate: String(site.founded),
      sameAs: [site.instagramUrl],
      publishingPrinciples: absoluteUrl("/editorial-standards"),
      ethicsPolicy: absoluteUrl("/editorial-standards"),
      correctionsPolicy: absoluteUrl("/corrections"),
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "editorial",
        email: site.email,
        url: site.url,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      publisher: { "@id": `${site.url}/#organization` },
      inLanguage: "en-US",
      potentialAction: {
        "@type": "SearchAction",
        target: `${site.url}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "CollectionPage",
      "@id": `${site.url}/#page`,
      url: site.url,
      name: "I-80 Things",
      isPartOf: { "@id": `${site.url}/#website` },
      about: {
        "@type": "Place",
        name: "Interstate 80 in Nebraska",
        address: { "@type": "PostalAddress", addressRegion: "NE", addressCountry: "US" },
      },
    },
  ];

  return (
    <main>
      <JsonLd data={{ "@context": "https://schema.org", "@graph": graph }} />

      <div className="border-b border-line bg-cream">
        <div className="container-page py-3">
          <CityRail />
        </div>
      </div>

      {alerts.length > 0 ? (
        <div className="border-b border-alert/30 bg-alert/5">
          <div className="container-page flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-xs">
            <span className="bg-alert px-2 py-0.5 text-[9px] font-bold tracking-[0.12em] text-paper uppercase">
              Weather alert
            </span>
            <p className="font-semibold text-ink">
              {alerts[0].event}: {alerts[0].areaDesc}
            </p>
            <a
              href="https://www.weather.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-alert underline decoration-alert/40 underline-offset-2"
            >
              Full forecast →
            </a>
          </div>
        </div>
      ) : null}

      <div className="container-page py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr] lg:gap-12">
          <LeadCard post={lead} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:gap-0 lg:divide-y lg:divide-line">
            {secondary.map((post) => (
              <div key={post.slug} className="lg:pt-5 lg:first:pt-0">
                <StandardCard post={post} />
              </div>
            ))}
          </div>
        </div>

        <AdSlot
          slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD}
          minHeight={90}
          className="mt-10"
        />

        <section className="mt-12 grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-12">
          <div>
            <SectionHeading
              title="Latest from the corridor"
              href="/news"
              kicker="Updated daily"
              linkLabel="All stories"
            />
            <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
              {latest.slice(0, 4).map((post) => (
                <StandardCard key={post.slug} post={post} />
              ))}
            </div>
            {latest.length > 4 ? (
              <div className="mt-8 border-t border-ink pt-2">
                {latest.slice(4).map((post) => (
                  <HorizontalCard key={post.slug} post={post} />
                ))}
              </div>
            ) : null}
          </div>

          <aside className="space-y-8">
            <CorridorPanel alerts={alerts} />

            <div className="border border-line p-4">
              <p className="kicker mb-2 text-amber-dark">The daily brief</p>
              <h2 className="font-serif text-xl leading-tight font-semibold">
                One email. Every I-80 story that matters.
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-slate">
                Crashes, closures and construction, verified and summarized.
                No spam, no speculation.
              </p>
              <a
                href={`mailto:${site.email}?subject=Subscribe%20to%20the%20I-80%20brief`}
                className="mt-3 flex items-center justify-center gap-2 bg-ink px-4 py-2.5 text-[11px] font-bold tracking-[0.1em] text-paper uppercase transition hover:bg-highway"
              >
                Get the brief <Arrow className="h-3.5 w-3.5" />
              </a>
              <p className="mt-2 text-[10px] text-slate">
                Launching soon. Email us to be added to the first list.
              </p>
            </div>

            <AdSlot
              slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR}
              minHeight={250}
            />

            <div className="border border-line">
              <div className="border-b border-line px-4 py-2.5">
                <h2 className="kicker text-slate">By town</h2>
              </div>
              <ul className="divide-y divide-line">
                {places
                  .filter((p) => (countByCity.get(p.slug) ?? 0) > 0)
                  .slice(0, 6)
                  .map((place) => (
                    <li key={place.slug}>
                      <Link
                        href={`/cities/${place.slug}`}
                        className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-cream"
                      >
                        <span className="font-semibold">{place.name}</span>
                        <span className="text-[10px] font-bold tracking-wider text-slate">
                          MM {place.mileMarker.split("–")[0]}
                        </span>
                      </Link>
                    </li>
                  ))}
                <li>
                  <Link
                    href="/cities"
                    className="block px-4 py-2.5 text-[10px] font-bold tracking-[0.1em] text-highway uppercase hover:bg-cream"
                  >
                    All corridor towns →
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </section>
      </div>

      <section className="border-y border-line bg-cream">
        <div className="container-page py-12">
          <SectionHeading
            title="Along the corridor"
            href="/cities"
            kicker="Mile 454 to mile 22"
            linkLabel="Every town"
          />
          <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {places
              .filter((p) => p.featured)
              .map((place) => (
                <Link
                  key={place.slug}
                  href={`/cities/${place.slug}`}
                  className="group bg-paper p-5 transition hover:bg-paper/70"
                >
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-serif text-xl font-semibold group-hover:underline group-hover:decoration-amber group-hover:decoration-2 group-hover:underline-offset-4">
                      {place.name}
                    </h3>
                    <span className="text-[10px] font-bold tracking-wider text-amber-dark">
                      MM {place.mileMarker}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] font-medium tracking-wide text-slate uppercase">
                    {place.county}
                  </p>
                  <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-ink-soft">
                    {place.blurb}
                  </p>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <div className="container-page py-12">
        <section>
          <SectionHeading
            title="Coverage by topic"
            href="/topics"
            kicker="What we track"
            linkLabel="All topics"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {topics.map((topic) => (
              <Link
                key={topic.slug}
                href={`/topics/${topic.slug}`}
                className="group flex items-start gap-3 border border-line bg-paper p-4 transition hover:border-ink hover:bg-cream"
              >
                <span className="mt-0.5 text-highway">
                  <Icon name={topic.icon} className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-serif text-base font-semibold group-hover:underline group-hover:decoration-amber">
                    {topic.label}
                  </span>
                  <span className="mt-1 block text-[11px] leading-relaxed text-slate">
                    {topic.description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12 border border-ink bg-ink p-6 text-paper md:p-9">
          <div className="grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="kicker text-amber">For reporters, drivers and neighbors</p>
              <h2 className="mt-2 font-serif text-3xl leading-tight font-semibold">
                87 verified sources. One corridor.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-cream/70">
                Police scanners, town newspapers, weather offices and state
                data feeds — with access notes, coverage areas and verified
                links.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row md:justify-end">
              <Link
                href="/sources"
                className="bg-amber px-5 py-3 text-center text-[11px] font-bold tracking-[0.1em] text-ink uppercase transition hover:bg-paper"
              >
                Open the source desk
              </Link>
              <Link
                href="/editorial-standards"
                className="border border-cream/30 px-5 py-3 text-center text-[11px] font-bold tracking-[0.1em] text-paper uppercase transition hover:border-paper"
              >
                Editorial standards
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
