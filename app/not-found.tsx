import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center">
      <div className="container-page py-16">
        <p className="kicker text-amber-dark">Exit not found</p>
        <h1 className="mt-2 max-w-2xl font-serif text-5xl leading-[1.02] font-semibold tracking-tight md:text-7xl">
          That exit doesn&apos;t exist.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-slate">
          The page you were looking for has moved or never existed. Take the
          next exit and try the corridor map.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/" className="bg-ink px-5 py-3 text-[11px] font-bold tracking-[0.1em] text-paper uppercase hover:bg-highway">
            Back to the homepage
          </Link>
          <Link href="/news" className="border border-ink px-5 py-3 text-[11px] font-bold tracking-[0.1em] uppercase hover:bg-cream">
            All stories
          </Link>
          <Link href="/sources" className="border border-line px-5 py-3 text-[11px] font-bold tracking-[0.1em] uppercase hover:border-ink">
            Source desk
          </Link>
        </div>
      </div>
    </main>
  );
}
