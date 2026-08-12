import { computeStandings, extractLeagueMatches, getLastPlayedLeagueRound, getTeamsAtRound, qualifyingRoundAfterJornada } from "@/lib/standings";
import { PRIMERA_RFEF_RULES } from "@/lib/rfef-rules";
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
  if (matchdays.length === 0 || teams.length === 0) {
    return new Map();
  }

  const lastPlayed = getLastPlayedLeagueRound(matchdays);
  const qualifyingRound = qualifyingRoundAfterJornada(lastPlayed);
  const standingsTeams = getTeamsAtRound(
    teams,
    matchdays,
    qualifyingRound,
    PRIMERA_RFEF_RULES.zones,
    PRIMERA_RFEF_RULES.tiebreak,
  );

  if (standingsTeams.length > 0) {
    return new Map(standingsTeams.map((team) => [team.id, team.position]));
  }

  const allMatches = matchdays.flatMap((matchday) => matchday.matches);
  const leagueMatches = extractLeagueMatches(allMatches);
  const standings = computeStandings(
    teams.map((team) => team.id),
    leagueMatches,
    PRIMERA_RFEF_RULES.zones,
    PRIMERA_RFEF_RULES.tiebreak,
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

/** Positivo = el equipo acaba peor de lo predicho; negativo = mejor. */
export function getPositionDiff(predicted: number, actual: number): number {
  return actual - predicted;
}

export type PositionDiffKind = "exact" | "above" | "below";

export function getPositionDiffKind(predicted: number, actual: number): PositionDiffKind {
  const diff = getPositionDiff(predicted, actual);
  if (diff === 0) return "exact";
  return diff > 0 ? "below" : "above";
}

export function predictionsToOrderedTeamIds(
  teams: Team[],
  predictions: Record<string, ClasificacionPrediction>,
): string[] {
  const ranked = teams
    .filter((team) => predictions[team.id])
    .sort(
      (a, b) =>
        (predictions[a.id]?.position ?? 999) - (predictions[b.id]?.position ?? 999) ||
        a.name.localeCompare(b.name, "es"),
    )
    .map((team) => team.id);

  const unranked = teams
    .filter((team) => !predictions[team.id])
    .sort((a, b) => a.name.localeCompare(b.name, "es"))
    .map((team) => team.id);

  return [...ranked, ...unranked];
}

export function orderedTeamIdsToPredictions(orderedTeamIds: string[]): Record<string, ClasificacionPrediction> {
  const updatedAt = new Date().toISOString();
  return Object.fromEntries(
    orderedTeamIds.map((teamId, index) => [
      teamId,
      { teamId, position: index + 1, updatedAt } satisfies ClasificacionPrediction,
    ]),
  );
}
