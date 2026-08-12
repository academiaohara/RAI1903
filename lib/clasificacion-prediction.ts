import { computeStandings, extractLeagueMatches } from "@/lib/standings";
import { hasSeasonStarted } from "@/lib/quinigol";
import type { Matchday, Team } from "@/types";

export type ClasificacionPrediction = {
  teamId: string;
  position: number;
  updatedAt: string;
};

export const CLASIFICACION_MAX_POSITION_POINTS = 20;

export function scoreClasificacionPosition(predicted: number, actual: number): number {
  const diff = Math.abs(predicted - actual);
  return Math.max(0, CLASIFICACION_MAX_POSITION_POINTS - diff);
}

export function buildActualStandingsByTeamId(teams: Team[], matchdays: Matchday[]): Map<string, number> {
  const allMatches = matchdays.flatMap((matchday) => matchday.matches);
  const leagueMatches = extractLeagueMatches(allMatches);
  const standings = computeStandings(
    teams.map((team) => team.id),
    leagueMatches,
  );
  return new Map(standings.map((row) => [row.teamId, row.position]));
}

export function scoreClasificacionPrediction(
  predictions: Record<string, ClasificacionPrediction>,
  actualPositions: Map<string, number>,
): number {
  let total = 0;
  for (const prediction of Object.values(predictions)) {
    const actual = actualPositions.get(prediction.teamId);
    if (actual === undefined) continue;
    total += scoreClasificacionPosition(prediction.position, actual);
  }
  return total;
}

export function isClasificacionComplete(
  predictions: Record<string, ClasificacionPrediction>,
  teamCount: number,
): boolean {
  if (teamCount <= 0) return false;
  if (Object.keys(predictions).length !== teamCount) return false;
  const positions = new Set<number>();
  for (const prediction of Object.values(predictions)) {
    if (prediction.position < 1 || prediction.position > teamCount) return false;
    positions.add(prediction.position);
  }
  return positions.size === teamCount;
}

export function isClasificacionLocked(matchdays: Matchday[], now = new Date()): boolean {
  return hasSeasonStarted(matchdays, now);
}
