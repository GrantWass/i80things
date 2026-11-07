import assert from "node:assert/strict";
import test from "node:test";
import {
  firstMile,
  mileRange,
  nearestHub,
  positionOf,
} from "./corridor-position";

test("mileRange parses an en-dash range", () => {
  assert.deepEqual(mileRange("20–29"), { min: 20, max: 29 });
  assert.deepEqual(mileRange("439–454"), { min: 439, max: 454 });
});

test("mileRange accepts a hyphen or a single mile", () => {
  assert.deepEqual(mileRange("20-29"), { min: 20, max: 29 });
  assert.deepEqual(mileRange("22"), { min: 22, max: 22 });
});

test("mileRange returns null for null, empty or mile-free input", () => {
  assert.equal(mileRange(null), null);
  assert.equal(mileRange(undefined), null);
  assert.equal(mileRange(""), null);
  assert.equal(mileRange("   "), null);
  assert.equal(mileRange("no miles here"), null);
});

test("mileRange reads the Hastings spur label as a point at Exit 312", () => {
  assert.deepEqual(mileRange("Spur via Exit 312"), { min: 312, max: 312 });
});

test("mileRange prefers an Exit mention over a route number", () => {
  assert.deepEqual(mileRange("Exit 312 / US-281"), { min: 312, max: 312 });
});

test("firstMile orders Kimball before Omaha", () => {
  assert.equal(firstMile("20–29"), 20);
  assert.equal(firstMile("439–454"), 439);
  assert.ok(firstMile("20–29") < firstMile("439–454"));
});

test("firstMile falls back to 0 for unknown input", () => {
  assert.equal(firstMile(null), 0);
  assert.equal(firstMile(""), 0);
  assert.equal(firstMile("no miles here"), 0);
});

test("positionOf returns the range, label and corridor fraction", () => {
  const kimball = positionOf("kimball");
  assert.deepEqual(kimball?.range, { min: 20, max: 29 });
  assert.equal(kimball?.label, "MM 20–29");
  assert.equal(kimball?.percent, ((20 + 29) / 2 / 454) * 100);

  const hastings = positionOf("hastings");
  assert.deepEqual(hastings?.range, { min: 312, max: 312 });
  assert.equal(hastings?.label, "Exit 312");

  assert.equal(positionOf("no-such-hub"), null);
});

test("nearestHub finds the hub whose range contains the mile", () => {
  assert.equal(nearestHub(24)?.slug, "kimball");
  assert.equal(nearestHub(200)?.slug, "north-platte");
  assert.equal(nearestHub(454)?.slug, "omaha");
});

test("nearestHub prefers the on-interstate hub on an exact tie", () => {
  // Mile 312 is both Hastings' spur point and inside Grand Island's range.
  assert.equal(nearestHub(312)?.slug, "grand-island");
});

test("nearestHub returns null beyond the 25-mile window", () => {
  assert.equal(nearestHub(100), null);
  assert.equal(nearestHub(200, 5), null);
});
