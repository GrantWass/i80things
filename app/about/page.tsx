import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/utils";
import { authors } from "@/data/authors";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "About I-80 Things",
  description:
    "Who we are, how we report and how we're funded. I-80 Things covers the Nebraska corridor from Omaha to Kimball.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About I-80 Things",
          url: `${site.url}/about`,
          mainEntity: {
            "@type": "NewsMediaOrganization",
            "@id": `${site.url}/#organization`,
            name: site.name,
            url: site.url,
            email: site.email,
            foundingDate: String(site.founded),
            description: site.description,
            sameAs: [site.instagramUrl],
            publishingPrinciples: absoluteUrl("/editorial-standards"),
            ethicsPolicy: absoluteUrl("/editorial-standards"),
            correctionsPolicy: absoluteUrl("/corrections"),
            logo: {
              "@type": "ImageObject",
              url: absoluteUrl("/brand/logo.png"),
              width: 512,
              height: 512,
            },
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "editorial",
              email: site.email,
              url: site.url,
              availableLanguage: ["English"],
            },
            employee: authors.map((a) => ({
              "@type": "Person",
              name: a.name,
              jobTitle: a.role,
              url: `${site.url}/authors/${a.slug}`,
            })),
          },
        }}
      />

      <header className="border-b border-line bg-cream">
        <div className="container-page py-10 md:py-14">
          <p className="kicker text-amber-dark">The masthead</p>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl leading-[1.05] font-semibold tracking-tight md:text-6xl">
            A daily desk for Nebraska&apos;s I-80
          </h1>
          <p className="mt-4 max-w-2xl font-serif text-xl leading-relaxed text-slate">
            454 miles. One interstate. The crashes, closures, weather and small
            decisions that shape the drive between Omaha and Kimball.
          </p>
        </div>
      </header>

      <div className="container-page py-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
          <div className="article-prose max-w-3xl">
            <h2>What we do</h2>
            <p>
              I-80 Things covers Interstate 80 in Nebraska: crashes, closures,
              weather, construction and the towns along the route. We publish
              when there is something verified to say.
            </p>
            <p>
              We write for the people who use the corridor every day — commuters,
              truckers, farmers, students and families driving to Kearney for a
              tournament. Every story names its source, and every claim about a
              crash, closure or injury is attributed to an agency that confirmed
              it.
            </p>

            <h2>How we report</h2>
            <p>
              Our primary sources are the Nebraska State Patrol, the Nebraska
              Department of Transportation and Nebraska 511, the National Weather
              Service, city and county agencies, and public records. Local
              newspapers and TV stations are credited when they break a story;
              we link to them and add context rather than republishing their
              work.
            </p>
            <p>
              We monitor public-safety radio, but a scanner call is never
              published as fact. It is a tip that must be confirmed. Our full
              process is in our{" "}
              <Link href="/editorial-standards">editorial standards</Link>, and
              every source we use is listed in the{" "}
              <Link href="/sources">source desk</Link>.
            </p>

            <h2>Funding</h2>
            <p>
              I-80 Things is funded by advertising, primarily Google AdSense.
              Sponsored content is labeled.
            </p>
            <p>
              We are not affiliated with NDOT, the Nebraska State Patrol, any
              city government or any political campaign.
            </p>

            <h2>Who we are</h2>
            <div className="not-prose grid gap-4 sm:grid-cols-2">
              {authors.map((author) => (
                <div key={author.slug} className="border border-line bg-paper p-4">
                  <p className="font-serif text-lg font-semibold">
                    <Link href={`/authors/${author.slug}`} className="hover:underline hover:decoration-amber">
                      {author.name}
                    </Link>
                  </p>
                  <p className="text-[10px] font-bold tracking-[0.1em] text-slate uppercase">
                    {author.role}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate">{author.bio}</p>
                  <a
                    href={`mailto:${author.email}`}
                    className="mt-2 inline-block text-[11px] font-semibold text-highway underline decoration-amber underline-offset-2"
                  >
                    {author.email}
                  </a>
                </div>
              ))}
            </div>

            <h2>Coverage area</h2>
            <p>
              We cover I-80 from the Wyoming line at Kimball (mile 22) through
              Sidney, Ogallala, North Platte, Lexington, Kearney, Grand Island,
              York, Seward and Lincoln to Omaha (mile 454) and the Missouri River
              crossing. Stories from Hastings, Fremont, Columbus, Beatrice and
              McCook appear when they affect the corridor.
            </p>

            <h2>Contact</h2>
            <p>
              News tips: <a href={`mailto:${site.email}`}>{site.email}</a>.
              Corrections: use the link at the bottom of any story. We read
              everything and respond to confirmed, on-the-record inquiries.
            </p>
          </div>

          <aside className="space-y-6">
            <div className="border border-line p-4">
              <h2 className="kicker text-slate">The basics</h2>
              <dl className="mt-3 space-y-3 text-[13px]">
                <div>
                  <dt className="text-[10px] font-bold tracking-[0.1em] text-slate uppercase">Coverage</dt>
                  <dd className="mt-0.5">{site.corridor}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold tracking-[0.1em] text-slate uppercase">Founded</dt>
                  <dd className="mt-0.5">{site.founded}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold tracking-[0.1em] text-slate uppercase">Funding</dt>
                  <dd className="mt-0.5">Advertising. No paywall.</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold tracking-[0.1em] text-slate uppercase">Contact</dt>
                  <dd className="mt-0.5">
                    <a href={`mailto:${site.email}`} className="text-highway underline decoration-amber underline-offset-2">
                      {site.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold tracking-[0.1em] text-slate uppercase">Instagram</dt>
                  <dd className="mt-0.5">
                    <a href={site.instagramUrl} className="text-highway underline decoration-amber underline-offset-2" rel="me noopener">
                      {site.instagram}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="border border-line bg-cream p-4">
              <h2 className="kicker text-amber-dark">Read next</h2>
              <ul className="mt-2 space-y-2 text-[13px]">
                <li><Link href="/editorial-standards" className="hover:underline hover:decoration-amber">Editorial standards</Link></li>
                <li><Link href="/sources" className="hover:underline hover:decoration-amber">Source directory</Link></li>
                <li><Link href="/news/i-80-mile-markers-nebraska-explained" className="hover:underline hover:decoration-amber">Mile marker guide</Link></li>
                <li><Link href="/privacy" className="hover:underline hover:decoration-amber">Privacy & cookies</Link></li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
