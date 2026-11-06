import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTopic, topics } from "@/data/topics";
import { getAllPosts, getPostsByTopic } from "@/lib/content";
import { getAllSources } from "@/lib/sources";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/utils";
import { HorizontalCard, SectionHeading } from "@/components/PostCards";
import { JsonLd } from "@/components/JsonLd";
import { AdSlot } from "@/components/AdSlot";
import { CorridorPanel } from "@/components/CorridorPanel";
import { getCorridorAlerts } from "@/lib/nws";

export const revalidate = 300;

export function generateStaticParams() {
  return topics.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) return {};
  const title = `${topic.label} — I-80 Nebraska`;
  return {
    title,
    description: topic.description,
    alternates: { canonical: `/topics/${topic.slug}` },
    openGraph: {
      url: absoluteUrl(`/topics/${topic.slug}`),
      title,
      description: topic.description,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(topic.label)}&kicker=${encodeURIComponent("I-80 NEBRASKA")}`,
          width: 1200,
          height: 675,
        },
      ],
    },
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();

  const posts = getPostsByTopic(topic.slug);
  const fallback = getAllPosts().slice(0, 4);
  const display = posts.length ? posts : fallback;
  const alerts = await getCorridorAlerts();
  const sourceCount = getAllSources().filter((s) => {
    if (topic.slug === "crashes" || topic.slug === "state-patrol") {
      return s.category === "scanner" || s.category === "law-enforcement";
    }
    if (topic.slug === "weather") return s.category === "weather";
    if (topic.slug === "road-conditions" || topic.slug === "travel") {
      return s.category === "traffic" || s.category === "travel";
    }
    return s.recommended;
  }).length;

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              name: topic.label,
              url: absoluteUrl(`/topics/${topic.slug}`),
              description: topic.description,
              isPartOf: { "@id": `${site.url}/#website` },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: site.url },
                { "@type": "ListItem", position: 2, name: "Topics", item: `${site.url}/topics` },
                { "@type": "ListItem", position: 3, name: topic.label, item: absoluteUrl(`/topics/${topic.slug}`) },
              ],
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
              <li><Link href="/topics" className="hover:text-ink">Topics</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-ink">{topic.label}</li>
            </ol>
          </nav>
          <p className="kicker text-amber-dark">The beat</p>
          <h1 className="mt-2 font-serif text-4xl leading-[1.03] font-semibold tracking-tight md:text-6xl">
            {topic.label}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate">
            {topic.description}
          </p>
          <p className="mt-4 text-[11px] font-semibold tracking-wide text-slate uppercase">
            {posts.length} stor{posts.length === 1 ? "y" : "ies"} · {sourceCount} monitored sources
          </p>
        </div>
      </header>

      <div className="container-page py-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
          <div>
            <SectionHeading
              title={posts.length ? `Latest in ${topic.label.toLowerCase()}` : "Start with these"}
              href="/news"
              kicker="Newest first"
            />
            <div>
              {display.map((post) => (
                <HorizontalCard key={post.slug} post={post} />
              ))}
            </div>
            <AdSlot
              slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD}
              minHeight={90}
              className="mt-10"
            />
            <div className="mt-8 flex flex-wrap gap-2">
              {topics.filter((t) => t.slug !== topic.slug).map((t) => (
                <Link
                  key={t.slug}
                  href={`/topics/${t.slug}`}
                  className="border border-line px-3 py-1.5 text-[10px] font-bold tracking-[0.08em] text-ink-soft uppercase hover:border-ink"
                >
                  {t.label}
                </Link>
              ))}
            </div>
          </div>
          <aside className="space-y-7">
            <CorridorPanel alerts={alerts} />
            <div className="border border-line p-4">
              <h2 className="kicker text-slate">How this beat is covered</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                We use the State Patrol, NDOT, Nebraska 511 and the National
                Weather Service as primary sources, then link the local newsroom
                that broke the story. Scanner calls are tips, never
                confirmation.
              </p>
              <Link href="/editorial-standards" className="mt-3 inline-block text-[10px] font-bold tracking-[0.08em] text-highway uppercase hover:text-amber-dark">
                Read our standards →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
