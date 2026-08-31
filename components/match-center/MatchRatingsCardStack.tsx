"use client";

import { formatFanRating } from "@/lib/format-fan-rating";
import type { PlayerRatingAverage } from "@/lib/match-ratings-storage";
import type { SquadPlayer } from "@/types/squad";
import { MatchRatingsPlayerCard } from "@/components/match-center/MatchRatingsPlayerCard";

const NAVY = "#214C9B";
const GARNET = "#981915";

type MatchRatingsCardStackProps = {
  player: SquadPlayer;
  community?: PlayerRatingAverage;
  userRating?: number;
  variant?: "default" | "dimmed";
  widthClass?: string;
  className?: string;
  /** En la rejilla, si no hay media de comunidad, muestra la nota del usuario en granate. */
  fallbackUserRating?: boolean;
};

export function MatchRatingsCardStack({
  player,
  community,
  userRating,
  variant = "default",
  widthClass,
  className = "",
  fallbackUserRating = false,
}: MatchRatingsCardStackProps) {
  const showCommunity = Boolean(community && community.count > 0);
  const showUserFallback = fallbackUserRating && !showCommunity && userRating !== undefined;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {showCommunity ? (
        <p
          className="mb-2 text-center text-2xl font-black tabular-nums leading-none sm:text-3xl"
          style={{ color: NAVY }}
        >
          {formatFanRating(community!.average)}
        </p>
      ) : showUserFallback ? (
        <p
          className="mb-2 text-center text-2xl font-black tabular-nums leading-none sm:text-3xl"
          style={{ color: GARNET }}
        >
          {formatFanRating(userRating!)}
        </p>
      ) : (
        <div className="mb-2 h-8" aria-hidden />
      )}

      <MatchRatingsPlayerCard player={player} variant={variant} widthClass={widthClass} />

      {showCommunity ? (
        <p className="mt-2 text-center text-[10px] text-slate-400">
          {community!.count} voto{community!.count === 1 ? "" : "s"}
        </p>
      ) : (
        <div className="mt-2 h-[14px]" aria-hidden />
      )}
    </div>
  );
}
