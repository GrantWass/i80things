import restAreaData from "@/data/rest-areas.json";
import parkingData from "@/data/truck-parking.json";

export type InventoryDirection = "eastbound" | "westbound" | "both";

export type InventorySite = {
  id: string;
  sourceId: string;
  kind: "rest-area" | "truck-lot";
  name: string;
  mile: number | null;
  mileApproximate: boolean;
  direction: InventoryDirection;
  nearestExit: number | null;
  townSlug: string | null;
  truckSpaces: number | null;
  carSpaces: number | null;
  status: "open" | "planned";
  aliases: string[];
  /** True when the site has a row in the NDOT rest-area guide. */
  inRestGuide: boolean;
  /** True when the site has a row in the truck-parking dataset. */
  inTruckGuide: boolean;
};

type RestAreaRow = {
  id: string;
  name: string;
  milepost: number | null;
  direction: InventoryDirection;
  nearestExit: number;
  citySlug: string | null;
  truckOnly: boolean;
  truckSpaces: number | null;
  carSpaces: number | null;
};

type TruckSiteRow = {
  id: string;
  name: string;
  mile: number | null;
  mileApproximate: boolean;
  direction: InventoryDirection;
  nearestExit: number | null;
  nearestTown: string;
  truckSpaces: number | null;
  carSpaces: number | null;
  status: "open" | "planned";
};

const restAreas = restAreaData.areas as RestAreaRow[];
const truckSites = parkingData.sites as TruckSiteRow[];

/**
 * The site name minus dataset-specific qualifiers: direction words, county
 * prefixes ("Deuel County" locates the lot but is not part of its name),
 * and dataset labels ("Rest Area", "Truck Parking", "Truck Lot").
 */
function baseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b[a-z]+ county\b/g, "")
    .replace(/\b(eastbound|westbound)\b/g, "")
    .replace(/\brest areas?\b/g, "")
    .replace(/\btruck (parking|lot|only)\b/g, "")
    .replace(/\btruck\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * One rest-area row and one truck-parking row describe the same physical
 * site when their base names and directions agree and their miles agree
 * within 1.0. The guide gives Interchange 101 no milepost, so a null mile
 * falls back to exit equality (Exit 101 on both rows).
 */
function isSameSite(rest: RestAreaRow, truck: TruckSiteRow): boolean {
  if (baseName(rest.name) !== baseName(truck.name)) return false;
  if (rest.direction !== truck.direction) return false;
  if (rest.milepost != null && truck.mile != null) {
    return Math.abs(rest.milepost - truck.mile) <= 1.0;
  }
  return rest.nearestExit === truck.nearestExit;
}

function mergedSite(rest: RestAreaRow, truck: TruckSiteRow): InventorySite {
  return {
    id: rest.id,
    sourceId: rest.id,
    kind: rest.truckOnly ? "truck-lot" : "rest-area",
    name: rest.name,
    mile: rest.milepost ?? truck.mile,
    mileApproximate: truck.mileApproximate,
    direction: rest.direction,
    nearestExit: rest.nearestExit,
    townSlug: rest.citySlug,
    truckSpaces: rest.truckSpaces,
    carSpaces: rest.carSpaces,
    status: truck.status,
    aliases: rest.id === truck.id ? [rest.id] : [rest.id, truck.id],
    inRestGuide: true,
    inTruckGuide: true,
  };
}

function restOnlySite(rest: RestAreaRow): InventorySite {
  return {
    id: rest.id,
    sourceId: rest.id,
    kind: rest.truckOnly ? "truck-lot" : "rest-area",
    name: rest.name,
    mile: rest.milepost,
    mileApproximate: false,
    direction: rest.direction,
    nearestExit: rest.nearestExit,
    townSlug: rest.citySlug,
    truckSpaces: rest.truckSpaces,
    carSpaces: rest.carSpaces,
    status: "open",
    aliases: [rest.id],
    inRestGuide: true,
    inTruckGuide: false,
  };
}

function truckOnlySite(truck: TruckSiteRow): InventorySite {
  return {
    id: truck.id,
    sourceId: truck.id,
    kind: "truck-lot",
    name: truck.name,
    mile: truck.mile,
    mileApproximate: truck.mileApproximate,
    direction: truck.direction,
    nearestExit: truck.nearestExit,
    townSlug: truck.nearestTown,
    truckSpaces: truck.truckSpaces,
    carSpaces: truck.carSpaces,
    status: truck.status,
    aliases: [truck.id],
    inRestGuide: false,
    inTruckGuide: true,
  };
}

function buildSites(): InventorySite[] {
  const matchedTruckIds = new Set<string>();
  const sites: InventorySite[] = restAreas.map((rest) => {
    const truck = truckSites.find(
      (candidate) =>
        !matchedTruckIds.has(candidate.id) && isSameSite(rest, candidate),
    );
    if (!truck) return restOnlySite(rest);
    matchedTruckIds.add(truck.id);
    return mergedSite(rest, truck);
  });
  for (const truck of truckSites) {
    if (!matchedTruckIds.has(truck.id)) sites.push(truckOnlySite(truck));
  }
  return sites;
}

const sites: InventorySite[] = buildSites();

const sitesByAlias: Map<string, InventorySite> = new Map(
  sites.flatMap((site) => site.aliases.map((alias) => [alias, site] as const)),
);

/** Every physical site, one record per site, in rest-area guide order. */
export function listSites(): InventorySite[] {
  return sites;
}

/** Find a site by any id either dataset addresses it by today. */
export function siteByAlias(id: string): InventorySite | undefined {
  return sitesByAlias.get(id);
}

/**
 * Corridor totals both data pages render: open truck-space capacity and
 * the count of open sites with a posted count. Matches the pages'
 * previous inline sums (260 spaces, 20 counted sites).
 */
export function inventoryTotals({ guide }: { guide?: "rest" | "truck" } = {}): {
  sites: number;
  openTruckSpaces: number;
  countedOpenSites: number;
} {
  const open = sites.filter(
    (site) =>
      site.status === "open" &&
      (guide === undefined ||
        (guide === "rest" ? site.inRestGuide : site.inTruckGuide)),
  );
  return {
    sites: sites.length,
    openTruckSpaces: open.reduce(
      (sum, site) => sum + (site.truckSpaces ?? 0),
      0,
    ),
    countedOpenSites: open.filter((site) => site.truckSpaces != null).length,
  };
}
