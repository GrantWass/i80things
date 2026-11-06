import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/content";
import { HorizontalCard, SectionHeading } from "@/components/PostCards";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { CorridorPanel } from "@/components/CorridorPanel";
import { getCorridorAlerts } from "@/lib/nws";
import { places } from "@/data/places";
import { topics } from "@/data/topics";
import { site } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "All I-80 Nebraska news",
  description:
    "Every story from the I-80 corridor in Nebraska — road conditions, crashes, weather, construction and the towns from Omaha to Kimball.",
  alternates: { canonical: "/news" },
  openGraph: {
    url: `${site.url}/news`,
    title: "All I-80 Nebraska news | I-80 Things",
    description:
      "Every story from Nebraska's I-80 corridor, newest first.",
  },
};

export default async function NewsIndexPage() {
  const posts = getAllPosts();
  const alerts = await getCorridorAlerts();

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "All I-80 Nebraska news",
          url: `${site.url}/news`,
          isPartOf: { "@id": `${site.url}/#website` },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: posts.slice(0, 20).map((post, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: `${site.url}/news/${post.slug}`,
              name: post.title,
            })),
          },
        }}
      />

      <header className="border-b border-line bg-cream">
        <div className="container-page py-10 md:py-14">
          <p className="kicker text-amber-dark">The archive</p>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl leading-[1.05] font-semibold tracking-tight md:text-6xl">
            Every story from the corridor
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate">
            Newest first. Use the topics and town hubs to go deeper.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {topics.slice(0, 5).map((t) => (
              <Link
                key={t.slug}
                href={`/topics/${t.slug}`}
                className="border border-line bg-paper px-3 py-1.5 text-[10px] font-bold tracking-[0.08em] text-ink-soft uppercase hover:border-ink"
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <div className="container-page py-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
          <div>
            <SectionHeading
              title={`${posts.length} stories`}
              kicker="Newest first"
            />
            <div>
              {posts.map((post) => (
                <HorizontalCard key={post.slug} post={post} />
              ))}
            </div>
            <AdSlot
              slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD}
              minHeight={90}
              className="mt-10"
            />
          </div>
          <aside className="space-y-8">
            <CorridorPanel alerts={alerts} />
            <div className="border border-line p-4">
              <h2 className="kicker mb-3 text-slate">Browse by town</h2>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-2 text-[13px]">
                {places.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/cities/${p.slug}`} className="hover:text-amber-dark">
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-ink bg-ink p-4 text-paper">
              <p className="kicker text-amber">Follow along</p>
              <p className="mt-2 text-sm leading-relaxed text-cream/75">
                We post every story to Instagram with a real photo when we have one
                and the full story link in the bio.
              </p>
              <a
                href={site.instagramUrl}
                target="_blank"
                rel="me noopener"
                className="mt-3 inline-block border border-cream/30 px-3 py-2 text-[10px] font-bold tracking-[0.1em] uppercase hover:border-paper"
              >
                @i80.things
              </a>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
