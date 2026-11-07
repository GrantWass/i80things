/**
 * Single source of truth for the I-80 Things brand.
 *
 * Imported by app code (TypeScript infers types from the JSDoc) and by the
 * asset scripts, so the mark geometry, palette and copy exist in exactly one
 * place. The wordmark uses `textLength`/`lengthAdjust`, which locks its width
 * to the badge no matter which font the renderer resolves — that is what keeps
 * it from clipping the way hand-sized HTML text did.
 */

/** @typedef {Record<string, string | number>} SvgAttrs */

export const brandColors = /** @type {const} */ ({
  ink: "#14150f",
  inkSoft: "#2b2d24",
  paper: "#f7f4ec",
  cream: "#efe9db",
  line: "#d8d1c0",
  slate: "#5d6155",
  amber: "#e3a008",
  amberDark: "#7c5500",
  highway: "#14432f",
  highwayLight: "#1d5c40",
  alert: "#b3392b",
});

const sansStack = 'Arial, Helvetica, sans-serif';
const serifStack = "ui-serif, Georgia, 'Times New Roman', serif";

export const brand = /** @type {const} */ ({
  name: "I-80 Things",
  markLabel: "INTERSTATE",
  markNumber: "80",
  descriptor: "Nebraska corridor news",
  /** Horizontal sign lockup used in the header, footer and staff desk. */
  mark: {
    width: 56,
    height: 44,
    radius: 4,
    ring: { inset: 3, width: 2, radius: 2 },
    label: { size: 6, width: 44, baseline: 14, tracking: 0.8 },
    number: { size: 24, baseline: 38 },
    sans: sansStack,
    serif: serifStack,
  },
  /** Square lockup used for favicons, PWA icons and social avatars. */
  icon: {
    size: 64,
    radius: 10,
    ring: { inset: 4, width: 2, radius: 7 },
    label: { size: 6.5, width: 50, baseline: 26, tracking: 1.1 },
    number: { size: 30, baseline: 53 },
    sans: sansStack,
    serif: serifStack,
  },
});

/**
 * @param {SvgAttrs} attrs
 * @returns {string}
 */
function serialize(attrs) {
  return Object.entries(attrs)
    .map(([key, value]) => `${key}="${String(value).replace(/"/g, "&quot;")}"`)
    .join(" ");
}

/**
 * The horizontal mark as renderer-agnostic parts, shared by the inline React
 * component and the string builder used for generated files.
 *
 * @param {{ serif?: string, sans?: string }} [overrides]
 * @returns {Array<{ tag: "rect" | "text", attrs: SvgAttrs, text?: string }>}
 */
export function brandMarkParts(overrides = {}) {
  const { width, height, radius, ring, label, number } = brand.mark;
  const center = width / 2;
  return [
    {
      tag: "rect",
      attrs: {
        width,
        height,
        rx: radius,
        fill: brandColors.highway,
      },
    },
    {
      tag: "rect",
      attrs: {
        x: ring.inset,
        y: ring.inset,
        width: width - ring.inset * 2,
        height: height - ring.inset * 2,
        rx: ring.radius,
        fill: "none",
        stroke: brandColors.paper,
        "stroke-width": ring.width,
      },
    },
    {
      tag: "text",
      attrs: {
        x: center,
        y: label.baseline,
        "text-anchor": "middle",
        "font-family": overrides.sans ?? brand.mark.sans,
        "font-size": label.size,
        "font-weight": 700,
        "letter-spacing": label.tracking,
        textLength: label.width,
        lengthAdjust: "spacingAndGlyphs",
        fill: brandColors.paper,
      },
      text: brand.markLabel,
    },
    {
      tag: "text",
      attrs: {
        x: center,
        y: number.baseline,
        "text-anchor": "middle",
        "font-family": overrides.serif ?? brand.mark.serif,
        "font-size": number.size,
        "font-weight": 700,
        fill: brandColors.paper,
      },
      text: brand.markNumber,
    },
  ];
}

/**
 * @param {{ size?: number, serif?: string, sans?: string }} [options]
 * @returns {string}
 */
export function brandMarkSvg(options = {}) {
  const { width, height } = brand.mark;
  const size = options.size ?? height;
  const scale = size / height;
  const attrs = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: `0 0 ${width} ${height}`,
    width: Math.round(width * scale),
    height: Math.round(height * scale),
    role: "img",
    "aria-label": brand.name,
  };
  const body = brandMarkParts(options)
    .map((part) =>
      part.text === undefined
        ? `<${part.tag} ${serialize(part.attrs)}/>`
        : `<${part.tag} ${serialize(part.attrs)}>${part.text}</${part.tag}>`,
    )
    .join("");
  return `<svg ${serialize(attrs)}>${body}</svg>`;
}

/**
 * The Nebraska crest: traced state silhouette between two husked cobs, sized
 * for the 64px square icon. Path data lives in local 100x45.8 (state) and
 * 24x48 (cob) spaces and is transformed into place.
 */
