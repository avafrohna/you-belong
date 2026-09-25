import test from "node:test";
import assert from "node:assert/strict";
import {
  eventDays,
  eventTime,
  filterEvents,
  monthDays,
  occursInMonth,
  occursOn,
  publicEvents,
  sanDiegoDay,
  shiftMonth,
  upcomingEvents,
  validateEventData,
} from "../src/lib/events.js";
import { getExampleEvents } from "../src/data/example-events.js";
import { eventSections } from "../src/data/event-sections.js";
const orgs = [
  {
    id: "one",
    name: "One",
    description: "A community group",
    website: "https://example.org",
    sectionIds: ["rights-action"],
  },
  {
    id: "two",
    name: "Two",
    description: "Another group",
    website: "https://example.org",
    sectionIds: ["global-impact"],
  },
];
const base = {
  id: "gathering",
  title: "Gathering",
  description: "A conversation",
  location: "San Diego",
  cost: "Free",
  allDay: false,
  start: "2026-09-24T10:00:00-07:00",
  end: "2026-09-24T12:00:00-07:00",
  status: "published",
  organizationIds: ["one"],
  sectionIds: ["rights-action"],
  sourceUrl: "https://example.org/event",
  sourceType: "manual",
  verifiedAt: "2026-09-21",
};
test("month grids cover leap February and year rollover", () => {
  assert.equal(shiftMonth("2026-12", 1), "2027-01");
  assert.equal(shiftMonth("2026-01", -1), "2025-12");
  assert.equal(monthDays("2028-02").length, 42);
  assert.ok(monthDays("2028-02").includes("2028-02-29"));
  assert.equal(new Date(monthDays("2028-02")[0] + "T12:00:00Z").getUTCDay(), 0);
});
test("San Diego date is independent of the reader timezone", () => {
  assert.equal(sanDiegoDay("2026-09-22T02:00:00Z"), "2026-09-21");
  assert.equal(sanDiegoDay("2026-12-02T07:30:00Z"), "2026-12-01");
});
test("all-day range excludes its end and spans month boundaries", () => {
  const event = {
    ...base,
    allDay: true,
    start: "2026-09-30",
    end: "2026-10-02",
  };
  assert.ok(occursInMonth(event, "2026-09"));
  assert.ok(occursInMonth(event, "2026-10"));
  assert.ok(occursOn(event, "2026-10-01"));
  assert.ok(!occursOn(event, "2026-10-02"));
});
test("midnight end does not add a phantom day; overnight events span days", () => {
  assert.deepEqual(
    eventDays({
      ...base,
      start: "2026-09-24T22:00:00-07:00",
      end: "2026-09-25T00:00:00-07:00",
    }),
    { first: "2026-09-24", last: "2026-09-24" },
  );
  assert.ok(
    occursOn({ ...base, end: "2026-09-25T01:00:00-07:00" }, "2026-09-25"),
  );
});
test("sections are OR, organizations are OR, and the groups are AND", () => {
  const second = {
    ...base,
    id: "two",
    sectionIds: ["global-impact"],
    organizationIds: ["two"],
  };
  const both = {
    ...base,
    id: "both",
    sectionIds: ["global-impact", "rights-action"],
    organizationIds: ["one", "two"],
  };
  assert.equal(
    filterEvents([base, second, both], {
      sectionIds: ["rights-action", "global-impact"],
    }).length,
    3,
  );
  assert.deepEqual(
    filterEvents([base, second, both], {
      sectionIds: ["global-impact"],
      organizationIds: ["one"],
    }).map((event) => event.id),
    ["both"],
  );
  assert.equal(
    filterEvents([base, second], { organizationIds: ["one", "two"] }).length,
    2,
  );
  assert.equal(filterEvents([base], { query: "  ONE " }, orgs).length, 1);
  assert.equal(filterEvents([base], { query: "missing" }, orgs).length, 0);
});
test("drafts stay private; cancellation remains visible; finished events are not upcoming", () => {
  assert.equal(
    publicEvents([
      base,
      { ...base, id: "draft", status: "draft" },
      { ...base, id: "cancelled", status: "cancelled" },
    ]).length,
    2,
  );
  assert.equal(upcomingEvents([base], "one", "2026-09-24T20:00:00Z").length, 0);
  assert.equal(upcomingEvents([base], "one", "2026-09-24T18:00:00Z").length, 1);
  assert.equal(upcomingEvents([base], "two", "2026-09-24T18:00:00Z").length, 0);
});
test("validation rejects broken references, unsafe URLs, dates and fictional publication", () => {
  assert.doesNotThrow(() => validateEventData([base], orgs, eventSections));
  for (const change of [
    { organizationIds: ["missing"] },
    { sectionIds: ["missing"] },
    { sourceUrl: "javascript:alert(1)" },
    { start: "2026-02-30T12:00:00-08:00" },
    { end: base.start },
    { start: "2026-09-24T10:00:00" },
    { verifiedAt: "2026-02-30" },
  ]) {
    assert.throws(() =>
      validateEventData([{ ...base, ...change }], orgs, eventSections),
    );
  }
  assert.throws(() => validateEventData([base, base], orgs, eventSections));
  assert.throws(() =>
    validateEventData(
      [base],
      orgs.map((org) => ({ ...org, isExample: true })),
      eventSections,
    ),
  );
});
test("preview events stay in three months, and their daytime times respect Pacific DST", () => {
  const examples = getExampleEvents("2026-09-21");
  assert.equal(examples.length, 9);
  assert.ok(examples.every((event) => event.isExample));
  assert.equal(
    examples.find((event) => event.id === "example-neighborhood-coffee").start,
    "2026-09-24T10:00:00-07:00",
  );
  assert.equal(
    examples.find((event) => event.id === "example-fresh-start").start,
    "2026-11-07T10:00:00-08:00",
  );
  assert.ok(
    getExampleEvents("2026-12-21").some((event) =>
      event.start.startsWith("2027-02"),
    ),
  );
});

