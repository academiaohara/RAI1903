import assert from "node:assert/strict";
import {
  isMatchDateAfterToday,
  isMatchDateBeforeToday,
  latestMatchesBeforeToday,
  upcomingMatchesAfterToday,
} from "../lib/match-calendar-dates";

const today = new Date("2026-06-03T12:00:00.000Z");
const matches = [
  { id: "past", date: "2026-06-02T16:00:00.000Z" },
  { id: "today", date: "2026-06-03T18:00:00.000Z" },
  { id: "future", date: "2026-06-10T16:00:00.000Z" },
];

assert.equal(isMatchDateBeforeToday("2026-06-02T16:00:00.000Z", today), true);
assert.equal(isMatchDateBeforeToday("2026-06-03T18:00:00.000Z", today), false);
assert.equal(isMatchDateAfterToday("2026-06-10T16:00:00.000Z", today), true);
assert.equal(isMatchDateAfterToday("2026-06-03T08:00:00.000Z", today), false);

const past = latestMatchesBeforeToday(matches, 5, today);
assert.deepEqual(
  past.map((m) => m.id),
  ["past"],
);

const future = upcomingMatchesAfterToday(matches, 5, today);
assert.deepEqual(
  future.map((m) => m.id),
  ["future"],
);

console.log("verify-match-calendar-dates: ok");
