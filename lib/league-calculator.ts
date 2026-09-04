import { isMatchPlayed } from "@/lib/match-result";
import {
  applyStandingsToTeams,
  zeroedTeamsForStandings,
  type StandingsZonesConfig,
} from "@/lib/standings";
import type { LeagueTiebreakContext } from "@/lib/rfef-rules/types";
import type { Match, Matchday, Team } from "@/types";

export type SimulatedScore = {
  homeScore: number;
  awayScore: number;
};

export type SimulatedScores = Record<string, SimulatedScore>;

export function isValidSimulatedScore(score: SimulatedScore | undefined): score is SimulatedScore {
  if (!score) return false;
  return (
    Number.isInteger(score.homeScore) &&
    Number.isInteger(score.awayScore) &&
    score.homeScore >= 0 &&
    score.awayScore >= 0
  );
}

export function applySimulationsToMatch(match: Match, simulations: SimulatedScores): Match {
  if (isMatchPlayed(match)) return match;
  const sim = simulations[match.id];
  if (!isValidSimulatedScore(sim)) return match;
  return {
    ...match,
    homeScore: sim.homeScore,
    awayScore: sim.awayScore,
    status: "finished",
  };
}

export function mergeMatchdaysWithSimulations(matchdays: Matchday[], simulations: SimulatedScores): Match[] {
  return matchdays.flatMap((matchday) => matchday.matches.map((match) => applySimulationsToMatch(match, simulations)));
}

export function computeCalculatorStandings(
  teams: Team[],
  matchdays: Matchday[],
  simulations: SimulatedScores,
  zones: StandingsZonesConfig,
  tiebreak?: LeagueTiebreakContext,
): Team[] {
  const matches = mergeMatchdaysWithSimulations(matchdays, simulations);
  return applyStandingsToTeams(zeroedTeamsForStandings(teams), matches, zones, tiebreak);
}

export function getFirstPendingRound(matchdays: Matchday[], totalRounds: number): number {
  for (let round = 1; round <= totalRounds; round += 1) {
    const matchday = matchdays.find((item) => item.round === round);
    if (!matchday) continue;
    if (matchday.matches.some((match) => !isMatchPlayed(match))) return round;
  }
  return Math.max(1, totalRounds);
}

export function countPendingMatches(matchdays: Matchday[]): number {
  return matchdays.flatMap((matchday) => matchday.matches).filter((match) => !isMatchPlayed(match)).length;
}

export function countSimulatedMatches(matchdays: Matchday[], simulations: SimulatedScores): number {
  return matchdays
    .flatMap((matchday) => matchday.matches)
    .filter((match) => !isMatchPlayed(match) && isValidSimulatedScore(simulations[match.id])).length;
}
