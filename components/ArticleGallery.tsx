"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { PostImage } from "@/lib/types";

function captionFor(image: PostImage): string {
  return image.caption || image.alt;
}

function Credit({ image }: { image: PostImage }) {
  if (!image.credit) return null;
  return (
    <>
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
        <span>{image.credit}</span>
      )}
      {image.license ? (
        <span>
          {" · "}
          {image.licenseUrl ? (
            <a
              href={image.licenseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-line underline-offset-2 hover:text-ink"
            >
              {image.license}
            </a>
          ) : (
            image.license
          )}
        </span>
      ) : null}
    </>
  );
}

export function ArticleGallery({
  images,
  title,
  priority = false,
}: {
  images: PostImage[];
  title: string;
  priority?: boolean;
}) {
  const [active, setActive] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const cover = images[0];
  const isOpen = active !== null;

  function open(index: number, trigger: HTMLElement) {
    triggerRef.current = trigger;
    setActive(index);
  }

  function close() {
    setActive(null);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setActive(null);
        window.requestAnimationFrame(() => triggerRef.current?.focus());
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActive((current) =>
          current === null ? null : (current - 1 + images.length) % images.length,
        );
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActive((current) =>
          current === null ? null : (current + 1) % images.length,
        );
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, images.length]);

  if (!cover) return null;

  const activeImage = active === null ? null : images[active];

  return (
    <figure className="mt-6">
      <button
        type="button"
        onClick={(event) => open(0, event.currentTarget)}
        className="group relative block aspect-[16/9] w-full overflow-hidden border border-line bg-cream text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highway"
        aria-label={`Open image 1 of ${images.length}: ${captionFor(cover)}`}
      >
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 760px, 100vw"
          quality={82}
          className="object-cover transition duration-500 group-hover:scale-[1.01]"
        />
        <span className="absolute right-2 bottom-2 bg-ink/85 px-2 py-1 text-[9px] font-bold tracking-[0.08em] text-paper uppercase">
          {images.length === 1 ? "View photo" : `${images.length} photos`}
        </span>
      </button>

      <figcaption className="mt-2 flex flex-wrap justify-between gap-2 text-[11px] text-slate">
        <span>
          {captionFor(cover)}
          {cover.caption && cover.caption !== cover.alt ? (
            <span className="sr-only">. {cover.alt}</span>
          ) : null}
        </span>
        <Credit image={cover} />
      </figcaption>

      {images.length > 1 ? (
        <div className="mt-3">
          <p className="kicker mb-2 text-slate">More images</p>
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={`${image.src}-${index}`}
                type="button"
                onClick={(event) => open(index, event.currentTarget)}
                aria-label={`Open image ${index + 1} of ${images.length}: ${captionFor(image)}`}
                aria-current={index === 0 ? "true" : undefined}
                className={`relative h-16 w-24 shrink-0 overflow-hidden border bg-cream ${
                  index === 0 ? "border-ink" : "border-line hover:border-ink"
                }`}
              >
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="96px"
                  quality={70}
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {activeImage ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink p-4 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Images from ${title}`}
          onClick={close}
        >
          <div
            className="relative flex max-h-full w-full max-w-6xl flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 pb-3 text-paper">
              <p className="text-[10px] font-bold tracking-[0.1em] uppercase">
                {(active ?? 0) + 1} / {images.length}
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className="border border-paper/30 px-3 py-1.5 text-[10px] font-bold tracking-[0.08em] uppercase hover:border-paper"
              >
                Close
              </button>
            </div>

            <div className="relative h-[68vh] w-full bg-black/20">
              <Image
                src={activeImage.src}
                alt={activeImage.alt}
                fill
                sizes="95vw"
                quality={88}
                className="object-contain"
              />
            </div>

            <div className="flex items-start justify-between gap-4 pt-3 text-paper">
              <div className="min-w-0">
                <p className="text-sm leading-relaxed">
                  {captionFor(activeImage)}
                </p>
                {activeImage.caption &&
                activeImage.caption !== activeImage.alt ? (
                  <p className="mt-1 text-[11px] leading-relaxed text-cream/70">
                    {activeImage.alt}
                  </p>
                ) : null}
                {activeImage.credit ? (
                  <p className="mt-1 text-[10px] text-cream/70">
                    {activeImage.creditUrl ? (
                      <a
                        href={activeImage.creditUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-cream/30 underline-offset-2 hover:text-paper"
                      >
                        {activeImage.credit}
                      </a>
                    ) : (
                      activeImage.credit
                    )}
                  </p>
                ) : null}
              </div>

              {images.length > 1 ? (
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setActive((current) =>
                        current === null
                          ? null
                          : (current - 1 + images.length) % images.length,
                      )
                    }
                    className="border border-paper/30 px-3 py-2 text-[10px] font-bold tracking-[0.08em] uppercase hover:border-paper"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActive((current) =>
                        current === null ? null : (current + 1) % images.length,
                      )
                    }
                    className="border border-paper/30 px-3 py-2 text-[10px] font-bold tracking-[0.08em] uppercase hover:border-paper"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </figure>
  );
}
