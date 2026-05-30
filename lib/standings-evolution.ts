import { PRIMERA_RFEF_RULES } from "@/lib/rfef-rules";
import {
  getPlayedLeagueRounds,
  getTeamsAtRound,
  qualifyingRoundAfterJornada,
} from "@/lib/standings";
import type { Matchday, Team } from "@/types";

export type StandingsEvolutionPoint = {
  round: number;
  position: number;
};

/** Posición en la tabla tras cada jornada disputada (incluye esa jornada). */
export function getTeamStandingsEvolution(
  teamId: string,
  sourceTeams: Team[],
  matchdays: Matchday[],
): StandingsEvolutionPoint[] {
  const { zones, tiebreak } = PRIMERA_RFEF_RULES;
  const playedRounds = getPlayedLeagueRounds(matchdays);

  return playedRounds.map((round) => {
    const qualifyingRound = qualifyingRoundAfterJornada(round);
    const teamsAtRound = getTeamsAtRound(sourceTeams, matchdays, qualifyingRound, zones, tiebreak);
    const team = teamsAtRound.find((entry) => entry.id === teamId);
    return { round, position: team?.position ?? sourceTeams.length };
  });
}
