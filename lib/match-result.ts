import type { MatchStatus } from "@/types";

type MatchResultFields = {
  status?: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  /** Calendario: derivado de status o marcador. */
  played?: boolean;
};

/** Partido con resultado conocido (finalizado o con marcador guardado). */
export function isMatchPlayed(match: MatchResultFields): boolean {
  if (match.played) return true;
  if (match.status === "finished") return true;
  return match.homeScore !== undefined && match.awayScore !== undefined;
}

export function formatMatchScore(homeScore: number, awayScore: number, separator = " - "): string {
  return `${homeScore}${separator}${awayScore}`;
}
