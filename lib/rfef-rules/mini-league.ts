import type { FinishedLeagueMatch } from "@/lib/standings";

export type MiniLeagueStats = {
  teamId: string;
  played: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
};

function emptyStats(teamId: string): MiniLeagueStats {
  return {
    teamId,
    played: 0,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
  };
}

/**
 * Estadísticas de la mini-liga entre `teamIds` usando solo enfrentamientos directos.
 */
export function computeMiniLeagueStats(
  teamIds: readonly string[],
  matches: readonly FinishedLeagueMatch[],
): Map<string, MiniLeagueStats> {
  const set = new Set(teamIds);
  const stats = new Map(teamIds.map((id) => [id, emptyStats(id)]));

  for (const match of matches) {
    if (!set.has(match.homeTeamId) || !set.has(match.awayTeamId)) continue;

    const home = stats.get(match.homeTeamId)!;
    const away = stats.get(match.awayTeamId)!;

    home.played += 1;
    away.played += 1;
    home.goalsFor += match.homeScore;
    home.goalsAgainst += match.awayScore;
    away.goalsFor += match.awayScore;
    away.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      home.points += 3;
    } else if (match.homeScore < match.awayScore) {
      away.points += 3;
    } else {
      home.points += 1;
      away.points += 1;
    }
  }

  for (const row of stats.values()) {
    row.goalDifference = row.goalsFor - row.goalsAgainst;
  }

  return stats;
}

/** Diferencia de goles en enfrentamientos directos entre exactamente dos equipos. */
export function headToHeadGoalDifference(
  teamA: string,
  teamB: string,
  matches: readonly FinishedLeagueMatch[],
): number {
  let gfA = 0;
  let gcA = 0;

  for (const match of matches) {
    const involvesA = match.homeTeamId === teamA || match.awayTeamId === teamA;
    const involvesB = match.homeTeamId === teamB || match.awayTeamId === teamB;
    if (!involvesA || !involvesB) continue;

    if (match.homeTeamId === teamA) {
      gfA += match.homeScore;
      gcA += match.awayScore;
    } else {
      gfA += match.awayScore;
      gcA += match.homeScore;
    }
  }

  return gfA - gcA;
}
