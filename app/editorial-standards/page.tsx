import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { scannerLegalNote } from "@/lib/sources";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Editorial standards",
  description:
    "How I-80 Things sources crashes and closures, handles scanner traffic, credits images and corrects mistakes.",
  alternates: { canonical: "/editorial-standards" },
};

export default function StandardsPage() {
  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Editorial standards",
          url: `${site.url}/editorial-standards`,
          isPartOf: { "@id": `${site.url}/#website` },
          about: "Editorial standards, verification and corrections policy",
        }}
      />

      <header className="border-b border-line bg-cream">
        <div className="container-page py-10 md:py-14">
          <p className="kicker text-amber-dark">Newsroom policy</p>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl leading-[1.05] font-semibold tracking-tight md:text-6xl">
            Editorial standards
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate">
            How we source, correct and credit our reporting. Last updated
            November 5, 2026.
          </p>
        </div>
      </header>

      <div className="container-page py-10">
        <div className="article-prose mx-auto max-w-3xl">
          <h2>Sourcing hierarchy</h2>
          <p>
            Not all sources are equal. When they conflict, we prefer the one
            closest to the incident and most accountable for the claim:
          </p>
          <ol>
            <li>
              <strong>Primary official records:</strong> Nebraska State Patrol
              releases, NDOT notices, Nebraska 511 incident entries, National
              Weather Service warnings, court and public records.
            </li>
            <li>
              <strong>Direct agency confirmation:</strong> a public information
              officer, incident commander or dispatch supervisor confirming a
              specific fact.
            </li>
            <li>
              <strong>On-the-record reporting:</strong> a named person with direct
              knowledge, quoted accurately.
            </li>
            <li>
              <strong>Other newsrooms:</strong> credited and linked. We add
              context; we do not republish their reporting.
            </li>
            <li>
              <strong>Scanner traffic and social posts:</strong> tips only.
              Never sufficient for publication on their own.
            </li>
          </ol>

          <h2>Crashes and closures</h2>
          <p>
            A crash story requires a confirmed location (mile marker and
            direction), the responsible agency, and a status. We do not publish
            injury descriptions, causes or fatality counts from scanner traffic.
            We do not name victims until the agency has released the name or the
            family has spoken publicly.
          </p>
          <p>
            Closures are reported only from NDOT, Nebraska 511 or the State
            Patrol. If a closure is lifted, we update the story and note the time.
          </p>

          <h2>Scanner policy</h2>
          <p>{scannerLegalNote}</p>
          <p>
            In practice: we listen, we take notes, and we call the agency. We do
            not host or rebroadcast audio, publish tactical movements, or reveal
            information that could endanger responders or people involved. We do
            not defeat the intentional delays some agencies apply to public
            streams.
          </p>

          <h2>Images and credits</h2>
          <p>
            We use original graphics, licensed images or public-domain material.
            Every image carries a credit and, where required, a link to the
            license. We do not scrape and republish newsroom photographs. If you
            believe an image is credited incorrectly, contact us and we will fix
            or remove it promptly.
          </p>

          <h2>Corrections</h2>
          <p>
            When we get a fact wrong, we fix it quickly and say so. Substantive
            corrections get a note at the bottom of the story describing what
            changed and when. We do not silently delete errors. To report one,
            use the &ldquo;Report a correction&rdquo; link on any story or email{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a> with the URL and the
            specific claim. The public log is at{" "}
            <Link href="/corrections">/corrections</Link>.
          </p>

          <h2>Advertising</h2>
          <p>
            Advertising is sold separately from editorial. Sponsored content is
            labeled. Advertisers have no role in story selection or coverage.
          </p>

          <h2>Tips and confidentiality</h2>
          <p>
            We protect confidential sources. Tell us at the start if a tip is
            sensitive, and use a channel you consider secure. We will not publish
            identifying information about a person who asked to remain
            anonymous unless there is an overriding public interest and we have
            discussed it with them.
          </p>

          <h2>Contact</h2>
          <p>
            Editorial: <a href={`mailto:${site.email}`}>{site.email}</a>. We aim
            to respond to corrections and confirmed inquiries within one business
            day. See also our <Link href="/about">about page</Link> and{" "}
            <Link href="/sources">source directory</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}
