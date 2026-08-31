"use client";

import { formatFanRating } from "@/lib/format-fan-rating";
import type { PlayerRatingAverage } from "@/lib/match-ratings-storage";
import type { SquadPlayer } from "@/types/squad";
import { MatchRatingsPlayerCard } from "@/components/match-center/MatchRatingsPlayerCard";

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
        const displayRating = community ? community.average : userRating;

        return (
          <div key={player.id} className="relative pt-4">
            <p className="absolute left-1/2 top-0 z-10 -translate-x-1/2 text-2xl font-black tabular-nums leading-none text-[#981915] drop-shadow-sm sm:text-3xl">
              {formatFanRating(displayRating)}
            </p>
            <MatchRatingsPlayerCard player={player} widthClass="w-full" className="mx-auto max-w-[9rem]" />
            {community && community.count > 0 ? (
              <p className="mt-1.5 text-center text-[10px] text-slate-400">
                {community.count} voto{community.count === 1 ? "" : "s"}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