const crest = {
  nebraska:
    "M0 19.9L0 0L63.5 0L64.1 1L67.3 2.5L68.8 3.6L69.9 3.4L70.6 2.2L71 2L72.8 2.4L77.7 2.3L79.1 3.3L81.7 4.1L83.8 5.1L84 6.1L85.1 7.6L87.7 8.1L87.3 9.9L88.3 11.4L88.4 11.8L88 12.1L88.1 12.7L89 14.6L90.6 15.7L90.2 16.8L91.3 18.4L91.2 19.6L90.7 20.1L91 20.6L90.7 21.2L91 22.3L91.6 22.8L91.7 22.5L92.1 22.5L92.9 23.9L92.6 25.2L93.1 25.7L93.2 26.4L92.9 27.6L93.8 28L93.6 30.5L94 30.9L94.1 32.4L93.4 34.9L94.5 35.8L95 36.6L94.7 37L94.8 37.7L95.4 37.8L95.6 37.5L96 37.9L95.6 38.5L96.4 40.6L97.2 41.4L97.2 41.8L100 45.8L22.9 45.8L22.9 30.5L0 30.5Z",
  cob: {
    left:
      "M11.6 44.5C8 41.5 5.2 36.5 4.2 30.5c-.9-5.4-.2-9.6 1.4-12.4 1.6 2.4 2.3 6.2 2.6 10.2.4 5 1.5 10.4 3.4 16.2Z",
    right:
      "M12.4 44.5c3.6-3 6.4-8 7.4-14 .9-5.4.2-9.6-1.4-12.4-1.6 2.4-2.3 6.2-2.6 10.2-.4 5-1.5 10.4-3.4 16.2Z",
    body:
      "M12 3.5c3.6 0 5.8 4 5.8 11v14.5c0 7.5-2.6 12-5.8 12s-5.8-4.5-5.8-12V14.5c0-7 2.2-11 5.8-11Z",
    kernels: [
      [9.7, 11], [12, 11], [14.3, 11],
      [9.5, 14.4], [12, 14.4], [14.5, 14.4],
      [9.3, 17.8], [12, 17.8], [14.7, 17.8],
      [9.3, 21.2], [12, 21.2], [14.7, 21.2],
      [9.5, 24.6], [12, 24.6], [14.5, 24.6],
    ],
  },
};

/** @returns {string} */
function crestBody() {
  const cob = (x) => `
    <g transform="translate(${x} 5.6) scale(0.375 0.3)">
      <path d="${crest.cob.left}" fill="${brandColors.cream}" stroke="${brandColors.line}" stroke-width="1.2"/>
      <path d="${crest.cob.right}" fill="${brandColors.cream}" stroke="${brandColors.line}" stroke-width="1.2"/>
      <path d="${crest.cob.body}" fill="${brandColors.amber}" stroke="${brandColors.amberDark}" stroke-width="1.4"/>
      <g fill="${brandColors.amberDark}" opacity=".45">
        ${crest.cob.kernels.map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="0.95"/>`).join("")}
      </g>
    </g>`;
  return `
    <g transform="rotate(-7 13.5 13)">${cob(9)}</g>
    <g transform="translate(64 0) scale(-1 1)"><g transform="rotate(-7 13.5 13)">${cob(9)}</g></g>
    <g transform="translate(19.4 7.4) scale(0.263)">
      <path d="${crest.nebraska}" fill="${brandColors.paper}"/>
    </g>`;
}

/**
 * Square lockup used for icons. Same rules as the mark: fixed viewBox, fixed
 * label width, so no font can overflow the badge. Pass `crest: true` for the
 * full Nebraska mark (avatars, OG cards, print); the favicon stays plain.
 *
 * @param {{ size?: number, serif?: string, sans?: string, crest?: boolean }} [options]
 * @returns {string}
 */
export function brandIconSvg(options = {}) {
  const { size, radius, ring, label, number } = brand.icon;
  const withCrest = options.crest === true;
  const labelBaseline = withCrest ? 30 : label.baseline;
  const numberBaseline = withCrest ? 55 : number.baseline;
  const numberSize = withCrest ? 29 : number.size;
  const center = size / 2;
  const attrs = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: `0 0 ${size} ${size}`,
    width: options.size ?? size,
    height: options.size ?? size,
    role: "img",
    "aria-label": brand.name,
  };
  const body = [
    `<rect ${serialize({ width: size, height: size, rx: radius, fill: brandColors.highway })}/>`,
    `<rect ${serialize({
      x: ring.inset,
      y: ring.inset,
      width: size - ring.inset * 2,
      height: size - ring.inset * 2,
      rx: ring.radius,
      fill: "none",
      stroke: brandColors.paper,
      "stroke-width": ring.width,
    })}/>`,
    withCrest ? crestBody() : "",
    `<text ${serialize({
      x: center,
      y: labelBaseline,
      "text-anchor": "middle",
      "font-family": options.sans ?? brand.icon.sans,
      "font-size": label.size,
      "font-weight": 700,
      "letter-spacing": label.tracking,
      textLength: label.width,
      lengthAdjust: "spacingAndGlyphs",
      fill: brandColors.paper,
    })}>${brand.markLabel}</text>`,
    `<text ${serialize({
      x: center,
      y: numberBaseline,
      "text-anchor": "middle",
      "font-family": options.serif ?? brand.icon.serif,
      "font-size": numberSize,
      "font-weight": 700,
      fill: brandColors.paper,
    })}>${brand.markNumber}</text>`,
  ].join("");
  return `<svg ${serialize(attrs)}>${body}</svg>`;
}
