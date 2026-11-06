import Image from "next/image";
import type { PostImage } from "@/lib/types";

export function PostGallery({
  images,
  title,
}: {
  images: PostImage[];
  title: string;
}) {
  const extras = images.slice(1);
  if (!extras.length) return null;

  return (
    <section className="mt-8 border-t-2 border-ink pt-4">
      <h2 className="font-serif text-xl font-semibold">More images</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {extras.map((image, index) => (
          <figure key={`${image.src}-${index}`} className="border border-line bg-paper">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-cream">
              <Image
                src={image.src}
                alt={image.alt || `${title} — image ${index + 2}`}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                quality={82}
                className="object-cover"
              />
            </div>
            <figcaption className="p-3 text-[11px] leading-relaxed text-slate">
              <span className="block text-ink-soft">{image.alt}</span>
              {image.credit ? (
                <span className="mt-1 block">
                  {image.creditUrl ? (
                    <a
                      href={image.creditUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-line underline-offset-2 hover:text-ink"
                    >
                      {image.credit}
                    </a>
                  ) : (
                    image.credit
                  )}
                </span>
              ) : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
