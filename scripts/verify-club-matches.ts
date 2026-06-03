import assert from "node:assert/strict";
import { collectClubMatches, isClubTeamMatch, resolveClubTeamIds } from "../lib/season/club-team-ids";
import type { Matchday } from "../types";

const bundles = {};
const matchdays: Matchday[] = [
  {
    round: 1,
    matches: [
      {
        id: "j1-rai-logrones",
        competition: "primera-rfef",
        matchday: 1,
        date: "2026-06-02T16:00:00.000Z",
        status: "finished",
        homeTeamId: "grupo-1-slot-9",
        awayTeamId: "ud-logrones",
        homeTeam: "Real Avilés Industrial",
        awayTeam: "UD Logroñés",
        venue: "Roman Suarez Puerta",
        homeScore: 2,
        awayScore: 0,
      },
    ],
  },
];

const ids = resolveClubTeamIds(bundles, "masculino", "1", matchdays);
assert.ok(ids.includes("grupo-1-slot-9"), `expected slot id in ${ids.join(",")}`);

const match = matchdays[0]!.matches[0]!;
assert.equal(isClubTeamMatch(match, ["real-aviles-industrial"]), true, "name fallback");

const collected = collectClubMatches(matchdays, {
  matchdays,
  matchdaysGrupo2: [],
  matchdaysFemenino: [],
  amistosoMatches: [],
  copaDelReyMatches: [],
  calendarExtraMatches: [],
  lastRoundMasculino: 1,
  lastRoundFemenino: 1,
  definitiveQualifyingLeagueRound: 1,
}, "masculino", ids);

assert.equal(collected.length, 1);
assert.equal(collected[0]?.homeScore, 2);

console.log("verify-club-matches: ok");
