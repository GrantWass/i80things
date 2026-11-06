import type { Post } from "@/lib/types";

const paths: Record<string, string> = {
  alert:
    "M12 3 2.5 20h19L12 3Zm0 5.5v6m0 3v.5",
  road: "M4 21 8 3m12 18L16 3M12 4v3m0 4v3m0 4v3",
  cloud:
    "M6.5 18a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 17.7 8 4 4 0 0 1 18 18H6.5Z",
  shield:
    "M12 3 5 6v5c0 4.5 3 7.5 7 10 4-2.5 7-5.5 7-10V6l-7-3Zm-3 9 2 2 4-4",
  route:
    "M6 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 0c0 4-6 2-6 6",
  town: "M3 21V9l6-4v16m0-9 6-3v12m0-7 6-2v9M7 11h1m-1 4h1m5-2h1m-1 4h1m5-3h1",
  briefcase:
    "M3 8h18v12H3V8Zm6 0V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18",
  book: "M4 5a2 2 0 0 1 2-2h5v18H6a2 2 0 0 1-2-2V5Zm9-2h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5",
  scanner: "M4 8h16v8H4V8Zm3 11h10M8 11h.01M11 11h.01M14 11h.01",
  link: "M9 15l6-6M8 7H6a4 4 0 0 0 0 8h2m8-8h2a4 4 0 0 1 0 8h-2",
};

export function Icon({
  name,
  className = "h-5 w-5",
}: {
  name?: string;
  className?: string;
}) {
  const d = paths[name ?? "link"] ?? paths.link;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

export function Arrow({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}
