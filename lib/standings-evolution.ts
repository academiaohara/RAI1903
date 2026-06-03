import { PRIMERA_RFEF_RULES } from "@/lib/rfef-rules";
import type { LeagueTiebreakContext } from "@/lib/rfef-rules/types";
import {
  getPlayedLeagueRounds,
  getTeamsAtRound,
  qualifyingRoundAfterJornada,
  type StandingsZonesConfig,
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
  zones: StandingsZonesConfig = PRIMERA_RFEF_RULES.zones,
  tiebreak: LeagueTiebreakContext = PRIMERA_RFEF_RULES.tiebreak,
): StandingsEvolutionPoint[] {
  const playedRounds = getPlayedLeagueRounds(matchdays);

  return playedRounds.map((round) => {
    const qualifyingRound = qualifyingRoundAfterJornada(round);
    const teamsAtRound = getTeamsAtRound(sourceTeams, matchdays, qualifyingRound, zones, tiebreak);
    const team = teamsAtRound.find((entry) => entry.id === teamId);
    return { round, position: team?.position ?? sourceTeams.length };
  });
}
