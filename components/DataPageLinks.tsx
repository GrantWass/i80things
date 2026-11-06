import Link from "next/link";

const links = [
  { href: "/exits", label: "Exits" },
  { href: "/rest-areas", label: "Rest areas" },
  { href: "/truck-parking", label: "Truck parking" },
  { href: "/construction", label: "Construction" },
  { href: "/demographics", label: "Demographics" },
  { href: "/distances", label: "Distances" },
];

export function DataPageLinks({ current }: { current: string }) {
  return (
    <nav
      aria-label="I-80 data pages"
      className="mt-8 border-t border-line pt-4"
    >
      <p className="kicker text-slate">More data pages</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={link.href === current ? "page" : undefined}
            className={`inline-flex min-h-11 items-center border px-3 py-2 text-[10px] font-bold tracking-[0.06em] uppercase transition ${
              link.href === current
                ? "border-ink bg-ink text-paper"
                : "border-line bg-paper text-ink-soft hover:border-ink"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
