import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy & cookies",
  description:
    "How I-80 Things handles data, cookies and advertising, including Google AdSense and your privacy choices.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main>
      <header className="border-b border-line bg-cream">
        <div className="container-page py-10 md:py-14">
          <p className="kicker text-amber-dark">Legal</p>
          <h1 className="mt-2 font-serif text-4xl leading-[1.05] font-semibold tracking-tight md:text-5xl">
            Privacy & cookies
          </h1>
          <p className="mt-3 text-sm text-slate">Effective November 5, 2026</p>
        </div>
      </header>

      <div className="container-page py-10">
        <div className="article-prose mx-auto max-w-3xl">
          <p>
            I-80 Things (&ldquo;we,&rdquo; &ldquo;us&rdquo;) publishes news about
            the Interstate 80 corridor in Nebraska at{" "}
            <Link href="/">{site.url.replace(/^https?:\/\//, "")}</Link>. This
            page explains what we collect, how we use it, and the choices you
            have. It is written to be read, not to hide behind.
          </p>

          <h2>What we collect</h2>
          <p>
            <strong>Information you give us.</strong> If you email a tip, a
            correction or an advertising inquiry, we receive your email address
            and whatever you include. We use it to respond and, if you are a
            source, to follow up. We do not sell it.
          </p>
          <p>
            <strong>Technical information.</strong> Our hosting provider (Vercel)
            processes standard server logs — IP address, browser type, requested
            URL, timestamp and approximate region — to deliver the site and
            protect it from abuse. We do not build individual profiles from these
            logs.
          </p>
          <p>
            <strong>Cookies and local storage.</strong> We store a small
            preference when you dismiss the cookie notice. Advertising partners
            may set their own cookies as described below. We use Vercel
            Analytics, which is cookieless and does not build a cross-site
            advertising profile; we do not use third-party analytics that track
            you across sites.
          </p>

          <h2>Advertising</h2>
          <p>
            We use Google AdSense to display advertising. Google and its partners
            may use cookies, including the DoubleClick cookie, to serve and
            measure ads based on your visits to this and other websites.
          </p>
          <ul>
            <li>
              Google&apos;s use of advertising cookies enables it and its partners
              to serve ads based on your visits to this site and other sites on
              the internet.
            </li>
            <li>
              You can opt out of personalized advertising by visiting{" "}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
                Google Ads Settings
              </a>
              .
            </li>
            <li>
              You can learn about third-party vendors&apos; practices and opt-outs
              at{" "}
              <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">
                aboutads.info
              </a>{" "}
              and{" "}
              <a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer">
                youronlinechoices.com
              </a>
              .
            </li>
          </ul>
          <p>
            For visitors in the European Economic Area, the United Kingdom and
            Switzerland, we rely on Google&apos;s certified consent management
            platform to obtain consent before personalized ads are served. You
            can change your choice through the consent message or your browser
            settings.
          </p>

          <h2>Your privacy rights</h2>
          <p>
            Depending on where you live, you may have the right to know what
            personal information we hold, request a copy, correct it, delete it,
            or opt out of the sale or sharing of personal information. We do not
            sell personal information as that term is commonly defined. To make a
            request, email{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a> with
            &ldquo;Privacy request&rdquo; in the subject. We may need to verify
            your identity before responding.
          </p>
          <p>
            California residents: you may request disclosure of the categories of
            personal information collected and the purposes for which it is used,
            and you may request deletion. We will not discriminate against you
            for exercising these rights.
          </p>

          <h2>Data retention</h2>
          <p>
            Server logs are retained by our hosting provider for a limited period
            for security and operations. Emails are retained as long as needed to
            handle your request, maintain a source relationship or comply with
            law. You can ask us to delete correspondence at any time.
          </p>

          <h2>Children</h2>
          <p>
            The site is intended for a general news audience and is not directed
            at children under 13. We do not knowingly collect personal
            information from children. If you believe a child has provided
            information, contact us and we will delete it.
          </p>

          <h2>External links</h2>
          <p>
            We link to official agencies, newspapers and other websites. Those
            sites have their own privacy practices, and this policy does not
            apply to them.
          </p>

          <h2>Changes</h2>
          <p>
            If we make a material change to this policy, we will update the
            effective date and, where appropriate, note the change on the
            homepage. Continued use of the site after an update means you accept
            the revised policy.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about privacy: <a href={`mailto:${site.email}`}>{site.email}</a>.
            See also our <Link href="/terms">terms of use</Link> and{" "}
            <Link href="/editorial-standards">editorial standards</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}
