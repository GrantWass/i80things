import type { Metadata } from "next";
import { SearchClient } from "@/components/SearchClient";
import { JsonLd } from "@/components/JsonLd";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search I-80 Things stories and the verified source directory for Nebraska’s I-80 corridor.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SearchResultsPage",
          name: "Search I-80 Things",
          url: `${site.url}/search`,
          isPartOf: { "@id": `${site.url}/#website` },
        }}
      />

      <header className="border-b border-line bg-cream">
        <div className="container-page py-10 md:py-14">
          <p className="kicker text-amber-dark">Find it</p>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl leading-[1.05] font-semibold tracking-tight md:text-6xl">
            Search the corridor
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate">
            Search published stories and the 87-source directory. Try a town, a
            mile marker, a topic or an agency.
          </p>
        </div>
      </header>

      <div className="container-page py-10">
        <div className="mx-auto max-w-5xl">
          <SearchClient />
        </div>
      </div>
    </main>
  );
}