test("fall-back repeated-hour events sort by their actual instant", () => {
  const earlier = {
    ...base,
    id: "earlier",
    start: "2026-11-01T01:45:00-07:00",
    end: "2026-11-01T01:50:00-07:00",
  };
  const later = {
    ...base,
    id: "later",
    start: "2026-11-01T01:15:00-08:00",
    end: "2026-11-01T01:30:00-08:00",
  };
  assert.deepEqual(
    publicEvents([later, earlier]).map((event) => event.id),
    ["earlier", "later"],
  );
});

test("missing IDs and the preview namespace cannot enter real event records", () => {
  assert.throws(() =>
    validateEventData([{ ...base, id: undefined }], orgs, eventSections),
  );
  assert.throws(() =>
    validateEventData([{ ...base, id: "example-test" }], orgs, eventSections),
  );
});


test("start-only events keep their confirmed date without inventing a duration", () => {
  const event = { ...base };
  delete event.end;
  assert.doesNotThrow(() => validateEventData([event], orgs, eventSections));
  assert.deepEqual(eventDays(event), { first: "2026-09-24", last: "2026-09-24" });
  assert.equal(eventTime(event), "10:00 AM PT · End time not listed");
  assert.ok(occursOn(event, "2026-09-24"));
  assert.ok(!occursOn(event, "2026-09-25"));
  assert.equal(upcomingEvents([event], "one", "2026-09-25T06:59:00Z").length, 1);
  assert.equal(upcomingEvents([event], "one", "2026-09-25T07:00:00Z").length, 0);
  for (const end of [null, "", "invalid", event.start]) {
    assert.throws(() => validateEventData([{ ...event, end }], orgs, eventSections));
  }
  assert.throws(() => validateEventData([{ ...event, allDay: true, start: "2026-09-24" }], orgs, eventSections));
});
