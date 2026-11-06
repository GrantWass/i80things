import Link from "next/link";
import type { Post } from "@/lib/types";
import { formatDate, postImagePath } from "@/lib/utils";
import { placeName } from "@/data/places";
import { topicLabel } from "@/data/topics";
import { Arrow } from "@/components/Icon";

export function PostImage({
  post,
  className = "",
  priority = false,
  width = 1200,
  height = 675,
}: {
  post: Pick<Post, "image" | "imageAlt" | "title" | "city">;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}) {
  const src = postImagePath(post);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={post.imageAlt || post.title}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={className}
    />
  );
}

function Kicker({ post }: { post: Post }) {
  const topic = post.topics[0] ? topicLabel(post.topics[0]) : "Corridor news";
  return (
    <p className="kicker flex flex-wrap items-center gap-x-2 gap-y-1 text-slate">
      <span className="text-highway">{placeName(post.city)}</span>
      <span aria-hidden="true" className="inline-block h-1 w-1 bg-amber" />
      <span>{topic}</span>
    </p>
  );
}

function Meta({ post }: { post: Post }) {
  return (
    <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.09em] text-slate">
      {formatDate(post.date)} · {post.readingTime} min read
    </p>
  );
}

export function LeadCard({ post }: { post: Post }) {
  return (
    <article className="group">
      <Link href={`/news/${post.slug}`} className="block">
        <div className="overflow-hidden border border-line bg-cream">
          <PostImage
            post={post}
            priority
            className="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        </div>
        <div className="pt-4">
          <Kicker post={post} />
          <h2 className="mt-2 font-serif text-3xl leading-[1.08] font-semibold tracking-tight text-ink md:text-[2.65rem]">
            <span className="decoration-amber decoration-2 underline-offset-4 group-hover:underline">
              {post.title}
            </span>
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate">
            {post.dek}
          </p>
          <Meta post={post} />
        </div>
      </Link>
    </article>
  );
}

export function StandardCard({
  post,
  priority = false,
}: {
  post: Post;
  priority?: boolean;
}) {
  return (
    <article className="group">
      <Link href={`/news/${post.slug}`} className="block">
        <div className="overflow-hidden border border-line bg-cream">
          <PostImage
            post={post}
            priority={priority}
            className="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        </div>
        <div className="pt-3">
          <Kicker post={post} />
          <h3 className="mt-1.5 font-serif text-xl leading-tight font-semibold text-ink decoration-amber decoration-2 underline-offset-4 group-hover:underline">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate">
            {post.dek}
          </p>
          <Meta post={post} />
        </div>
      </Link>
    </article>
  );
}

export function CompactCard({
  post,
  index,
}: {
  post: Post;
  index?: number;
}) {
  return (
    <article className="group border-t border-line py-4 first:border-t-0 first:pt-0">
      <Link href={`/news/${post.slug}`} className="flex gap-4">
        {typeof index === "number" ? (
          <span className="mt-0.5 font-serif text-2xl leading-none font-semibold text-amber">
            {String(index + 1).padStart(2, "0")}
          </span>
        ) : null}
        <div>
          <Kicker post={post} />
          <h3 className="mt-1 font-serif text-lg leading-snug font-semibold text-ink group-hover:underline group-hover:decoration-amber group-hover:decoration-2 group-hover:underline-offset-4">
            {post.title}
          </h3>
          <Meta post={post} />
        </div>
      </Link>
    </article>
  );
}

export function HorizontalCard({ post }: { post: Post }) {
  return (
    <article className="group border-t border-line py-5 first:border-t-0 first:pt-0">
      <Link href={`/news/${post.slug}`} className="grid gap-4 sm:grid-cols-[13rem_1fr]">
        <div className="overflow-hidden border border-line bg-cream">
          <PostImage
            post={post}
            className="aspect-[16/9] h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        </div>
        <div>
          <Kicker post={post} />
          <h3 className="mt-1 font-serif text-2xl leading-tight font-semibold text-ink group-hover:underline group-hover:decoration-amber group-hover:decoration-2 group-hover:underline-offset-4">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate">
            {post.dek}
          </p>
          <Meta post={post} />
        </div>
      </Link>
    </article>
  );
}

export function SectionHeading({
  title,
  href,
  linkLabel = "See all",
  kicker,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  kicker?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 border-b-2 border-ink pb-2">
      <div>
        {kicker ? <p className="kicker mb-1 text-amber-dark">{kicker}</p> : null}
        <h2 className="font-serif text-2xl leading-none font-semibold text-ink">
          {title}
        </h2>
      </div>
      {href ? (
        <Link
          href={href}
          className="kicker flex shrink-0 items-center gap-1.5 text-highway hover:text-amber-dark"
        >
          {linkLabel} <Arrow className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}
