import type { MatchDetail, MatchLineup } from "@/types";

export function hasLineupData(lineup: MatchLineup): boolean {
  return lineup.starters.length > 0 || lineup.bench.length > 0;
}

export function hasMatchLineups(detail: Pick<MatchDetail, "homeLineup" | "awayLineup">): boolean {
  return hasLineupData(detail.homeLineup) || hasLineupData(detail.awayLineup);
}
