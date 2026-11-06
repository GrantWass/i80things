import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "Terms for using I-80 Things, an independent Nebraska I-80 news site.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main>
      <header className="border-b border-line bg-cream">
        <div className="container-page py-10 md:py-14">
          <p className="kicker text-amber-dark">Legal</p>
          <h1 className="mt-2 font-serif text-4xl leading-[1.05] font-semibold tracking-tight md:text-5xl">
            Terms of use
          </h1>
          <p className="mt-3 text-sm text-slate">Effective November 5, 2026</p>
        </div>
      </header>

      <div className="container-page py-10">
        <div className="article-prose mx-auto max-w-3xl">
          <h2>Use of the site</h2>
          <p>
            I-80 Things provides news and information about the Interstate 80
            corridor in Nebraska. You may read, share links to, and quote brief
            excerpts of our work with attribution and a link. You may not
            republish full stories, scrape the site at scale, or use our content
            to train a commercial model without written permission.
          </p>

          <h2>No legal or safety advice</h2>
          <p>
            Road conditions, weather and traffic information change constantly.
            Our stories are a snapshot, not a live guarantee. Always check{" "}
            <a href="https://511.nebraska.gov/" target="_blank" rel="noopener noreferrer">
              Nebraska 511
            </a>{" "}
            and the National Weather Service before driving. Nothing on this site
            is legal, medical or safety advice. If you are in danger, call 911.
          </p>

          <h2>Accuracy and corrections</h2>
          <p>
            We work to verify every claim and correct errors promptly. See our{" "}
            <Link href="/editorial-standards">editorial standards</Link> for how
            to report a correction. We are not liable for decisions made in
            reliance on a story that has become outdated; check the publication
            date and the linked primary source.
          </p>

          <h2>Third-party links and content</h2>
          <p>
            We link to official agencies, newsrooms and other sites. We do not
            control those sites and are not responsible for their content,
            availability or privacy practices. A link is not an endorsement.
          </p>

          <h2>Comments and submissions</h2>
          <p>
            If you send us a tip, photo or other material, you confirm that you
            have the right to share it and grant us permission to publish it with
            attribution unless you ask to remain anonymous. We may edit for
            length and clarity. We are not obligated to publish any submission.
          </p>

          <h2>Advertising</h2>
          <p>
            The site displays advertising, including Google AdSense. Advertisers
            are responsible for their own claims and offers. Sponsored content is
            labeled. See our <Link href="/privacy">privacy policy</Link> for how
            advertising cookies work.
          </p>

          <h2>Intellectual property</h2>
          <p>
            Our original text, graphics and site design are owned by I-80 Things
            unless otherwise credited. Agency documents, photographs and quoted
            material remain the property of their owners and are used under
            applicable law or license.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, I-80 Things is not liable for
            indirect, incidental or consequential damages arising from your use of
            the site or reliance on its content. The site is provided
            &ldquo;as is.&rdquo;
          </p>

          <h2>Governing law</h2>
          <p>
            These terms are governed by the laws of the State of Nebraska,
            without regard to conflict-of-law principles. Any dispute will be
            brought in the state or federal courts located in Nebraska.
          </p>

          <h2>Contact</h2>
          <p>
            Questions: <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
