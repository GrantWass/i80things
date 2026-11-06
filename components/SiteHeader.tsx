import Link from "next/link";
import { nav, site } from "@/lib/site";
import { formatDate } from "@/lib/utils";
import { TrackedLink } from "@/components/TrackedLink";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="sign-green flex h-11 w-12 shrink-0 flex-col items-center justify-center rounded-[4px] text-paper">
        <span className="text-[7px] font-bold tracking-[0.16em]">INTERSTATE</span>
        <span className="font-serif text-[26px] leading-[0.9] font-bold">80</span>
      </span>
      <span className="leading-none">
        <span
          className={`block font-serif text-[21px] font-bold tracking-tight ${
            light ? "text-paper" : "text-ink"
          }`}
        >
          I-80 Things
        </span>
        <span
          className={`mt-1 block text-[9px] font-semibold tracking-[0.19em] uppercase ${
            light ? "text-cream/70" : "text-slate"
          }`}
        >
          Nebraska corridor news
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <>
      <div className="bg-ink text-cream">
        <div className="container-page flex items-center justify-between gap-4 py-1.5 text-[10px] font-semibold tracking-[0.12em] uppercase">
          <span className="flex min-w-0 items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
            <span className="truncate sm:hidden">I-80 Nebraska</span>
            <span className="hidden truncate sm:inline">{site.corridor}</span>
          </span>
          <span className="hidden text-cream/70 sm:inline">
            {formatDate(new Date(), { month: "short", day: "numeric", year: "numeric" })} · Updated daily
          </span>
        </div>
      </div>
      <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur-md">
        <div className="container-page flex h-[68px] items-center justify-between gap-6">
          <Brand />
          <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[13px] font-semibold tracking-wide text-ink-soft transition hover:text-amber-dark"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/sources"
              className="hidden items-center gap-1.5 rounded-full border border-ink px-4 py-2 text-[11px] font-bold tracking-[0.1em] uppercase transition hover:bg-ink hover:text-paper sm:flex"
            >
              Source desk
            </Link>
            <TrackedLink
              href="/search"
              event="search_open"
              ariaLabel="Search I-80 Things"
              className="rounded-full border border-line p-2 text-ink-soft transition hover:border-ink hover:text-ink"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m16.5 16.5 4 4" strokeLinecap="round" />
              </svg>
            </TrackedLink>
            <TrackedLink
              href={site.instagramUrl}
              external
              event="instagram_open"
              ariaLabel="I-80 Things on Instagram"
              rel="me noopener"
              className="rounded-full border border-line p-2 text-ink-soft transition hover:border-ink hover:text-ink"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
              </svg>
            </TrackedLink>
            <details className="relative lg:hidden">
              <summary className="flex cursor-pointer list-none items-center rounded-full border border-line p-2 text-ink [&::-webkit-details-marker]:hidden">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                </svg>
                <span className="sr-only">Open menu</span>
              </summary>
              <div className="absolute right-0 mt-2 w-56 border border-line bg-paper p-2 shadow-xl">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block border-b border-line/60 px-3 py-2.5 text-sm font-semibold text-ink last:border-0 hover:bg-cream"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/admin"
                  className="block px-3 py-2.5 text-xs font-semibold text-slate hover:bg-cream"
                >
                  Staff admin
                </Link>
              </div>
            </details>
          </div>
        </div>
      </header>
    </>
  );
}
