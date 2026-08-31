import type { PlayerRatingAverage } from "@/lib/match-ratings-storage";
import { getPlayerFullName } from "@/lib/squad-utils";
import type { SquadPlayer } from "@/types/squad";

export type SeasonRatingEntry = {
  player: SquadPlayer;
  rating: PlayerRatingAverage;
};

/** Jugadores con al menos un voto, ordenados de mayor a menor nota media. */
export function buildSeasonRatingsRanking(
  squad: SquadPlayer[],
  averages: Record<string, PlayerRatingAverage>,
): SeasonRatingEntry[] {
  return squad
    .map((player) => {
      const rating = averages[player.id];
      if (!rating || rating.count <= 0) return null;
      return { player, rating };
    })
    .filter((entry): entry is SeasonRatingEntry => entry !== null)
    .sort((a, b) => {
      const diff = b.rating.average - a.rating.average;
      if (diff !== 0) return diff;
      return getPlayerFullName(a.player).localeCompare(getPlayerFullName(b.player), "es");
    });
}
