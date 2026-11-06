import {
  I80_PATH,
  NEBRASKA_OUTLINE,
  PLATTE_RIVER,
} from "@/data/nebraska-geography";

/**
 * Geometry for the corridor map.
 *
 * The same Nebraska outline, I-80 centerline and towns are projected two
 * ways: a wide, north-up map for tablets and desktop, and a rotated map for
 * phones. The rotated map uses the state's long axis as its vertical axis so
 * the whole corridor fits inside a 350px-wide screen without sideways
 * scrolling or microscopic labels.
 */

export type Point = { x: number; y: number };
export type RoutePosition = Point & { nx: number; ny: number };
export type MapOrientation = "horizontal" | "vertical";

export type CorridorTown = {
  name: string;
  mile: number;
  lon: number;
  lat: number;
  /** Label placement on the north-up map. */
  label: "above" | "below";
  /** Extra separation when an event marker sits close to the label. */
  labelShift?: number;
  minor?: boolean;
};

export const CORRIDOR_TOWNS: CorridorTown[] = [
  { name: "Kimball", mile: 22, lon: -103.663, lat: 41.2358, label: "above" },
  { name: "Sidney", mile: 59, lon: -102.9777, lat: 41.1428, label: "above" },
  { name: "Ogallala", mile: 126, lon: -101.7199, lat: 41.1281, label: "above" },
  {
    name: "North Platte",
    mile: 183,
    lon: -100.7654,
    lat: 41.1239,
    label: "above",
  },
  {
    name: "Lexington",
    mile: 237,
    lon: -99.7415,
    lat: 40.7808,
    label: "below",
    minor: true,
  },
  { name: "Kearney", mile: 275, lon: -99.0817, lat: 40.6995, label: "above" },
  {
    name: "Grand Island",
    mile: 312,
    lon: -98.342,
    lat: 40.9247,
    label: "above",
  },
  {
    name: "York",
    mile: 348,
    lon: -97.592,
    lat: 40.8681,
    label: "below",
    labelShift: 8,
  },
  {
    name: "Seward",
    mile: 379,
    lon: -97.0986,
    lat: 40.9072,
    label: "above",
    minor: true,
  },
  { name: "Lincoln", mile: 398, lon: -96.7026, lat: 40.8136, label: "below" },
  { name: "Omaha", mile: 446, lon: -95.9345, lat: 41.2565, label: "above" },
];

export const CORRIDOR_MIN_MILE = 22;
export const CORRIDOR_MAX_MILE = 454;

const LON_MIN = -104.053;
const LON_MAX = -95.308;
const LAT_MIN = 39.99;
const LAT_MAX = 43.01;
const MID_LAT = (LAT_MIN + LAT_MAX) / 2;
const LON_SCALE = Math.cos((MID_LAT * Math.PI) / 180);
const SPAN_X = (LON_MAX - LON_MIN) * LON_SCALE;
const SPAN_Y = LAT_MAX - LAT_MIN;

type Projector = (lon: number, lat: number) => Point;

type Segment<T extends Point> = { p0: T; c1: Point; c2: Point; p1: T };

function polylinePath(points: Point[], close = false): string {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  const body = rest
    .map((point) => `L ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" ");
  return `M ${first.x.toFixed(1)} ${first.y.toFixed(1)} ${body}${close ? " Z" : ""}`;
}

/**
 * Catmull–Rom through the supplied points, emitted as cubic Béziers. The
 * segment list is kept so events can be interpolated on the same curve that
 * is drawn, rather than on the straight line between anchors.
 */
function smoothPath<T extends Point>(points: T[]): {
  d: string;
  segments: Segment<T>[];
} {
  if (points.length === 0) return { d: "", segments: [] };
  const segments: Segment<T>[] = [];
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? points[i + 1];
    const c1 = {
      x: p1.x + (p2.x - p0.x) / 6,
      y: p1.y + (p2.y - p0.y) / 6,
    };
    const c2 = {
      x: p2.x - (p3.x - p1.x) / 6,
      y: p2.y - (p3.y - p1.y) / 6,
    };
    d += ` C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    segments.push({ p0: p1, c1, c2, p1: p2 });
  }
  return { d, segments };
}

function buildPaths(project: Projector) {
  const stateD = polylinePath(
    NEBRASKA_OUTLINE.map(([lon, lat]) => project(lon, lat)),
    true,
  );
  const riverD = smoothPath(
    PLATTE_RIVER.map(([lon, lat]) => project(lon, lat)),
  ).d;
  const routePoints = I80_PATH.map((anchor) => ({
    ...project(anchor.lon, anchor.lat),
    mile: anchor.mile,
  }));
  const route = smoothPath(routePoints);

  /** Position and unit normal at a Nebraska mile marker on the drawn curve. */
  const pointAtMile = (mile: number): RoutePosition => {
    const clamped = Math.max(
      routePoints[0].mile,
      Math.min(routePoints[routePoints.length - 1].mile, mile),
    );
    const segment =
      route.segments.find((candidate) => clamped <= candidate.p1.mile) ??
      route.segments[route.segments.length - 1];
    const span = segment.p1.mile - segment.p0.mile || 1;
    const t = Math.max(0, Math.min(1, (clamped - segment.p0.mile) / span));
    const mt = 1 - t;

    const x =
      mt ** 3 * segment.p0.x +
      3 * mt ** 2 * t * segment.c1.x +
      3 * mt * t ** 2 * segment.c2.x +
      t ** 3 * segment.p1.x;
    const y =
      mt ** 3 * segment.p0.y +
      3 * mt ** 2 * t * segment.c1.y +
      3 * mt * t ** 2 * segment.c2.y +
      t ** 3 * segment.p1.y;

    const dx =
      3 * mt ** 2 * (segment.c1.x - segment.p0.x) +
      6 * mt * t * (segment.c2.x - segment.c1.x) +
      3 * t ** 2 * (segment.p1.x - segment.c2.x);
    const dy =
      3 * mt ** 2 * (segment.c1.y - segment.p0.y) +
      6 * mt * t * (segment.c2.y - segment.c1.y) +
      3 * t ** 2 * (segment.p1.y - segment.c2.y);
    const length = Math.hypot(dx, dy) || 1;

    return { x, y, nx: -dy / length, ny: dx / length };
  };

  return { stateD, riverD, routeD: route.d, pointAtMile };
}

