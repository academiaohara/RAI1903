"use client";

import { useMemo, useState } from "react";
import { getSquadPlayers } from "@/lib/squad-data";
import { getRaiTeamId } from "@/lib/fixtures";
import { lineupPlayersToSquad } from "@/lib/squad-lineup";
import {
  formatFanRating,
  getMatchCommunityAverage,
  getMatchRatings,
  getPlayerMatchRating,
  savePlayerMatchRating,
} from "@/lib/player-ratings";
import { getPlayerFullName } from "@/lib/squad-utils";
import type { MatchDetail } from "@/types";

type MatchRatingsPanelProps = {
  detail: MatchDetail;
};

const SLIDER_MIN = 0;
const SLIDER_MAX = 10;
const SLIDER_STEP = 0.5;
const SLIDER_DEFAULT = 5;

export function MatchRatingsPanel({ detail }: MatchRatingsPanelProps) {
  const raiId = getRaiTeamId(detail.gender);
  const isHome = detail.match.homeTeamId === raiId;
  const avilesLineup = isHome ? detail.homeLineup : detail.awayLineup;
  const squad = useMemo(() => getSquadPlayers(detail.gender), [detail.gender]);
  const lineupEntries = useMemo(
    () => lineupPlayersToSquad(avilesLineup, squad).filter((entry) => entry.player != null),
    [avilesLineup, squad],
  );

  const [ratings, setRatings] = useState<Record<string, number>>(() => getMatchRatings(detail.match.id));

  const handleRate = (playerId: string, rating: number) => {
    savePlayerMatchRating(detail.match.id, playerId, rating);
    setRatings((current) => ({ ...current, [playerId]: rating }));
  };

  if (lineupEntries.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-extrabold uppercase tracking-normal text-[#214C9B]">Valoraciones</h2>
        <p className="mt-4 text-sm text-slate-600">No hay jugadores del Avilés disponibles para valorar en este partido.</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-extrabold uppercase tracking-normal text-[#214C9B]">Valoraciones</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Puntúa el rendimiento de cada jugador tras el partido. Tu nota se guarda en este dispositivo y alimenta la media
        de valoración de la ficha.
      </p>

      <ul className="mt-6 space-y-4">
        {lineupEntries.map((entry) => {
          const player = entry.player!;
          const savedRating = ratings[player.id] ?? getPlayerMatchRating(detail.match.id, player.id);
          const sliderValue = savedRating ?? SLIDER_DEFAULT;
          const communityAverage = getMatchCommunityAverage(detail.match.id, player.id);

          return (
            <li
              key={player.id}
              className="rounded-2xl border border-[#214C9B]/15 bg-slate-50/80 p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <p className="flex min-w-0 items-center gap-2 text-sm font-extrabold uppercase text-slate-900">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#214C9B] text-xs font-extrabold text-white">
                    {player.dorsal}
                  </span>
                  <span className="truncate">{getPlayerFullName(player)}</span>
                </p>

                <div
                  className="flex shrink-0 flex-col items-center justify-center rounded-xl border border-[#214C9B]/20 bg-white px-3 py-2 text-center"
                  title="Media de la afición en este partido"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Media</span>
                  <span className="text-lg font-extrabold tabular-nums text-[#214C9B]">
                    {formatFanRating(communityAverage)}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <input
                  type="range"
                  min={SLIDER_MIN}
                  max={SLIDER_MAX}
                  step={SLIDER_STEP}
                  value={sliderValue}
                  onChange={(event) => handleRate(player.id, Number(event.target.value))}
                  className="h-2 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-[#214C9B]/15 accent-[#214C9B]"
                  aria-label={`Valoración de ${getPlayerFullName(player)}`}
                />
                <span className="w-9 shrink-0 text-right text-sm font-extrabold tabular-nums text-[#214C9B]">
                  {formatFanRating(sliderValue)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
