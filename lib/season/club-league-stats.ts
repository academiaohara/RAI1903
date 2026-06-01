import { getRaiTeamId } from "@/lib/fixtures";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { matchToFinishedLeagueMatch } from "@/lib/standings";
import type { Matchday } from "@/types";
import type { SquadClubStats } from "@/types/squad";

export const EMPTY_SQUAD_CLUB_STATS: SquadClubStats = {
  partidos: 0,
  victorias: 0,
  empates: 0,
  derrotas: 0,
  golesFavor: 0,
  golesContra: 0,
  porteriasImbatidas: 0,
};

/** Estadísticas de liga del club a partir de las jornadas de la temporada vista. */
export function computeClubLeagueStatsFromMatchdays(
  teamId: string,
  matchdays: readonly Matchday[],
): SquadClubStats {
  const stats = { ...EMPTY_SQUAD_CLUB_STATS };

  for (const matchday of matchdays) {
    for (const match of matchday.matches) {
      const finished = matchToFinishedLeagueMatch(match);
      if (!finished) continue;

      const isHome = finished.homeTeamId === teamId;
      const isAway = finished.awayTeamId === teamId;
      if (!isHome && !isAway) continue;

      const goalsFor = isHome ? finished.homeScore : finished.awayScore;
      const goalsAgainst = isHome ? finished.awayScore : finished.homeScore;

      stats.partidos += 1;
      stats.golesFavor += goalsFor;
      stats.golesContra += goalsAgainst;
      if (goalsAgainst === 0) stats.porteriasImbatidas += 1;
      if (goalsFor > goalsAgainst) stats.victorias += 1;
      else if (goalsFor === goalsAgainst) stats.empates += 1;
      else stats.derrotas += 1;
    }
  }

  return stats;
}

export function computeClubLeagueStatsForGender(
  gender: PrimerEquipoGender,
  matchdays: readonly Matchday[],
): SquadClubStats {
  return computeClubLeagueStatsFromMatchdays(getRaiTeamId(gender), matchdays);
}
