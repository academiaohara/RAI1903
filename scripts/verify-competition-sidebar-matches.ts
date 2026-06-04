import assert from "node:assert/strict";
import { getCompetitionSidebarMatches } from "@/lib/competition-match-sections";
import type { CalendarMatch, CompetitionId } from "@/types";

function calendarMatch(
  id: string,
  date: string,
  competition: CompetitionId,
  scores?: { homeScore: number; awayScore: number },
): CalendarMatch {
  return {
    id,
    date,
    opponent: "Rival",
    opponentLogo: "",
    homeTeam: "Real Aviles Industrial",
    awayTeam: "Rival",
    homeTeamId: "real-aviles-industrial",
    awayTeamId: "rival",
    venue: "Roman Suarez Puerta",
    competition,
    matchday: 1,
    isHome: true,
    time: null,
    played: scores !== undefined,
    result: scores ? `${scores.homeScore}-${scores.awayScore}` : null,
    homeScore: scores?.homeScore,
    awayScore: scores?.awayScore,
    chronicleUrl: null,
    previaUrl: null,
  };
}

const now = new Date("2026-10-15T12:00:00.000Z");

const masculino = getCompetitionSidebarMatches(
  [
    calendarMatch("past-older", "2026-09-01T18:00:00.000Z", "primera-rfef", { homeScore: 1, awayScore: 0 }),
    calendarMatch("past-newer", "2026-10-01T18:00:00.000Z", "primera-rfef", { homeScore: 2, awayScore: 1 }),
    calendarMatch("future-sooner", "2026-10-20T18:00:00.000Z", "primera-rfef"),
    calendarMatch("future-later", "2026-11-03T18:00:00.000Z", "primera-rfef"),
    calendarMatch("cup-past", "2026-10-02T18:00:00.000Z", "copa-rey", { homeScore: 1, awayScore: 1 }),
    calendarMatch("friendly-future", "2026-10-21T18:00:00.000Z", "amistoso"),
    calendarMatch("legacy-league", "2026-10-10T18:00:00.000Z", "liga-raij903", { homeScore: 3, awayScore: 0 }),
  ],
  "masculino",
  now,
);

assert.deepEqual(
  masculino.latest.map((match) => match.id),
  ["legacy-league", "past-newer", "past-older"],
);
assert.deepEqual(
  masculino.upcoming.map((match) => match.id),
  ["future-sooner", "future-later"],
);

const femenino = getCompetitionSidebarMatches(
  [
    calendarMatch("fem-past", "2026-10-01T18:00:00.000Z", "liga-femenina", { homeScore: 2, awayScore: 0 }),
    calendarMatch("fem-future", "2026-10-20T18:00:00.000Z", "liga-femenina"),
    calendarMatch("male-league", "2026-10-10T18:00:00.000Z", "primera-rfef", { homeScore: 1, awayScore: 1 }),
  ],
  "femenino",
  now,
);

assert.deepEqual(
  femenino.latest.map((match) => match.id),
  ["fem-past"],
);
assert.deepEqual(
  femenino.upcoming.map((match) => match.id),
  ["fem-future"],
);

console.log("competition sidebar match sections verified");
