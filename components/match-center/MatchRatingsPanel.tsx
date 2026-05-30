"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { getSquadPlayers } from "@/lib/squad-data";
import { getRaiTeamId } from "@/lib/fixtures";
import { lineupPlayersToSquad } from "@/lib/squad-lineup";
import {
  formatFanRating,
  getMatchRatings,
  getPlayerAverageFanRating,
  getPlayerMatchRating,
  savePlayerMatchRating,
} from "@/lib/player-ratings";
import { getPlayerFullName } from "@/lib/squad-utils";
import type { MatchDetail } from "@/types";

type MatchRatingsPanelProps = {
  detail: MatchDetail;
};

const RATING_OPTIONS = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10] as const;

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
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
        Puntúa el rendimiento de cada jugador tras el partido. Tu nota se guarda en este dispositivo y alimenta la media
        de valoración de la ficha.
      </p>

      <ul className="mt-6 space-y-4">
        {lineupEntries.map((entry) => {
          const player = entry.player!;
          const userRating = ratings[player.id] ?? getPlayerMatchRating(detail.match.id, player.id);
          const seasonAverage = getPlayerAverageFanRating(player.id);

          return (
            <li
              key={player.id}
              className="rounded-2xl border border-[#214C9B]/15 bg-slate-50/80 p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-extrabold uppercase text-slate-900">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#214C9B] text-xs font-extrabold text-white">
                      {player.dorsal}
                    </span>
                    {getPlayerFullName(player)}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {player.rol}
                    {seasonAverage ? (
                      <>
                        {" "}
                        · Media temporada:{" "}
                        <span className="text-[#214C9B]">{formatFanRating(seasonAverage.average)}</span>
                        <span className="text-slate-400"> ({seasonAverage.count})</span>
                      </>
                    ) : null}
                  </p>
                </div>
                {userRating != null && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#214C9B] px-3 py-1 text-xs font-bold text-white">
                    <Star size={12} className="fill-current" />
                    Tu nota: {formatFanRating(userRating)}
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {RATING_OPTIONS.map((rating) => {
                  const active = userRating === rating;
                  return (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleRate(player.id, rating)}
                      className={`min-w-[2.75rem] rounded-lg px-2 py-2 text-xs font-extrabold tabular-nums transition ${
                        active
                          ? "bg-[#214C9B] text-white shadow-md"
                          : "border border-slate-200 bg-white text-slate-700 hover:border-[#214C9B]/40 hover:bg-blue-50"
                      }`}
                    >
                      {formatFanRating(rating)}
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
