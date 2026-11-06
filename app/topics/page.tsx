import type { Metadata } from "next";
import Link from "next/link";
import { topics } from "@/data/topics";
import { getAllPosts } from "@/lib/content";
import { JsonLd } from "@/components/JsonLd";
import { AdSlot } from "@/components/AdSlot";
import { Icon, Arrow } from "@/components/Icon";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "I-80 Nebraska coverage topics",
  description:
    "Browse I-80 Nebraska coverage by topic: crashes, road conditions, weather, construction, State Patrol, travel, communities and explainers.",
  alternates: { canonical: "/topics" },
};

export default function TopicsPage() {
  const posts = getAllPosts();

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "I-80 Nebraska coverage topics",
          url: `${site.url}/topics`,
          isPartOf: { "@id": `${site.url}/#website` },
        }}
      />

      <header className="border-b border-line bg-cream">
        <div className="container-page py-10 md:py-14">
          <p className="kicker text-amber-dark">What we track</p>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl leading-[1.05] font-semibold tracking-tight md:text-6xl">
            Coverage, organized
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate">
            The corridor is not one story. It is crashes and construction,
            weather and small-town government. Pick a beat.
          </p>
        </div>
      </header>

      <div className="container-page py-10">
        <div className="grid gap-4 md:grid-cols-2">
          {topics.map((topic) => {
            const count = posts.filter(
              (p) => p.topics.includes(topic.slug) || p.tags.includes(topic.slug),
            ).length;
            return (
              <Link
                key={topic.slug}
                href={`/topics/${topic.slug}`}
                className="group flex gap-4 border border-line bg-paper p-5 transition hover:border-ink hover:bg-cream"
              >
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center border border-line bg-cream text-highway">
                  <Icon name={topic.icon} className="h-5 w-5" />
                </span>
                <span className="flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-serif text-xl font-semibold group-hover:underline group-hover:decoration-amber">
                      {topic.label}
                    </span>
                    <span className="text-[10px] font-bold tracking-wider text-slate">
                      {count} stor{count === 1 ? "y" : "ies"}
                    </span>
                  </span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-slate">
                    {topic.description}
                  </span>
                  <span className="mt-3 flex items-center gap-1 text-[10px] font-bold tracking-[0.08em] text-highway uppercase">
                    Read the beat <Arrow className="h-3 w-3" />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        <AdSlot
          slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD}
          minHeight={90}
          className="mt-10"
        />
      </div>
    </main>
  );
}
