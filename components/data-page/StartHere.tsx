import type { ReactNode } from "react";

/**
 * The "Start here" band: a bordered section holding the four biggest rows.
 *
 * The cards themselves stay with the page — the section owns the heading, the
 * note and the four-column grid, not the card content.
 */
export function StartHere({
  title,
  note,
  children,
  className = "",
}: {
  title: ReactNode;
  note: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`border border-line bg-paper p-5 md:p-7 ${className}`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker text-amber-dark">Start here</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold md:text-3xl">
            {title}
          </h2>
        </div>
        <p className="max-w-sm text-[11px] leading-relaxed text-slate">{note}</p>
      </div>
      <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {children}
      </div>
    </section>
  );
}

/**
 * A card whose whole face is one link, with a mobile target and a desktop
 * target so in-page anchors land on whichever layout is showing.
 *
 * The anchor pair is the point: two surfaces, one card body, no duplicated
 * markup in the page.
 */
export function AnchorCard({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <div className="group min-w-0 border border-line bg-cream p-4 break-words hover:border-ink">
      <a href={`#${id}-m`} className="block sm:hidden">
        {children}
      </a>
      <a href={`#${id}`} className="hidden sm:block">
        {children}
      </a>
    </div>
  );
}
