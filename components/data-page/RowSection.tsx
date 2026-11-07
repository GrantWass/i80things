import type { ReactNode } from "react";

export type Column = {
  label: string;
  className?: string;
};

/**
 * One grouped block of rows: heading, optional note, then the pair of layouts
 * every reference page needs — a stacked list on phones and a table from `sm`
 * up.
 *
 * The page supplies the row content and the cells; the module owns the
 * heading, the responsive switch, the scroll container, the table shell and
 * the per-row anchors.
 */
export function RowSection<T>({
  title,
  note,
  rows,
  rowKey,
  rowId,
  mobileId,
  columns,
  minWidth = "min-w-[48rem]",
  renderMobile,
  renderCells,
  mobileHint,
  mobileGap = "3",
  tableLabel,
  footer,
  className = "mt-10",
}: {
  title: ReactNode;
  note?: ReactNode;
  rows: readonly T[];
  rowKey: (row: T) => string;
  rowId?: (row: T) => string;
  mobileId?: (row: T) => string;
  columns: readonly Column[];
  minWidth?: string;
  /** Omit to show the table alone, with horizontal scrolling on phones. */
  renderMobile?: (row: T) => ReactNode;
  renderCells: (row: T) => ReactNode;
  mobileHint?: ReactNode;
  mobileGap?: "2" | "3";
  tableLabel?: string;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink pb-2">
        <h2 className="font-serif text-2xl font-semibold">{title}</h2>
        {note ? (
          <div className="shrink-0">
            {typeof note === "string" ? (
              <p className="text-[11px] font-semibold tracking-wide text-slate uppercase">
                {note}
              </p>
            ) : (
              note
            )}
          </div>
        ) : null}
      </div>

      {mobileHint ? (
        <p className="mt-2 text-[12px] text-slate sm:hidden">{mobileHint}</p>
      ) : null}

      {renderMobile ? (
        <ul
          className={`mt-3 ${mobileGap === "2" ? "space-y-2" : "space-y-3"} sm:hidden`}
        >
          {rows.map((row) => (
            <li
              key={rowKey(row)}
              id={mobileId ? mobileId(row) : rowId ? `${rowId(row)}-m` : undefined}
              className="scroll-mt-24 border border-line bg-paper p-4"
            >
              {renderMobile(row)}
            </li>
          ))}
        </ul>
      ) : null}

      <div
        className={
          renderMobile
            ? "mt-3 hidden overflow-x-auto border border-line sm:block"
            : "mt-2 overflow-x-auto border border-line"
        }
        {...(tableLabel
          ? { role: "region" as const, "aria-label": tableLabel, tabIndex: 0 }
          : {})}
      >
        <table
          className={`w-full ${minWidth} border-collapse text-left text-sm`}
        >
          <thead className="bg-cream text-[10px] tracking-[0.12em] text-slate uppercase">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.label}
                  className={`px-3 py-2 font-semibold ${column.className ?? ""}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                id={rowId ? rowId(row) : undefined}
                className="scroll-mt-24 bg-paper align-top"
              >
                {renderCells(row)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {footer ? <div className="mt-3">{footer}</div> : null}
    </section>
  );
}
