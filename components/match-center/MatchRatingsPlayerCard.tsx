"use client";

import { PlayerAvatar } from "@/components/squad/PlayerAvatar";
import { getPlayerFullName } from "@/lib/squad-utils";
import type { SquadPlayer } from "@/types/squad";

type MatchRatingsPlayerCardProps = {
  player: SquadPlayer;
  variant?: "default" | "dimmed";
  className?: string;
  widthClass?: string;
};

export function MatchRatingsPlayerCard({
  player,
  variant = "default",
  className = "",
  widthClass = "w-[min(40vw,10.5rem)] sm:w-40",
}: MatchRatingsPlayerCardProps) {
  const isDimmed = variant === "dimmed";

  return (
    <div
      className={`relative aspect-[3/4] overflow-hidden rounded-2xl border-2 border-[#981915]/30 bg-gradient-to-b from-slate-100 to-white shadow-lg transition ${widthClass} ${
        isDimmed ? "scale-90 opacity-40" : ""
      } ${className}`}
    >
      <PlayerAvatar
        player={player}
        bare
        placeholderTone="light"
        imageClassName="object-cover object-top"
        className="h-full w-full"
        priority={!isDimmed}
      />
      {player.dorsal ? (
        <div className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#214C9B] text-sm font-extrabold text-white shadow">
          {player.dorsal}
        </div>
      ) : null}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-2 pb-2.5 pt-10">
        <p className="truncate text-center text-xs font-extrabold uppercase leading-tight text-white sm:text-sm">
          {getPlayerFullName(player)}
        </p>
      </div>
    </div>
  );
}
