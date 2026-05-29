import type { Team } from "@/types";

const DEFAULT_ZONE_ABOVE = 2;
const DEFAULT_ZONE_BELOW = 3;
export const LEAGUE_ZONE_WINDOW_SIZE = DEFAULT_ZONE_ABOVE + DEFAULT_ZONE_BELOW + 1;

/**
 * Returns up to `windowAbove` + self + `windowBelow` teams around `highlightTeamId`.
 * Missing slots above/below are redistributed to the other side (never negative offsets).
 */
export function getStandingsWindow(
  teams: Team[],
  highlightTeamId: string,
  windowAbove = DEFAULT_ZONE_ABOVE,
  windowBelow = DEFAULT_ZONE_BELOW,
): Team[] {
  const sorted = [...teams].sort((a, b) => a.position - b.position);
  const index = sorted.findIndex((team) => team.id === highlightTeamId);
  if (index === -1) return sorted.slice(0, windowAbove + windowBelow + 1);

  const maxAbove = index;
  const maxBelow = sorted.length - 1 - index;

  let above = Math.min(windowAbove, maxAbove);
  let below = Math.min(windowBelow, maxBelow);

  below = Math.min(maxBelow, below + (windowAbove - above));
  above = Math.min(maxAbove, above + (windowBelow - Math.min(windowBelow, maxBelow)));

  return sorted.slice(index - above, index + below + 1);
}

/** Six-team window (2 above, 3 below) for "Tu zona en la liga". */
export function getLeagueZoneStandingsWindow(teams: Team[], highlightTeamId: string): Team[] {
  return getStandingsWindow(teams, highlightTeamId, DEFAULT_ZONE_ABOVE, DEFAULT_ZONE_BELOW);
}

/** Balanced window around `highlightTeamId` with up to `totalRows` teams (including self). */
export function getBalancedStandingsWindow(teams: Team[], highlightTeamId: string, totalRows = 10): Team[] {
  const extra = Math.max(0, totalRows - 1);
  const aboveTarget = Math.floor(extra / 2);
  const belowTarget = extra - aboveTarget;
  return getStandingsWindow(teams, highlightTeamId, aboveTarget, belowTarget);
}
