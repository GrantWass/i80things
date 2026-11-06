import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { getAllPosts } from "@/lib/content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Image credits & licenses",
  description:
    "Photo credits and licenses for images used on I-80 Things, including Wikimedia Commons and public-domain sources.",
  alternates: { canonical: "/image-credits" },
};

export default function ImageCreditsPage() {
  const posts = getAllPosts().filter((post) => post.images.length > 0);

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Image credits & licenses",
          url: `${site.url}/image-credits`,
          description:
            "Photo credits and licenses for images used on I-80 Things.",
          isPartOf: { "@id": `${site.url}/#website` },
        }}
      />

      <header className="border-b border-line bg-cream">
        <div className="container-page py-10 md:py-14">
          <p className="kicker text-amber-dark">Credits</p>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl leading-[1.05] font-semibold tracking-tight md:text-6xl">
            Image credits &amp; licenses
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate">
            Every story image is credited. We use original graphics, public-domain
            material and openly licensed photos. If an image is credited
            incorrectly, tell us and we will fix or remove it.
          </p>
        </div>
      </header>

      <div className="container-page py-10">
        <div className="mx-auto max-w-3xl">
          <div className="border border-amber-dark/30 bg-amber/5 p-4">
            <p className="text-[12px] leading-relaxed text-ink-soft">
              Some photos are licensed under Creative Commons Attribution-ShareAlike
              (CC BY-SA). We crop and resize them for display; those adaptations
              remain under the same license. The credit line links to the source
              page, where the license and full attribution are available.
            </p>
          </div>

          {posts.length ? (
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {posts.map((post) => (
                <li key={post.slug} className="py-4">
                  <p className="font-serif text-lg leading-snug font-semibold">
                    <Link
                      href={`/news/${post.slug}`}
                      className="hover:underline hover:decoration-amber hover:decoration-2 hover:underline-offset-4"
                    >
                      {post.title}
                    </Link>
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {post.images.map((image, index) => (
                      <li
                        key={`${image.src}-${index}`}
                        className="text-[12px] leading-relaxed text-slate"
                      >
                        <span className="text-ink-soft">
                          {index === 0 ? "Cover: " : ""}
                          {image.alt}
                        </span>
                        {" — "}
                        {image.credit ?? "I-80 Things graphic"}
                        {image.creditUrl ? (
                          <>
                            {" · "}
                            <a
                              href={image.creditUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-highway underline decoration-amber underline-offset-2"
                            >
                              source &amp; license
                            </a>
                          </>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-8 text-sm text-slate">
              No story images have been added yet.
            </p>
          )}

          <p className="mt-8 text-[12px] leading-relaxed text-slate">
            Read the{" "}
            <Link
              href="/editorial-standards"
              className="font-semibold text-highway underline decoration-amber underline-offset-2"
            >
              editorial standards
            </Link>{" "}
            for our image policy, or{" "}
            <Link
              href="/contact"
              className="font-semibold text-highway underline decoration-amber underline-offset-2"
            >
              contact the desk
            </Link>{" "}
            with a correction.
          </p>
        </div>
      </div>
    </main>
  );
}
