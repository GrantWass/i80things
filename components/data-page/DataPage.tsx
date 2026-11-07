import type { ReactNode } from "react";
import { JsonLd } from "@/components/JsonLd";
import { DataPageLinks } from "@/components/DataPageLinks";

type JsonLdData = Record<string, unknown> | Record<string, unknown>[];

/**
 * The shell every reference page shares: structured data, the cream hero, the
 * centred body, and the cross-links to the other data pages.
 *
 * Pages pass their own kicker, title and intro, then lay out the body however
 * the data wants. Omitting `current` drops the cross-links.
 */
export function DataPage({
  jsonLd,
  kicker,
  title,
  intro,
  introWidth = "2xl",
  actions,
  before,
  current,
  children,
}: {
  jsonLd?: JsonLdData;
  kicker: ReactNode;
  title: ReactNode;
  intro: ReactNode;
  introWidth?: "2xl" | "3xl";
  actions?: ReactNode;
  before?: ReactNode;
  current?: string;
  children: ReactNode;
}) {
  return (
    <main>
      {before}
      {jsonLd ? <JsonLd data={jsonLd} /> : null}

      <header className="border-b border-line bg-cream">
        <div className="container-page py-10 md:py-14">
          <p className="kicker text-amber-dark">{kicker}</p>
          <h1 className="mt-2 max-w-4xl font-serif text-4xl leading-[1.05] font-semibold tracking-tight md:text-6xl">
            {title}
          </h1>
          <p
            className={`mt-4 ${
              introWidth === "3xl" ? "max-w-3xl" : "max-w-2xl"
            } text-base leading-relaxed text-slate`}
          >
            {intro}
          </p>
          {actions ? (
            <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div>
          ) : null}
        </div>
      </header>

      <div className="container-page py-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </div>

      {current ? (
        <div className="container-page pb-10">
          <div className="mx-auto max-w-5xl">
            <DataPageLinks current={current} />
          </div>
        </div>
      ) : null}
    </main>
  );
}
