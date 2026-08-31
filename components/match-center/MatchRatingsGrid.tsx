"use client";

import type { PlayerRatingAverage } from "@/lib/match-ratings-storage";
import type { SquadPlayer } from "@/types/squad";
import { MatchRatingsCardStack } from "@/components/match-center/MatchRatingsCardStack";

const SLIDER_DEFAULT = 5;

type MatchRatingsGridProps = {
  players: SquadPlayer[];
  draftRatings: Record<string, number>;
  averages: Record<string, PlayerRatingAverage>;
};

export function MatchRatingsGrid({ players, draftRatings, averages }: MatchRatingsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 md:grid-cols-4 lg:grid-cols-5">
      {players.map((player) => {
        const community = averages[player.id];
        const userRating = draftRatings[player.id] ?? SLIDER_DEFAULT;

        return (
          <MatchRatingsCardStack
            key={player.id}
            player={player}
            community={community}
            userRating={userRating}
            fallbackUserRating
          />
        );
      })}
    </div>
  );
}
