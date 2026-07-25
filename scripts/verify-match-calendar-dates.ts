import assert from "node:assert/strict";
import {
  isMatchDateAfterToday,
  isMatchDateBeforeToday,
  isMatchDateToday,
  latestMatchesBeforeToday,
  upcomingMatchesAfterToday,
} from "../lib/match-calendar-dates";

const today = new Date("2026-07-25T12:00:00.000Z");
const matches = [
  { id: "past", date: "2026-07-24T16:00:00.000Z", status: "finished" as const, homeScore: 1, awayScore: 0 },
  {
    id: "today-scheduled",
    date: "2026-07-25T09:00:00.000Z",
    status: "scheduled" as const,
  },
  {
    id: "today-finished",
    date: "2026-07-25T11:00:00.000Z",
    status: "finished" as const,
    homeScore: 2,
    awayScore: 1,
  },
  { id: "future", date: "2026-08-10T16:00:00.000Z", status: "scheduled" as const },
];

assert.equal(isMatchDateBeforeToday("2026-07-24T16:00:00.000Z", today), true);
assert.equal(isMatchDateToday("2026-07-25T09:00:00.000Z", today), true);
assert.equal(isMatchDateBeforeToday("2026-07-25T09:00:00.000Z", today), false);
assert.equal(isMatchDateAfterToday("2026-08-10T16:00:00.000Z", today), true);
assert.equal(isMatchDateAfterToday("2026-07-25T09:00:00.000Z", today), false);

const past = latestMatchesBeforeToday(matches, 5, today);
assert.deepEqual(
  past.map((m) => m.id),
  ["today-finished", "past"],
);

const future = upcomingMatchesAfterToday(matches, 5, today);
assert.deepEqual(
  future.map((m) => m.id),
  ["today-scheduled", "future"],
);

console.log("verify-match-calendar-dates: ok");
