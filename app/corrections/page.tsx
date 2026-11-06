import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { corrections } from "@/data/corrections";
import { site } from "@/lib/site";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Corrections",
  description:
    "Corrections policy and correction log for I-80 Things. How to report an error in a Nebraska I-80 story.",
  alternates: { canonical: "/corrections" },
};

export default function CorrectionsPage() {
  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Corrections",
          url: `${site.url}/corrections`,
          description:
            "Corrections policy and correction log for I-80 Things.",
          isPartOf: { "@id": `${site.url}/#website` },
        }}
      />

      <header className="border-b border-line bg-cream">
        <div className="container-page py-10 md:py-14">
          <p className="kicker text-amber-dark">The record</p>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl leading-[1.05] font-semibold tracking-tight md:text-6xl">
            Corrections
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate">
            When we get a fact wrong, we fix it and say so. This page is the
            public log; substantive corrections also get a note at the bottom of
            the story.
          </p>
        </div>
      </header>

      <div className="container-page py-10">
        <div className="mx-auto max-w-3xl">
          <section className="border border-line bg-paper p-6">
            <h2 className="font-serif text-2xl font-semibold">
              Report a correction
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Email{" "}
              <a
                href={`mailto:${site.email}?subject=Correction`}
                className="font-semibold text-highway underline decoration-amber underline-offset-2"
              >
                {site.email}
              </a>{" "}
              with the story URL and the specific claim you believe is wrong.
              Include a source if you have one. We aim to respond within one
              business day.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-slate">
              If someone is in immediate danger, call 911. For a highway
              emergency, use *55 from a mobile phone.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="font-serif text-2xl font-semibold">
              Correction log
            </h2>
            {corrections.length ? (
              <ul className="mt-3 divide-y divide-line border border-line bg-paper">
                {corrections.map((correction) => (
                  <li key={`${correction.slug}-${correction.date}`} className="p-5">
                    <p className="text-[10px] font-bold tracking-[0.14em] text-slate uppercase">
                      {formatDate(correction.date)}
                    </p>
                    <p className="mt-1 font-serif text-lg leading-snug font-semibold">
                      <Link
                        href={`/news/${correction.slug}`}
                        className="hover:underline hover:decoration-amber hover:decoration-2 hover:underline-offset-4"
                      >
                        {correction.story}
                      </Link>
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {correction.summary}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-3 border border-line bg-cream p-5">
                <p className="text-sm leading-relaxed text-ink-soft">
                  <strong>No corrections logged yet.</strong> When a substantive
                  correction is made, it will appear here with the story, the date
                  and a short description of what changed.
                </p>
              </div>
            )}
            <p className="mt-4 text-[12px] leading-relaxed text-slate">
              We do not silently delete errors. Minor style or typo fixes that do
              not change meaning are made without a log entry. See our{" "}
              <Link
                href="/editorial-standards"
                className="font-semibold text-highway underline decoration-amber underline-offset-2"
              >
                editorial standards
              </Link>{" "}
              for the full policy.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
