"use client";

import { Trophy } from "lucide-react";
import { PlayerAvatar } from "@/components/squad/PlayerAvatar";
import { formatFanRating } from "@/lib/format-fan-rating";
import type { PlayerRatingAverage } from "@/lib/match-ratings-storage";
import { getPlayerFullName } from "@/lib/squad-utils";
import type { SquadPlayer } from "@/types/squad";

type RatedPlayer = {
  player: SquadPlayer;
  average: PlayerRatingAverage;
};

type MatchRatingsTop3Props = {
  players: RatedPlayer[];
};

function rankLabel(position: number): string {
  if (position === 1) return "1º";
  if (position === 2) return "2º";
  if (position === 3) return "3º";
  return `${position}º`;
}

export function MatchRatingsTop3({ players }: MatchRatingsTop3Props) {
  if (players.length === 0) return null;

  const [mvp, ...rest] = players.slice(0, 3);

  return (
    <section
      className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-[#173a78] p-4 text-white shadow-lg sm:p-5"
      aria-label="Top 3 del partido"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="relative shrink-0">
            <div className="h-28 w-20 overflow-hidden rounded-xl border-2 border-amber-400/60 bg-slate-800 shadow-lg sm:h-32 sm:w-24">
              <PlayerAvatar
                player={mvp.player}
                bare
                placeholderTone="dark"
                imageClassName="object-cover object-top"
                className="h-full w-full"
                priority
              />
            </div>
            <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-slate-900 shadow-md">
              <Trophy size={16} aria-hidden />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-300/90">
              MVP del partido
            </p>
            <h3 className="mt-1 truncate text-xl font-extrabold uppercase leading-tight sm:text-2xl">
              {getPlayerFullName(mvp.player)}
            </h3>

            {rest.length > 0 ? (
              <ul className="mt-3 space-y-1.5">
                {rest.map((entry, index) => (
                  <li key={entry.player.id} className="flex items-center gap-2 text-sm">
                    <PlayerAvatar
                      player={entry.player}
                      size="sm"
                      bare
                      placeholderTone="dark"
                      className="h-7 w-7 shrink-0 rounded-full"
                      imageClassName="object-cover object-top"
                    />
                    <span className="font-bold text-amber-200/80">{rankLabel(index + 2)}</span>
                    <span className="min-w-0 truncate font-semibold text-white/90">
                      {getPlayerFullName(entry.player)}
                    </span>
                    <span className="shrink-0 font-extrabold tabular-nums text-amber-200">
                      {formatFanRating(entry.average.average)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center sm:items-end">
          <p className="text-5xl font-black tabular-nums leading-none text-amber-300 sm:text-6xl">
            {formatFanRating(mvp.average.average)}
          </p>
          <p className="mt-1 text-xs font-semibold text-white/60">
            {mvp.average.count} voto{mvp.average.count === 1 ? "" : "s"}
          </p>
        </div>
      </div>
    </section>
  );
}
