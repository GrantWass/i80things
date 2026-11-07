import type { ReactNode } from "react";

export type DataSummaryItem = {
  value: ReactNode;
  label: string;
  detail?: ReactNode;
};

/**
 * A compact facts strip for the data pages. It replaces the tall three-card
 * "at a glance" blocks so the actual guide or table stays near the top.
 */
export function DataSummary({
  items,
  className = "",
}: {
  items: DataSummaryItem[];
  className?: string;
}) {
  return (
    <dl
      className={`flex flex-wrap items-baseline gap-x-6 gap-y-2 border-y border-line py-3 ${className}`}
    >
      {items.map((item, index) => (
        <div
          key={`${item.label}-${index}`}
          className="flex min-w-0 items-baseline gap-1.5"
        >
          <dt className="sr-only">{item.label}</dt>
          <dd className="text-[11px] leading-snug text-slate">
            <span className="font-serif text-xl leading-none font-semibold tabular-nums text-ink">
              {item.value}
            </span>{" "}
            {item.label}
            {item.detail ? (
              <span className="text-[10px]"> · {item.detail}</span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
