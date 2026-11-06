import Link from "next/link";
import { site } from "@/lib/site";
import { places } from "@/data/places";
import { topics } from "@/data/topics";
import { Brand } from "@/components/SiteHeader";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-ink text-cream">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Brand light />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/70">
              Independent coverage of Interstate 80 in Nebraska, from Omaha to
              Kimball.
            </p>
            <p className="mt-4 text-xs text-cream/50">
              {site.corridor}
              <br />
              Covering the corridor since {site.founded}.
            </p>
          </div>
          <div>
            <h2 className="kicker mb-3 text-amber">Corridor</h2>
            <ul className="space-y-2 text-sm text-cream/75">
              {places.slice(0, 6).map((p) => (
                <li key={p.slug}>
                  <Link href={`/cities/${p.slug}`} className="hover:text-paper">
                    {p.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/cities" className="text-cream/50 hover:text-paper">
                  All towns →
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="kicker mb-3 text-amber">Coverage</h2>
            <ul className="space-y-2 text-sm text-cream/75">
              <li>
                <Link href="/conditions" className="font-semibold text-cream hover:text-paper">
                  Road conditions
                </Link>
              </li>
              {topics.slice(0, 5).map((t) => (
                <li key={t.slug}>
                  <Link href={`/topics/${t.slug}`} className="hover:text-paper">
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="kicker mb-3 text-amber">The desk</h2>
            <ul className="space-y-2 text-sm text-cream/75">
              <li><Link href="/search" className="hover:text-paper">Search</Link></li>
              <li><Link href="/about" className="hover:text-paper">About & masthead</Link></li>
              <li><Link href="/editorial-standards" className="hover:text-paper">Editorial standards</Link></li>
              <li><Link href="/corrections" className="hover:text-paper">Corrections</Link></li>
              <li><Link href="/image-credits" className="hover:text-paper">Image credits</Link></li>
              <li><Link href="/sources" className="hover:text-paper">Source directory</Link></li>
              <li><Link href="/contact" className="hover:text-paper">Send a tip</Link></li>
              <li><Link href="/privacy" className="hover:text-paper">Privacy & cookies</Link></li>
              <li><Link href="/terms" className="hover:text-paper">Terms</Link></li>
              <li><a href="/feed.xml" className="hover:text-paper">RSS feed</a></li>
              <li>
                <a href={site.instagramUrl} className="hover:text-paper" rel="me noopener">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-3 border-t border-cream/15 pt-6 text-xs text-cream/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} I-80 Things. All rights reserved.{" "}
            <span className="text-cream/35">
              Not affiliated with NDOT or the Nebraska State Patrol.
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
