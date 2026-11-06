import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Advertise on I-80 Things",
  description:
    "Sponsor Nebraska's I-80 corridor news desk. Local, clearly labeled placements for businesses between Omaha and Kimball.",
  alternates: { canonical: "/advertise" },
};

const placements = [
  {
    name: "Corridor sponsor",
    detail:
      "A single presenting placement on the homepage, plus a credit in the daily story rotation. Limited to one partner at a time.",
    bestFor: "Truck stops, travel centers, dealerships and regional services",
  },
  {
    name: "City hub sponsor",
    detail:
      "A clearly labeled sponsor line on one corridor town hub — Omaha, Lincoln, Grand Island, Kearney, North Platte, Ogallala, Sidney, Kimball or another corridor community.",
    bestFor: "Local businesses that want to own one town",
  },
  {
    name: "Story sponsor",
    detail:
      "A labeled sponsorship attached to a specific story or topic, such as winter driving, construction season or the 511 guide. Editorial has final say on the story.",
    bestFor: "Towing, tires, insurance, repair and safety services",
  },
  {
    name: "Instagram partner",
    detail:
      "A single image or carousel post on @i80.things, with the same credit and link-in-bio treatment as our editorial posts.",
    bestFor: "Hotels, restaurants, attractions and local events",
  },
];

export default function AdvertisePage() {
  const inquiry = `mailto:${site.email}?subject=${encodeURIComponent(
    "Advertising inquiry — I-80 Things",
  )}&body=${encodeURIComponent(
    "Business:\nTown / exit:\nWebsite or Instagram:\nWhat you would like to promote:\nTiming and budget:\n",
  )}`;

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Advertise on I-80 Things",
          url: `${site.url}/advertise`,
          description:
            "Sponsorship and advertising options for Nebraska's I-80 corridor news desk.",
          isPartOf: { "@id": `${site.url}/#website` },
          about: {
            "@type": "Service",
            name: "I-80 Things sponsorship",
            provider: { "@id": `${site.url}/#organization` },
            areaServed: "Interstate 80 corridor, Nebraska",
          },
        }}
      />

      <header className="border-b border-line bg-cream">
        <div className="container-page py-10 md:py-14">
          <p className="kicker text-amber-dark">Partner with the corridor</p>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl leading-[1.05] font-semibold tracking-tight md:text-6xl">
            Advertise on I-80 Things
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate">
            A daily news desk for the towns, exits and work zones between Omaha
            and Kimball. We keep the advertising clearly separate from the
            reporting.
          </p>
        </div>
      </header>

      <div className="container-page py-10 md:py-14">
        <div className="mx-auto max-w-4xl">
          <section className="grid gap-6 border border-line bg-paper p-6 sm:grid-cols-3">
            <div>
              <p className="kicker text-amber-dark">The audience</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Corridor residents, commuters, freight drivers and travelers who
                use I-80 in Nebraska — plus readers who follow the towns around
                the exits.
              </p>
            </div>
            <div>
              <p className="kicker text-amber-dark">The coverage</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Crashes, closures, weather, construction and the local decisions
                that shape the corridor. Local reporting, not a generic travel
                feed.
              </p>
            </div>
            <div>
              <p className="kicker text-amber-dark">The channels</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                The site, the daily story rotation and Instagram
                <span className="whitespace-nowrap"> @{site.instagram}</span>. A
                newsletter is in development.
              </p>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-serif text-3xl font-semibold tracking-tight">
              Placements
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate">
              Flat monthly sponsorships, month to month. We will help with the
              creative, but we do not sell editorial coverage.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {placements.map((placement) => (
                <article
                  key={placement.name}
                  className="border border-line bg-cream p-5"
                >
                  <h3 className="font-serif text-xl font-semibold">
                    {placement.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {placement.detail}
                  </p>
                  <p className="mt-3 text-[11px] font-semibold tracking-wide text-amber-dark uppercase">
                    Best for: {placement.bestFor}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="border border-line bg-paper p-6">
              <h2 className="font-serif text-2xl font-semibold">
                What we will not run
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-soft">
                <li>Political or campaign advertising.</li>
                <li>Sponsored stories that look like news reporting.</li>
                <li>Ads for illegal, deceptive or unsafe services.</li>
                <li>Anything that asks us to change a story or a source.</li>
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-slate">
                Sponsored content is labeled. Advertisers have no role in story
                selection, sourcing or coverage. See our{" "}
                <Link
                  href="/editorial-standards"
                  className="font-semibold text-highway underline decoration-amber underline-offset-2"
                >
                  editorial standards
                </Link>
                .
              </p>
            </div>

            <div className="border border-line bg-ink p-6 text-cream">
              <p className="kicker text-amber">Start a conversation</p>
              <h2 className="mt-2 font-serif text-2xl font-semibold">
                Tell us about your business
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-cream/75">
                Send your business, town or exit, what you want to promote, and
                your timing and budget. We will reply with the current rate card
                and availability.
              </p>
              <a
                href={inquiry}
                className="mt-5 inline-flex items-center gap-2 bg-amber px-4 py-2.5 text-[11px] font-bold tracking-[0.1em] text-ink uppercase transition hover:bg-paper"
              >
                Email the publisher
              </a>
              <p className="mt-3 text-[11px] leading-relaxed text-cream/50">
                {site.email}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-cream/60">
                Prefer a DM?{" "}
                <a
                  href={site.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-amber underline decoration-amber/50 underline-offset-2 hover:text-paper"
                >
                  Message @{site.instagram}
                </a>
                .
              </p>
            </div>
          </section>

          <section className="mt-12 border-t border-line pt-6">
            <h2 className="font-serif text-2xl font-semibold">
              Local, not programmatic
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">
              We are not building an ad network. The goal is a small number of
              relevant local sponsors whose services make sense to someone
              driving or living along I-80. If that is you,{" "}
              <Link
                href="/contact"
                className="font-semibold text-highway underline decoration-amber underline-offset-2"
              >
                get in touch
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
