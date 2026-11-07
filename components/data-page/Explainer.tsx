import type { ReactNode } from "react";

/**
 * The three-up "how to use it" explainer that sits under the summary strip on
 * the reference pages: kicker, then one short paragraph each.
 */
export function Explainer({
  items,
  className = "mt-4",
}: {
  items: readonly { title: string; body: ReactNode }[];
  className?: string;
}) {
  return (
    <div
      className={`grid gap-4 border border-line bg-paper p-5 sm:grid-cols-3 ${className}`}
    >
      {items.map((item) => (
        <div key={item.title}>
          <p className="kicker text-amber-dark">{item.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {item.body}
          </p>
        </div>
      ))}
    </div>
  );
}
