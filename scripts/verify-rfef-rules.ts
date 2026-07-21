/**
 * Manual verification of RFEF rules (no test framework).
 * Run: npm run verify:rfef-rules
 */

import { matchdays, teams } from "@/data/mock";
import { PRIMERA_RFEF_RULES, PRIMERA_RFEF_STANDINGS_ZONES } from "@/lib/rfef-rules/config";
import { computeStandings, getTeamsAtRound, qualifyingRoundAfterJornada } from "@/lib/standings";
import { resolveKnockoutTwoLeg } from "@/lib/rfef-rules/knockout";
import { headToHeadGoalDifference } from "@/lib/rfef-rules/mini-league";
import { selectPlayoffQualifiers } from "@/lib/rfef-rules/playoff";
import { sortTiedTeams } from "@/lib/rfef-rules/tiebreak";
import type { TeamStandingsAccumulator } from "@/lib/standings";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`FAIL: ${message}`);
}

function acc(teamId: string, points: number, gf = 0, gc = 0): TeamStandingsAccumulator {
  return {
    teamId,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: gf,
    goalsAgainst: gc,
    points,
    recentResults: [],
  };
}

function match(home: string, away: string, hs: number, as: number) {
  return { homeTeamId: home, awayTeamId: away, homeScore: hs, awayScore: as, date: "2026-01-01" };
}

{
  const matches = [match("a", "b", 2, 0), match("b", "a", 1, 1)];
  assert(headToHeadGoalDifference("a", "b", matches) === 2, "H2H: A +2 over B");
  const accumulators = new Map([
    ["a", acc("a", 10, 30, 20)],
    ["b", acc("b", 10, 25, 25)],
  ]);
  const result = sortTiedTeams(["a", "b"], accumulators, matches, PRIMERA_RFEF_RULES.tiebreak);
  assert(result.orderedTeamIds[0] === "a", "A ahead on H2H despite worse overall GD");
}

{
  const matches = [
    match("a", "b", 2, 1),
    match("b", "a", 1, 1),
    match("a", "c", 3, 0),
    match("c", "a", 0, 2),
    match("b", "c", 1, 0),
    match("c", "b", 1, 2),
  ];
  const accumulators = new Map([
    ["a", acc("a", 20)],
    ["b", acc("b", 20)],
    ["c", acc("c", 20)],
  ]);
  const result = sortTiedTeams(["a", "b", "c"], accumulators, matches, PRIMERA_RFEF_RULES.tiebreak);
  assert(result.orderedTeamIds[2] === "c", "C last in mini-league (3 pts)");
  assert(
    result.orderedTeamIds[0] === "a" && result.orderedTeamIds[1] === "b",
    "A and B tie-broken between themselves (A better H2H)",
  );
}

{
  const mockTeams = [1, 2, 3, 4, 5, 6].map((position) => ({
    id: position === 2 ? "castilla" : `t${position}`,
    name: `t${position}`,
    shortName: `t${position}`,
    city: "",
    stadium: "",
    coach: "",
    founded: 0,
    crestInitials: "",
    colors: [] as string[],
    position,
    form: [] as ("G" | "E" | "P")[],
    stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
  }));

  const withSubstitution = selectPlayoffQualifiers(
    [{ groupId: "1", teams: mockTeams }],
    { positions: [2, 3, 4, 5] },
    ["castilla"],
  );
  assert(withSubstitution.length === 4, "Four playoff spots");
  assert(!withSubstitution.some((q) => q.teamId === "castilla"), "Castilla excluded when substituted");
  assert(
    withSubstitution.some((q) => q.teamId === "t6" && q.replacedIneligible),
    "t6 takes substituted reserve team's spot",
  );

  const direct = selectPlayoffQualifiers(
    [{ groupId: "1", teams: mockTeams }],
    { positions: [2, 3, 4, 5] },
    [],
  );
  assert(direct.some((q) => q.teamId === "castilla"), "Castilla qualifies when eligible to play");
}

{
  const result = resolveKnockoutTwoLeg(
    {
      homeTeamId: "home",
      awayTeamId: "away",
      homeLeaguePosition: 3,
      awayLeaguePosition: 5,
      firstLeg: { homeTeamId: "away", awayTeamId: "home", homeScore: 1, awayScore: 1 },
      secondLeg: { homeTeamId: "home", awayTeamId: "away", homeScore: 1, awayScore: 1 },
    },
    PRIMERA_RFEF_RULES.playoff.knockout,
  );
  assert("winnerId" in result && result.winnerId === "home", "Better league finisher advances (3rd)");
}

{
  const result = resolveKnockoutTwoLeg(
    {
      homeTeamId: "home",
      awayTeamId: "away",
      homeLeaguePosition: 5,
      awayLeaguePosition: 3,
      firstLeg: { homeTeamId: "home", awayTeamId: "away", homeScore: 0, awayScore: 1 },
      secondLeg: { homeTeamId: "away", awayTeamId: "home", homeScore: 1, awayScore: 0 },
    },
    PRIMERA_RFEF_RULES.playoff.knockout,
  );
  assert("winnerId" in result && result.winnerId === "away", "No away goals: better league finisher advances (3rd)");
}

{
  const teamIds = Array.from({ length: 20 }, (_, i) => `t${i + 1}`);
  const standings = computeStandings(teamIds, [], PRIMERA_RFEF_STANDINGS_ZONES);
  assert(standings[0]?.zone === "promotion", "1st: direct promotion");
  assert(standings[1]?.zone === "playoff" && standings[4]?.zone === "playoff", "2nd–5th: playoff");
  assert(standings[5]?.zone === "mid", "6th: mid-table zone");
  assert(standings[14]?.zone === "mid", "15th: mid-table zone");
  assert(standings[15]?.zone === "relegation" && standings[19]?.zone === "relegation", "bottom 5: relegation");
  assert(
    PRIMERA_RFEF_RULES.zones.promotion === 1 &&
      PRIMERA_RFEF_RULES.zones.playoff === 4 &&
      PRIMERA_RFEF_RULES.zones.relegation === 5,
    "Exported rules match 1ª RFEF zones",
  );
}

{
  const badMatchdays = matchdays.flatMap((md) => md.matches.map((match) => ({ round: 1, matches: [match] })));
  const atJ1 = getTeamsAtRound(teams, badMatchdays, qualifyingRoundAfterJornada(1));
  const played = new Set(atJ1.map((team) => team.stats.played));
  assert(played.size === 1 && played.has(1), "J1 with wrong matchday.round: everyone with 1 GP");
}

{
  const atJ1 = getTeamsAtRound(
    teams,
    matchdays,
    qualifyingRoundAfterJornada(1),
    PRIMERA_RFEF_STANDINGS_ZONES,
    PRIMERA_RFEF_RULES.tiebreak,
  );
  assert(atJ1.length === teams.length, "J1 with RFEF tiebreak: all teams appear");
  assert(
    atJ1.every((team) => team.stats.played === 1),
    "J1 with RFEF tiebreak: each team with 1 GP",
  );
}

console.log("OK: RFEF rules verified");
