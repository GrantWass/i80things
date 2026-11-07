import assert from "node:assert/strict";
import test from "node:test";
import restAreaData from "../data/rest-areas.json";
import parkingData from "../data/truck-parking.json";
import { inventoryTotals, listSites, siteByAlias } from "./inventory";

test("inventory holds one record per physical site", () => {
  assert.equal(listSites().length, 22);
  assert.equal(inventoryTotals().sites, 22);
});

test("totals reproduce the pages' previous inline sums", () => {
  const restSum = (restAreaData.areas as { truckSpaces: number | null }[]).reduce(
    (sum, area) => sum + (area.truckSpaces ?? 0),
    0,
  );
  const openTruckRows = (
    parkingData.sites as {
      status: string;
      truckSpaces: number | null;
    }[]
  ).filter((row) => row.status === "open");

  assert.equal(restSum, 260);
  assert.equal(inventoryTotals().openTruckSpaces, 260);
  assert.equal(
    inventoryTotals().countedOpenSites,
    openTruckRows.filter((row) => row.truckSpaces != null).length,
  );
  assert.equal(inventoryTotals().countedOpenSites, 20);
});

test("every id from both datasets resolves to a site", () => {
  const restIds = (restAreaData.areas as { id: string }[]).map((a) => a.id);
  const truckIds = (parkingData.sites as { id: string }[]).map((s) => s.id);
  assert.equal(restIds.length, 21);
  assert.equal(truckIds.length, 22);
  for (const id of [...restIds, ...truckIds]) {
    assert.ok(siteByAlias(id), `expected ${id} to resolve`);
  }
  assert.equal(siteByAlias("no-such-site"), undefined);
});

test("the Sidney eastbound pair is one record with both aliases", () => {
  const fromRest = siteByAlias("sidney-eb");
  const fromTruck = siteByAlias("sidney-eastbound");
  assert.ok(fromRest);
  assert.equal(fromRest, fromTruck);
  assert.equal(fromRest.id, "sidney-eb");
  assert.deepEqual(fromRest.aliases, ["sidney-eb", "sidney-eastbound"]);
  assert.equal(fromRest.kind, "rest-area");
  assert.equal(fromRest.truckSpaces, 28);
  assert.equal(fromRest.status, "open");
});

test("the Exit 101 truck lot merges despite the guide's missing milepost", () => {
  const fromRest = siteByAlias("interchange-101-truck");
  const fromTruck = siteByAlias("deuel-interchange-101");
  assert.ok(fromRest);
  assert.equal(fromRest, fromTruck);
  assert.equal(fromRest.id, "interchange-101-truck");
  assert.equal(fromRest.kind, "truck-lot");
  assert.equal(fromRest.truckSpaces, 60);
  assert.equal(fromRest.status, "open");
});

test("the planned Dawson County site stands alone", () => {
  const planned = siteByAlias("dawson-county-planned");
  assert.ok(planned);
  assert.equal(planned.status, "planned");
  assert.equal(planned.kind, "truck-lot");
  assert.equal(planned.mile, null);
  assert.equal(planned.truckSpaces, 120);
  assert.deepEqual(planned.aliases, ["dawson-county-planned"]);
});

test("canonical ids come from the rest-area dataset", () => {
  const restIds = new Set(
    (restAreaData.areas as { id: string }[]).map((a) => a.id),
  );
  for (const site of listSites()) {
    const restAlias = site.aliases.find((alias) => restIds.has(alias));
    if (restAlias) assert.equal(site.id, restAlias);
  }
});