export type MapLabel = { x: number; y: number; rotate?: number };
export type NeighborLabel = MapLabel & { text: string };

export type CorridorMapModel = {
  orientation: MapOrientation;
  viewW: number;
  viewH: number;
  stateD: string;
  riverD: string;
  routeD: string;
  pointAtMile: (mile: number) => RoutePosition;
  project: Projector;
  neighbors: NeighborLabel[];
  stateLabel: MapLabel | null;
  plattLabel: MapLabel | null;
  north: {
    x: number;
    y: number;
    direction: "up" | "right";
    labelX: number;
    labelY: number;
  };
  scale: { x: number; y: number; width: number; miles: number };
  shield: { x: number; y: number } | null;
};

/* ── North-up map (tablet and desktop) ─────────────────────────────── */

const H_VIEW_W = 1000;
const H_VIEW_H = 470;
const H_PAD = 30;
const H_SCALE = Math.min(
  (H_VIEW_W - H_PAD * 2) / SPAN_X,
  (H_VIEW_H - H_PAD * 2) / SPAN_Y,
);
const H_OFFSET_X = (H_VIEW_W - SPAN_X * H_SCALE) / 2;
const H_OFFSET_Y = (H_VIEW_H - SPAN_Y * H_SCALE) / 2;

function horizontalProject(lon: number, lat: number): Point {
  return {
    x: H_OFFSET_X + (lon - LON_MIN) * LON_SCALE * H_SCALE,
    y: H_OFFSET_Y + (LAT_MAX - lat) * H_SCALE,
  };
}

const H_PATHS = buildPaths(horizontalProject);
const H_SCALE_BAR = horizontalProject(-102.85, 40.22);
const H_STATE_LABEL = horizontalProject(-99.05, 42.6);
const H_PLATT_LABEL = horizontalProject(-97.85, 41.17);

export const HORIZONTAL_MAP: CorridorMapModel = {
  orientation: "horizontal",
  viewW: H_VIEW_W,
  viewH: H_VIEW_H,
  project: horizontalProject,
  ...H_PATHS,
  neighbors: [
    { text: "WYOMING", ...horizontalProject(-104.2, 41.75), rotate: -90 },
    { text: "SOUTH DAKOTA", ...horizontalProject(-98.6, 43.12) },
    { text: "IOWA", ...horizontalProject(-95.16, 41.45) },
    { text: "COLORADO", ...horizontalProject(-103.1, 39.9) },
    { text: "KANSAS", ...horizontalProject(-99.6, 39.9) },
  ],
  stateLabel: { ...H_STATE_LABEL },
  plattLabel: { ...H_PLATT_LABEL },
  north: { x: 112, y: 104, direction: "up", labelX: 112, labelY: 72 },
  scale: {
    x: H_SCALE_BAR.x,
    y: H_SCALE_BAR.y,
    width: (50 / 69.17) * H_SCALE,
    miles: 50,
  },
  shield: { x: 202, y: 305 },
};

/* ── Rotated map (phones) ──────────────────────────────────────────── */

const V_VIEW_W = 470;
const V_VIEW_H = 962;
const V_PAD = 24;
const V_SCALE = (V_VIEW_W - V_PAD * 2) / SPAN_Y;

function verticalProject(lon: number, lat: number): Point {
  return {
    x: V_PAD + (lat - LAT_MIN) * V_SCALE,
    y: V_PAD + (lon - LON_MIN) * LON_SCALE * V_SCALE,
  };
}

const V_PATHS = buildPaths(verticalProject);

// On the rotated map north is to the right, west is up and east is down.
export const VERTICAL_MAP: CorridorMapModel = {
  orientation: "vertical",
  viewW: V_VIEW_W,
  viewH: V_VIEW_H,
  project: verticalProject,
  ...V_PATHS,
  neighbors: [
    { text: "WYOMING", x: V_VIEW_W / 2, y: 14 },
    { text: "IOWA", x: V_VIEW_W / 2, y: V_VIEW_H - 8 },
    { text: "SOUTH DAKOTA", x: V_VIEW_W - 8, y: V_VIEW_H / 2, rotate: 90 },
    { text: "COLORADO", x: 10, y: 210, rotate: -90 },
    { text: "KANSAS", x: 10, y: 700, rotate: -90 },
  ],
  stateLabel: { x: 414, y: 485, rotate: 90 },
  plattLabel: null,
  north: { x: 34, y: 42, direction: "right", labelX: 62, labelY: 46 },
  scale: {
    x: 34,
    y: 922,
    width: (50 / 69.17) * V_SCALE,
    miles: 50,
  },
  shield: null,
};
