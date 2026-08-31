"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";
import { PlayerAvatar } from "@/components/squad/PlayerAvatar";
import { Modal } from "@/components/Modal";
import { formatFanRating } from "@/lib/format-fan-rating";
import { buildSeasonRatingsRanking } from "@/lib/season-ratings-ranking";
import { getPlayerFullName } from "@/lib/squad-utils";
import type { PlayerRatingAverage } from "@/lib/match-ratings-storage";
import type { SquadPlayer } from "@/types/squad";

type SeasonRatingsRankingProps = {
  squad: SquadPlayer[];
  averages: Record<string, PlayerRatingAverage>;
  loading?: boolean;
};

function rankMedalClass(position: number): string {
  if (position === 1) return "bg-amber-400 text-slate-900";
  if (position === 2) return "bg-slate-300 text-slate-800";
  if (position === 3) return "bg-amber-700/80 text-white";
  return "bg-[#214C9B]/10 text-[#214C9B]";
}

export function SeasonRatingsRanking({ squad, averages, loading = false }: SeasonRatingsRankingProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const ranking = buildSeasonRatingsRanking(squad, averages);
  const top3 = ranking.slice(0, 3);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#214C9B]/15 bg-slate-50/80 px-4 py-5">
        <p className="text-sm text-slate-500">Cargando ranking de valoraciones…</p>
      </div>
    );
  }

  if (top3.length === 0) return null;

  return (
    <>
      <section
        className="rounded-2xl border border-[#214C9B]/15 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-4 sm:p-5"
        aria-label="Top 3 valoraciones de la temporada"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" aria-hidden />
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#214C9B]">
              Top valoraciones · temporada
            </h2>
          </div>
          {ranking.length > 3 ? (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="rounded-full border border-[#214C9B]/25 px-3 py-1 text-xs font-extrabold uppercase text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
            >
              Ver más
            </button>
          ) : null}
        </div>

        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {top3.map((entry, index) => (
            <li
              key={entry.player.id}
              className="flex items-center gap-3 rounded-xl border border-[#214C9B]/10 bg-white p-3 shadow-sm"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${rankMedalClass(index + 1)}`}
              >
                {index + 1}
              </span>
              <PlayerAvatar
                player={entry.player}
                size="sm"
                bare
                placeholderTone="light"
                className="h-10 w-10 shrink-0 rounded-xl"
                imageClassName="object-cover object-top"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold uppercase text-slate-900">
                  {getPlayerFullName(entry.player)}
                </p>
                <p className="text-xs text-slate-500">
                  {entry.rating.count} voto{entry.rating.count === 1 ? "" : "s"}
                </p>
              </div>
              <p className="shrink-0 text-xl font-black tabular-nums text-[#214C9B]">
                {formatFanRating(entry.rating.average)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <Modal open={modalOpen} title="Ranking de valoraciones" onClose={() => setModalOpen(false)} size="sm">
        <p className="mb-4 text-sm text-slate-600">
          Media de la afición en todos los partidos de la temporada.
        </p>
        <ol className="space-y-2">
          {ranking.map((entry, index) => (
            <li
              key={entry.player.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${rankMedalClass(index + 1)}`}
              >
                {index + 1}
              </span>
              <PlayerAvatar
                player={entry.player}
                size="sm"
                bare
                placeholderTone="light"
                className="h-9 w-9 shrink-0 rounded-lg"
                imageClassName="object-cover object-top"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">
                  {getPlayerFullName(entry.player)}
                </p>
                <p className="text-xs text-slate-500">
                  {entry.rating.count} voto{entry.rating.count === 1 ? "" : "s"}
                </p>
              </div>
              <p className="shrink-0 text-lg font-extrabold tabular-nums text-[#214C9B]">
                {formatFanRating(entry.rating.average)}
              </p>
            </li>
          ))}
        </ol>
      </Modal>
    </>
  );
}
