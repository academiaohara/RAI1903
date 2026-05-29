/**
 * Verificación manual de reglas RFEF (sin framework de tests).
 * Ejecutar: npm run verify:rfef-rules
 */

import { PRIMERA_RFEF_RULES, PRIMERA_RFEF_STANDINGS_ZONES } from "@/lib/rfef-rules/config";
import { computeStandings } from "@/lib/standings";
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
  assert(headToHeadGoalDifference("a", "b", matches) === 2, "H2H: A +2 sobre B");
  const accumulators = new Map([
    ["a", acc("a", 10, 30, 20)],
    ["b", acc("b", 10, 25, 25)],
  ]);
  const result = sortTiedTeams(["a", "b"], accumulators, matches, PRIMERA_RFEF_RULES.tiebreak);
  assert(result.orderedTeamIds[0] === "a", "A delante por H2H pese a peor DG general");
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
  assert(result.orderedTeamIds[2] === "c", "C último en mini-liga (3 pts)");
  assert(
    result.orderedTeamIds[0] === "a" && result.orderedTeamIds[1] === "b",
    "A y B se desempatan entre sí (A mejor H2H)",
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

  const qualified = selectPlayoffQualifiers(
    [{ groupId: "1", teams: mockTeams }],
    { positions: [2, 3, 4, 5] },
    ["castilla"],
  );
  assert(qualified.length === 4, "Cuatro plazas de playoff");
  assert(!qualified.some((q) => q.teamId === "castilla"), "Castilla excluida");
  assert(qualified.some((q) => q.teamId === "t6" && q.replacedIneligible), "t6 ocupa plaza de filial");
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
  assert("winnerId" in result && result.winnerId === "home", "Pasa el mejor clasificado (3º)");
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
  assert("winnerId" in result && result.winnerId === "away", "Sin away goals: pasa mejor en liga (3º)");
}

{
  const teamIds = Array.from({ length: 20 }, (_, i) => `t${i + 1}`);
  const standings = computeStandings(teamIds, [], PRIMERA_RFEF_STANDINGS_ZONES);
  assert(standings[0]?.zone === "promotion", "1º: ascenso directo");
  assert(standings[1]?.zone === "playoff" && standings[4]?.zone === "playoff", "2º–5º: playoff");
  assert(standings[5]?.zone === "mid", "6º: zona media");
  assert(standings[14]?.zone === "mid", "15º: zona media");
  assert(standings[15]?.zone === "relegation" && standings[19]?.zone === "relegation", "5 últimos: descenso");
  assert(
    PRIMERA_RFEF_RULES.zones.promotion === 1 &&
      PRIMERA_RFEF_RULES.zones.playoff === 4 &&
      PRIMERA_RFEF_RULES.zones.relegation === 5,
    "Reglas exportadas con zonas 1ª RFEF",
  );
}

console.log("OK: reglas RFEF verificadas");
