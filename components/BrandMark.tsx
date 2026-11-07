import { createElement } from "react";
import { brand, brandMarkParts } from "@/lib/brand.mjs";

/** React wants camelCase SVG props; brand.mjs stores real SVG attribute names. */
const reactAttr = {
  "stroke-width": "strokeWidth",
  "text-anchor": "textAnchor",
  "font-family": "fontFamily",
  "font-size": "fontSize",
  "font-weight": "fontWeight",
  "letter-spacing": "letterSpacing",
} as const;

/**
 * The I-80 Things sign, drawn from the shared brand geometry.
 *
 * Size it with a height class only (`h-11 w-auto`); every instance then keeps
 * the same 56:44 proportions and cannot drift from the generated assets.
 */
export function BrandMark({ className }: { className?: string }) {
  const { width, height } = brand.mark;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={brand.name}
      className={`brand-mark ${className ?? ""}`.trim()}
    >
      {brandMarkParts().map((part, index) =>
        createElement(
          part.tag,
          {
            key: index,
            ...Object.fromEntries(
              Object.entries(part.attrs).map(([name, value]) => [
                reactAttr[name as keyof typeof reactAttr] ?? name,
                value,
              ]),
            ),
          },
          part.text,
        ),
      )}
    </svg>
  );
}
