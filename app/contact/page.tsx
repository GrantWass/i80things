import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { places } from "@/data/places";

export const metadata: Metadata = {
  title: "Contact & send a tip",
  description:
    "Send a news tip, correction or source suggestion to the I-80 Things desk. We cover the I-80 corridor in Nebraska from Omaha to Kimball.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main>
      <header className="border-b border-line bg-cream">
        <div className="container-page py-10 md:py-14">
          <p className="kicker text-amber-dark">The desk</p>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl leading-[1.05] font-semibold tracking-tight md:text-6xl">
            Send a tip
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate">
            Crash, closure, construction, a local story we missed? Tell us what
            you saw and where, and include a photo if you have one.
          </p>
        </div>
      </header>

      <div className="container-page py-10">
        <div className="grid gap-10 lg:grid-cols-2">
          <section className="border border-line p-6">
            <h2 className="font-serif text-2xl font-semibold">News tips</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate">
              Email is the fastest way to reach us. Include the time, the
              location by mile marker or exit, and what you saw. Photos are
              welcome; tell us if you took them.
            </p>
            <a
              href={`mailto:${site.email}?subject=News%20tip`}
              className="mt-4 inline-block bg-ink px-5 py-3 text-[11px] font-bold tracking-[0.1em] text-paper uppercase hover:bg-highway"
            >
              {site.email}
            </a>
            <dl className="mt-6 space-y-3 border-t border-line pt-4 text-[13px]">
              <div>
                <dt className="text-[10px] font-bold tracking-[0.1em] text-slate uppercase">Corrections</dt>
                <dd className="mt-0.5">
                  Use the link at the bottom of the story, or email with
                  &ldquo;Correction&rdquo; in the subject.
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold tracking-[0.1em] text-slate uppercase">Source suggestions</dt>
                <dd className="mt-0.5">
                  Send the URL and what it covers. We test feeds before adding
                  them to the <Link href="/sources" className="text-highway underline decoration-amber underline-offset-2">source desk</Link>.
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold tracking-[0.1em] text-slate uppercase">Advertising</dt>
                <dd className="mt-0.5">
                  Local sponsorships are available. Email with
                  &ldquo;Advertising&rdquo; in the subject.
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold tracking-[0.1em] text-slate uppercase">Response time</dt>
                <dd className="mt-0.5">
                  One business day for corrections and confirmed inquiries. We
                  cannot respond to every anonymous tip.
                </dd>
              </div>
            </dl>
          </section>

          <section className="border border-line bg-cream p-6">
            <h2 className="font-serif text-2xl font-semibold">What makes a good tip</h2>
            <ul className="mt-3 space-y-3 text-[13px] leading-relaxed text-ink-soft">
              <li className="flex gap-2">
                <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 bg-amber" />
                <span><strong>Location.</strong> Mile marker, exit number and direction are more useful than a town name.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 bg-amber" />
                <span><strong>Time.</strong> When did you see it? A rough time is fine.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 bg-amber" />
                <span><strong>Source.</strong> Were you there? Did an agency tell you? Is there a document?</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 bg-amber" />
                <span><strong>Sensitivity.</strong> Say up front if you need to remain anonymous or if the tip involves a victim&apos;s family.</span>
              </li>
            </ul>

            <div className="mt-6 border-t border-line pt-4">
              <h3 className="kicker text-slate">Before you send</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-slate">
                If someone is in immediate danger, call 911. For highway
                emergencies, the State Patrol&apos;s \*55 line connects you to the
                nearest dispatch. Do not send us a tip while driving.
              </p>
            </div>
          </section>
        </div>

        <section className="mt-10">
          <h2 className="font-serif text-2xl font-semibold">Find your stretch</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {places.map((p) => (
              <Link
                key={p.slug}
                href={`/cities/${p.slug}`}
                className="flex items-center justify-between border border-line bg-paper px-3 py-2 text-[13px] hover:border-ink"
              >
                <span className="font-semibold">{p.name}</span>
                <span className="text-[9px] font-bold tracking-wider text-slate">MM {p.mileMarker.split("–")[0]}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
