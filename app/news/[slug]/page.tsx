import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllPosts,
  getAdjacentPosts,
  getPost,
  getRelatedPosts,
} from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { absoluteUrl, formatDate, formatDateTime, postImagePath } from "@/lib/utils";
import { getAuthor } from "@/data/authors";
import { getPlace, placeName } from "@/data/places";
import { getTopic, topicLabel } from "@/data/topics";
import { site } from "@/lib/site";
import { getSourcesForPlace } from "@/lib/sources";
import { CompactCard, SectionHeading } from "@/components/PostCards";
import { ArticleGallery } from "@/components/ArticleGallery";
import { AdSlot } from "@/components/AdSlot";
import { ShareButtons } from "@/components/ShareButtons";
import { ReadingProgress } from "@/components/ReadingProgress";
import { JsonLd } from "@/components/JsonLd";
import { Arrow, Icon } from "@/components/Icon";

export const revalidate = 300;

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const image = absoluteUrl(postImagePath(post));
  const topic = post.topics[0] ? topicLabel(post.topics[0]) : "News";
  const metaTitle = post.seoTitle ?? post.title;
  const metaDescription = post.seoDescription ?? post.dek;
  // Keep the brand suffix for short headlines, but do not force an overlong
  // title past the search-result limit.
  const titleMetadata =
    metaTitle.length <= 47 ? metaTitle : { absolute: metaTitle };

  return {
    title: titleMetadata,
    description: metaDescription,
    alternates: { canonical: `/news/${post.slug}` },
    keywords: [
      placeName(post.city),
      "I-80 Nebraska",
      topic,
      ...post.tags,
    ],
    authors: [{ name: getAuthor(post.author).name, url: `/authors/${post.author}` }],
    openGraph: {
      type: "article",
      url: absoluteUrl(`/news/${post.slug}`),
      title: metaTitle,
      description: metaDescription,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [getAuthor(post.author).name],
      section: topic,
      tags: post.tags,
      images: [
        {
          url: image,
          width: post.images.length ? 1600 : 1200,
          height: post.images.length ? 900 : 675,
          alt: post.imageAlt || post.title,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [image],
    },
    other: {
      news_keywords: post.tags.join(", "),
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post || post.draft) notFound();

  const author = getAuthor(post.author);
  const place = getPlace(post.city);
  const topic = post.topics[0] ? getTopic(post.topics[0]) : undefined;
  const related = getRelatedPosts(post, 3);
  const { previous, next } = getAdjacentPosts(post);
  const html = await renderMarkdown(post.body);
  const url = absoluteUrl(`/news/${post.slug}`);
  const image = absoluteUrl(postImagePath(post));
  const articleImages = post.images.length
    ? post.images.map((item) => ({
        "@type": "ImageObject",
        url: absoluteUrl(item.src),
        width: 1600,
        height: 900,
        caption: item.caption ?? item.alt,
        creditText: item.credit,
        copyrightNotice: item.license,
        license: item.licenseUrl,
        acquireLicensePage: item.creditUrl,
      }))
    : [
        {
          "@type": "ImageObject",
          url: image,
          width: 1200,
          height: 675,
        },
      ];
  const localSources = place ? getSourcesForPlace(place.slug).slice(0, 4) : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.dek,
        url,
        image: articleImages,
        datePublished: post.date,
        dateModified: post.updated ?? post.date,
        author: {
          "@type": author.slug === "corridor-desk" ? "Organization" : "Person",
          name: author.name,
          url: absoluteUrl(`/authors/${author.slug}`),
        },
        publisher: {
          "@type": "NewsMediaOrganization",
          "@id": `${site.url}/#organization`,
          name: site.name,
          url: site.url,
          sameAs: [site.instagramUrl],
          publishingPrinciples: absoluteUrl("/editorial-standards"),
          ethicsPolicy: absoluteUrl("/editorial-standards"),
          correctionsPolicy: absoluteUrl("/corrections"),
          masthead: absoluteUrl("/about"),
          ownershipFundingInfo: absoluteUrl("/about#funding"),
          actionableFeedbackPolicy: absoluteUrl("/contact"),
          logo: {
            "@type": "ImageObject",
            url: absoluteUrl("/brand/logo.png"),
            width: 512,
            height: 512,
          },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        isAccessibleForFree: true,
        isPartOf: { "@id": `${site.url}/#website` },
        articleSection: topic?.label ?? "News",
        keywords: post.tags.join(", "),
        citation: post.sources.map((source) => source.url),
        about: place
          ? {
              "@type": "Place",
              name: `${place.name}, Nebraska`,
              address: {
                "@type": "PostalAddress",
                addressLocality: place.name,
                addressRegion: "NE",
                addressCountry: "US",
              },
            }
          : {
              "@type": "Place",
              name: "Interstate 80 in Nebraska",
              address: { "@type": "PostalAddress", addressRegion: "NE", addressCountry: "US" },
            },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: [".article-prose"],
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "News", item: `${site.url}/news` },
          {
            "@type": "ListItem",
            position: 3,
            name: place ? place.name : "Nebraska",
            item: place ? `${site.url}/cities/${place.slug}` : `${site.url}/cities`,
          },
          { "@type": "ListItem", position: 4, name: post.title, item: url },
        ],
      },
    ],
  };

  return (
    <main>
      <ReadingProgress />
      <JsonLd data={jsonLd} />

      <div className="container-page py-6 md:py-9">
        <nav aria-label="Breadcrumb" className="mb-5 text-[11px] font-medium tracking-wide text-slate">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/" className="hover:text-ink">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/news" className="hover:text-ink">News</Link></li>
            <li aria-hidden="true">/</li>
            {place ? (
              <>
                <li><Link href={`/cities/${place.slug}`} className="hover:text-ink">{place.name}</Link></li>
                <li aria-hidden="true">/</li>
              </>
            ) : null}
            <li aria-current="page" className="truncate text-ink">{post.title}</li>
          </ol>
        </nav>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <article>
            <header>
              <p className="kicker flex flex-wrap items-center gap-x-2 gap-y-1 text-slate">
                {place ? (
                  <Link href={`/cities/${place.slug}`} className="text-highway hover:text-amber-dark">
                    {place.name}
                  </Link>
                ) : (
                  <Link href="/cities" className="text-highway hover:text-amber-dark">
                    Nebraska
                  </Link>
                )}
                <span aria-hidden="true" className="inline-block h-1 w-1 bg-amber" />
                {topic ? (
                  <Link href={`/topics/${topic.slug}`} className="hover:text-ink">
                    {topic.label}
                  </Link>
                ) : (
                  <span>Corridor news</span>
                )}
                {place ? (
                  <>
                    <span aria-hidden="true" className="inline-block h-1 w-1 bg-amber" />
                    <span>I-80 {place.mileMarker}</span>
                  </>
                ) : null}
              </p>

              <h1 className="mt-3 max-w-4xl font-serif text-4xl leading-[1.04] font-semibold tracking-tight text-ink md:text-[3.5rem]">
                {post.title}
              </h1>
              <p className="mt-4 max-w-3xl font-serif text-xl leading-relaxed text-slate md:text-2xl">
                {post.dek}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-line py-3">
                <Link href={`/authors/${author.slug}`} className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-highway font-serif text-sm font-bold text-paper">
                    {author.name.charAt(0)}
                  </span>
                  <span className="text-[12px] leading-tight">
                    <span className="block font-bold text-ink">{author.name}</span>
                    <span className="block text-[10px] text-slate">{author.role}</span>
                  </span>
                </Link>
                <span className="text-[11px] text-slate">
                  Published{" "}
                  <time dateTime={post.date}>{formatDateTime(post.date)}</time>
                </span>
                {post.updated ? (
                  <span className="text-[11px] text-slate">
                    Updated <time dateTime={post.updated}>{formatDate(post.updated)}</time>
                  </span>
                ) : null}
                <span className="text-[11px] text-slate">{post.readingTime} min read</span>
                <div className="ml-auto hidden sm:block">
                  <ShareButtons title={post.title} url={url} compact />
                </div>
              </div>
            </header>

            <ArticleGallery
              images={post.images}
              title={post.title}
              priority
            />

            {post.summary.length > 0 ? (
              <section className="mt-7 border border-line border-l-4 border-l-amber bg-cream p-5">
                <h2 className="kicker text-amber-dark">The short version</h2>
                <ul className="mt-2.5 space-y-2">
                  {post.summary.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[14px] leading-relaxed text-ink-soft">
                      <span className="mt-[0.55rem] inline-block h-1.5 w-1.5 shrink-0 bg-amber" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <AdSlot
              slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE}
              minHeight={250}
              className="mt-8"
            />

            <div
              className="article-prose mt-7"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {post.sources.length > 0 ? (
              <section className="mt-10 border-t-2 border-ink pt-4">
                <h2 className="font-serif text-xl font-semibold">Sources & primary documents</h2>
                <p className="mt-1 text-[12px] text-slate">
                  Everything below was used to verify this story. Links open the
                  original source.
                </p>
                <ol className="mt-3 space-y-2">
                  {post.sources.map((source) => {
                    let host = "";
                    try {
                      host = new URL(source.url).hostname.replace(/^www\./, "");
                    } catch {}
                    return (
                      <li key={source.url} className="flex gap-2 text-[13px] leading-snug">
                        <span className="text-slate">↗</span>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-highway underline decoration-amber decoration-2 underline-offset-2 hover:bg-amber/10"
                        >
                          {source.name}
                        </a>
                        {host ? <span className="text-[10px] text-slate">({host})</span> : null}
                      </li>
                    );
                  })}
                </ol>
              </section>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="border border-line bg-cream px-2 py-1 text-[10px] font-semibold tracking-wide text-slate uppercase">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y border-line py-3">
              <ShareButtons title={post.title} url={url} compact />
              <a
                href={`mailto:${site.email}?subject=${encodeURIComponent(`Correction: ${post.title}`)}&body=${encodeURIComponent(`Story: ${url}\n\nWhat needs correcting:\n`)}`}
                className="text-[11px] font-semibold text-slate underline decoration-line underline-offset-2 hover:text-ink"
              >
                Report a correction
              </a>
            </div>

            <AdSlot
              slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD}
              minHeight={90}
              className="mt-8"
            />

            <section className="mt-8 border border-line bg-cream p-5">
              <div className="flex flex-wrap items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-highway font-serif text-lg font-bold text-paper">
                  {author.name.charAt(0)}
                </span>
                <div className="min-w-[14rem] flex-1">
                  <h2 className="font-serif text-lg font-semibold">
                    <Link href={`/authors/${author.slug}`} className="hover:underline hover:decoration-amber">
                      {author.name}
                    </Link>
                  </h2>
                  <p className="text-[10px] font-bold tracking-[0.1em] text-slate uppercase">
                    {author.role} · {author.location}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-soft line-clamp-3">
                    {author.bio}
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-6 flex items-center justify-between gap-4 border border-line p-4">
              <div>
                <p className="kicker text-slate">Follow the corridor</p>
                <p className="mt-1 text-[13px] text-ink-soft">
                  We post each story to Instagram with a shareable image.
                </p>
              </div>
              <a
                href={site.instagramUrl}
                target="_blank"
                rel="me noopener"
                className="shrink-0 bg-ink px-4 py-2 text-[10px] font-bold tracking-[0.1em] text-paper uppercase hover:bg-highway"
              >
                @i80.things
              </a>
            </div>

            {related.length > 0 ? (
              <section className="mt-12">
                <SectionHeading title="Related from the corridor" kicker="Keep reading" />
                <div className="grid gap-3">
                  {related.map((item, index) => (
                    <CompactCard key={item.slug} post={item} index={index + 1} />
                  ))}
                </div>
              </section>
            ) : null}

            <nav className="mt-10 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
              {previous ? (
                <Link
                  href={`/news/${previous.slug}`}
                  className="group border border-line p-4 hover:border-ink"
                >
                  <span className="kicker text-slate">← Previous</span>
                  <span className="mt-1 block font-serif text-base font-semibold group-hover:underline group-hover:decoration-amber">
                    {previous.title}
                  </span>
                </Link>
              ) : <span />}
              {next ? (
                <Link
                  href={`/news/${next.slug}`}
                  className="group border border-line p-4 text-right hover:border-ink"
                >
                  <span className="kicker text-slate">Next →</span>
                  <span className="mt-1 block font-serif text-base font-semibold group-hover:underline group-hover:decoration-amber">
                    {next.title}
                  </span>
                </Link>
              ) : null}
            </nav>
          </article>

          <aside className="space-y-7 lg:sticky lg:top-24 lg:self-start">
            <div className="border border-line bg-paper p-4">
              <h2 className="kicker text-amber-dark">Before you drive</h2>
              <ul className="mt-3 space-y-2.5">
                <li>
                  <Link href="/exits" className="group flex items-center justify-between gap-2 text-sm font-semibold hover:text-amber-dark">
                    I-80 exit guide <Arrow className="h-3.5 w-3.5 text-slate" />
                  </Link>
                  <p className="text-[10px] text-slate">Every exit, mile marker and nearby town</p>
                </li>
                <li>
                  <a href="https://511.nebraska.gov/" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-2 text-sm font-semibold hover:text-amber-dark">
                    Nebraska 511 <Arrow className="h-3.5 w-3.5 text-slate" />
                  </a>
                  <p className="text-[10px] text-slate">Live closures, cameras & plows</p>
                </li>
                <li>
                  <a href="https://www.weather.gov/" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-2 text-sm font-semibold hover:text-amber-dark">
                    NWS forecast <Arrow className="h-3.5 w-3.5 text-slate" />
                  </a>
                  <p className="text-[10px] text-slate">Warnings by county, with timing</p>
                </li>
                <li>
                  <a href="https://statepatrol.nebraska.gov/divisions/office-superintendent/news" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-2 text-sm font-semibold hover:text-amber-dark">
                    State Patrol news <Arrow className="h-3.5 w-3.5 text-slate" />
                  </a>
                  <p className="text-[10px] text-slate">Confirmed crashes & arrests</p>
                </li>
              </ul>
              <Link href="/sources" className="mt-4 block border border-ink px-3 py-2 text-center text-[10px] font-bold tracking-[0.1em] uppercase transition hover:bg-ink hover:text-paper">
                All 87 sources
              </Link>
            </div>

            <AdSlot
              slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR}
              minHeight={250}
            />

            {place ? (
              <div className="border border-line p-4">
                <h2 className="kicker text-slate">Town hub</h2>
                <h3 className="mt-1 font-serif text-xl font-semibold">
                  <Link href={`/cities/${place.slug}`} className="hover:underline hover:decoration-amber">
                    {place.name}, Nebraska
                  </Link>
                </h3>
                <dl className="mt-3 space-y-1.5 text-[12px]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate">County</dt>
                    <dd className="font-medium">{place.county}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate">I-80</dt>
                    <dd className="font-medium">Mile {place.mileMarker}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate">Exits</dt>
                    <dd className="text-right font-medium">{place.exit}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-[12px] leading-relaxed text-slate line-clamp-3">{place.blurb}</p>
              </div>
            ) : null}

            {localSources.length > 0 ? (
              <div className="border border-line p-4">
                <h2 className="kicker text-slate">Local sources</h2>
                <ul className="mt-2 space-y-2">
                  {localSources.map((source) => (
                    <li key={source.id}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2 text-[12px] leading-snug text-ink-soft hover:text-ink"
                      >
                        <Icon name={source.category === "scanner" ? "scanner" : "link"} className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-dark" />
                        {source.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}
