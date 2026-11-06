import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { authors } from "@/data/authors";
import { getAllPosts } from "@/lib/content";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/utils";
import { HorizontalCard } from "@/components/PostCards";
import { JsonLd } from "@/components/JsonLd";

export function generateStaticParams() {
  return authors.map((author) => ({ slug: author.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = authors.find((a) => a.slug === slug);
  if (!author) return {};
  return {
    title: `${author.name} — ${author.role}`,
    description: author.bio,
    alternates: { canonical: `/authors/${author.slug}` },
    openGraph: {
      url: absoluteUrl(`/authors/${author.slug}`),
      title: `${author.name} | I-80 Things`,
      description: author.bio,
    },
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const author = authors.find((a) => a.slug === slug);
  if (!author) notFound();

  const posts = getAllPosts().filter((post) => post.author === author.slug);

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          mainEntity: {
            "@type": "Person",
            name: author.name,
            jobTitle: author.role,
            description: author.bio,
            url: absoluteUrl(`/authors/${author.slug}`),
            worksFor: { "@id": `${site.url}/#organization` },
          },
        }}
      />

      <header className="border-b border-line bg-cream">
        <div className="container-page py-10 md:py-14">
          <nav aria-label="Breadcrumb" className="mb-5 text-[11px] font-medium tracking-wide text-slate">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link href="/" className="hover:text-ink">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/about" className="hover:text-ink">About</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-ink">{author.name}</li>
            </ol>
          </nav>
          <div className="flex items-start gap-5">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-highway font-serif text-2xl font-bold text-paper">
              {author.name.charAt(0)}
            </span>
            <div>
              <p className="kicker text-amber-dark">{author.role}</p>
              <h1 className="mt-1 font-serif text-4xl leading-tight font-semibold tracking-tight md:text-5xl">
                {author.name}
              </h1>
              <p className="mt-1 text-[11px] font-semibold tracking-wide text-slate uppercase">
                {author.location} · Since {author.since}
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate">
            {author.bio}
          </p>
          {author.email ? (
            <a
              href={`mailto:${author.email}`}
              className="mt-3 inline-block text-[12px] font-semibold text-highway underline decoration-amber decoration-2 underline-offset-2"
            >
              {author.email}
            </a>
          ) : null}
        </div>
      </header>

      <div className="container-page py-10">
        <h2 className="mb-5 border-b-2 border-ink pb-2 font-serif text-2xl font-semibold">
          Stories by {author.name.split(" ")[0]}
        </h2>
        {posts.length ? (
          posts.map((post) => <HorizontalCard key={post.slug} post={post} />)
        ) : (
          <p className="text-sm text-slate">No bylined stories yet.</p>
        )}
      </div>
    </main>
  );
}
