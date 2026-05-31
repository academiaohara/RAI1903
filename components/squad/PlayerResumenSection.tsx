"use client";

import type { PlayerRatingAverage } from "@/lib/match-ratings-storage";
import { formatFanRating } from "@/lib/format-fan-rating";
import type { SquadPlayer } from "@/types/squad";

export function PlayerResumenSection({
  player,
  fanRating,
}: {
  player: SquadPlayer;
  fanRating?: PlayerRatingAverage | null;
}) {
  return (
    <div className="space-y-4">
      {(player.valorMercado || fanRating) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {player.valorMercado && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Valor de mercado</p>
              <p className="mt-1 text-2xl font-extrabold text-[#214C9B]">{player.valorMercado}</p>
            </div>
          )}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Valoración media (afición)</p>
            <p className="mt-1 text-2xl font-extrabold text-[#214C9B]">
              {fanRating ? formatFanRating(fanRating.average) : "—"}
            </p>
            {fanRating && (
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {fanRating.count} valoración{fanRating.count === 1 ? "" : "es"} en postpartido
              </p>
            )}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#214C9B]">Sobre el jugador</h3>
        <p className="mt-4 text-sm leading-8 text-slate-700">{player.descripcion}</p>
      </div>
    </div>
  );
}
