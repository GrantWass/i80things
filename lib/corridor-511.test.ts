import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  classifyEvent,
  fetchCorridorEvents,
  sortEvents,
} from "./corridor-511.mjs";

function rawEvent(overrides = {}) {
  return {
    __typename: "Event",
    uri: "event-1",
    title: "I-80 event",
    description: "Something happened.",
    priority: null,
    agencyAttribution: null,
    lastUpdated: { timestamp: "2026-11-06T12:00:00.000Z" },
    beginTime: { timestamp: "2026-11-06T11:00:00.000Z" },
    location: null,
    ...overrides,
  };
}

function stubFetch(collections: unknown[]) {
  return async () => ({
    ok: true as const,
    status: 200,
    json: async () => ({
      data: { dashboardQuery: { collections } },
    }),
  });
}

describe("classifyEvent", () => {
  it("classifies closures", () => {
    assert.equal(
      classifyEvent({ title: "I-80: Road Closed at MM 100", description: "" }),
      "closure",
    );
    assert.equal(
      classifyEvent({ title: "I-80 closed to traffic", description: "" }),
      "closure",
    );
  });

  it("classifies incidents", () => {
    assert.equal(
      classifyEvent({ title: "I-80: Crash near Kearney", description: "" }),
      "incident",
    );
    assert.equal(
      classifyEvent({ title: "Disabled vehicle on shoulder", description: "" }),
      "incident",
    );
  });

  it("classifies construction", () => {
    assert.equal(
      classifyEvent({ title: "I-80: Construction zone", description: "Bridge work" }),
      "construction",
    );
    assert.equal(
      classifyEvent({ title: "Maintenance", description: "Road work ahead" }),
      "construction",
    );
  });

  it("classifies winter conditions", () => {
    assert.equal(
      classifyEvent({ title: "I-80: Snow packed", description: "Ice expected" }),
      "conditions",
    );
  });

  it("falls back to other", () => {
    assert.equal(
      classifyEvent({ title: "I-80 rest area open", description: "Fuel nearby" }),
      "other",
    );
  });
});

describe("I-80 title filter", () => {
  it("matches I-80 spellings and rejects other routes", async () => {
    const collections = [
      rawEvent({ uri: "a", title: "I-80: Crash at MM 312" }),
      rawEvent({ uri: "b", title: "I 80 westbound delays" }),
      rawEvent({ uri: "c", title: "I-80 in Nebraska: snow" }),
      rawEvent({ uri: "d", title: "I-680: Crash in Omaha" }),
      rawEvent({ uri: "e", title: "US-30 closure" }),
    ];
    const { events } = await fetchCorridorEvents({
      fetchImpl: stubFetch(collections),
    });
    assert.deepEqual(
      events.map((e) => e.id).sort(),
      ["a", "b", "c"],
    );
  });
});

describe("generally clear drop", () => {
  it("drops the statewide clear banner but keeps real conditions", async () => {
    const collections = [
      rawEvent({
        uri: "banner",
        title: "I-80 seasonal roadway report",
        description: "Winter: roads generally clear across the state",
      }),
      rawEvent({
        uri: "real",
        title: "I-80 snow-packed",
        description: "Snow and ice near North Platte",
      }),
    ];
    const { events, totalStatewideEvents } = await fetchCorridorEvents({
      fetchImpl: stubFetch(collections),
    });
    assert.equal(totalStatewideEvents, 2);
    assert.deepEqual(events.map((e) => e.id), ["real"]);
  });
});

describe("sortEvents", () => {
  it("orders closure first, then category rank, then newest first", () => {
    const ordered = sortEvents([
      {
        id: "old-incident",
        title: "I-80 crash",
        category: "incident",
        description: "",
        priority: null,
        agency: null,
        agencyUrl: null,
        lastUpdated: "2026-11-05T12:00:00.000Z",
        beginTime: null,
        url: "",
        location: null,
      },
      {
        id: "new-incident",
        title: "I-80 crash",
        category: "incident",
        description: "",
        priority: null,
        agency: null,
        agencyUrl: null,
        lastUpdated: "2026-11-06T12:00:00.000Z",
        beginTime: null,
        url: "",
        location: null,
      },
      {
        id: "closure",
        title: "I-80 closed",
        category: "closure",
        description: "",
        priority: null,
        agency: null,
        agencyUrl: null,
        lastUpdated: "2026-11-01T12:00:00.000Z",
        beginTime: null,
        url: "",
        location: null,
      },
      {
        id: "construction",
        title: "I-80 work",
        category: "construction",
        description: "",
        priority: null,
        agency: null,
        agencyUrl: null,
        lastUpdated: "2026-11-06T12:00:00.000Z",
        beginTime: null,
        url: "",
        location: null,
      },
    ]);
    assert.deepEqual(
      ordered.map((e) => e.id),
      ["closure", "new-incident", "old-incident", "construction"],
    );
  });
});

describe("max cap", () => {
  it("caps the returned events", async () => {
    const collections = Array.from({ length: 5 }, (_, i) =>
      rawEvent({ uri: `e${i}`, title: `I-80 event ${i}` }),
    );
    const { events, totalStatewideEvents } = await fetchCorridorEvents({
      max: 2,
      fetchImpl: stubFetch(collections),
    });
    assert.equal(totalStatewideEvents, 5);
    assert.equal(events.length, 2);
  });
});
