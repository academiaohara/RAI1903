import assert from "node:assert/strict";
import {
  formatMatchKickoffDisplay,
  isUnsetKickoff,
  spainLocalDateTimeToUtcIso,
} from "../lib/match-kickoff-time";

const noonIso = spainLocalDateTimeToUtcIso("2026-03-15", "12:00");
const midnightIso = spainLocalDateTimeToUtcIso("2026-03-15", "00:00");
const eveningIso = spainLocalDateTimeToUtcIso("2026-03-15", "18:30");

assert.equal(isUnsetKickoff(noonIso), false, "12:00 Spain is a real kickoff time");
assert.equal(formatMatchKickoffDisplay(noonIso), "12:00");

assert.equal(isUnsetKickoff(midnightIso), true, "00:00 Spain means no kickoff yet");
assert.equal(formatMatchKickoffDisplay(midnightIso), "—");

assert.equal(formatMatchKickoffDisplay(eveningIso), "18:30");

console.log("verify-match-kickoff-display: ok");
