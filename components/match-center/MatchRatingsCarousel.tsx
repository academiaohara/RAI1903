"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { PlayerAvatar } from "@/components/squad/PlayerAvatar";
import { formatFanRating } from "@/lib/format-fan-rating";
import type { PlayerRatingAverage } from "@/lib/match-ratings-storage";
import { getPlayerFullName } from "@/lib/squad-utils";
import type { SquadPlayer } from "@/types/squad";

const SLIDER_MIN = 0;
const SLIDER_MAX = 10;
const SLIDER_STEP = 0.5;
const SLIDER_DEFAULT = 5;

type MatchRatingsCarouselProps = {
  players: SquadPlayer[];
  draftRatings: Record<string, number>;
  averages: Record<string, PlayerRatingAverage>;
  onRatingChange: (playerId: string, value: number) => void;
  disabled?: boolean;
};

function clampRating(value: number): number {
  return Math.min(SLIDER_MAX, Math.max(SLIDER_MIN, Math.round(value / SLIDER_STEP) * SLIDER_STEP));
}

export function MatchRatingsCarousel({
  players,
  draftRatings,
  averages,
  onRatingChange,
  disabled = false,
}: MatchRatingsCarouselProps) {
  const [activeIndex, setActiveIndex] = useStateSafe(0, players.length);
  const currentPlayer = players[activeIndex];

  if (!currentPlayer) return null;

  const sliderValue = draftRatings[currentPlayer.id] ?? SLIDER_DEFAULT;
  const community = averages[currentPlayer.id];

  const goPrev = () => {
    setActiveIndex((index) => (index <= 0 ? players.length - 1 : index - 1));
  };

  const goNext = () => {
    setActiveIndex((index) => (index >= players.length - 1 ? 0 : index + 1));
  };

  const adjustRating = (delta: number) => {
    if (disabled) return;
    onRatingChange(currentPlayer.id, clampRating(sliderValue + delta));
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <button
          type="button"
          onClick={goPrev}
          disabled={players.length <= 1}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#214C9B]/20 bg-white p-2 text-[#214C9B] shadow-md transition hover:border-[#214C9B]/40 hover:bg-blue-50 disabled:opacity-30"
          aria-label="Jugador anterior"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          type="button"
          onClick={goNext}
          disabled={players.length <= 1}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-[#214C9B]/20 bg-white p-2 text-[#214C9B] shadow-md transition hover:border-[#214C9B]/40 hover:bg-blue-50 disabled:opacity-30"
          aria-label="Jugador siguiente"
        >
          <ChevronRight size={20} />
        </button>

        <div className="mx-auto flex w-fit max-w-full items-center justify-center px-12 sm:px-14">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="shrink-0">
              <p className="mb-2 truncate text-sm font-extrabold uppercase tracking-wide text-slate-700">
                {getPlayerFullName(currentPlayer)}
              </p>

              <div className="relative aspect-[3/4] w-[min(40vw,10.5rem)] overflow-hidden rounded-2xl border-2 border-[#981915]/30 bg-gradient-to-b from-slate-100 to-white shadow-lg sm:w-40">
                <PlayerAvatar
                  player={currentPlayer}
                  bare
                  placeholderTone="light"
                  imageClassName="object-cover object-top"
                  className="h-full w-full"
                  priority
                />
                {currentPlayer.dorsal ? (
                  <div className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#214C9B] text-sm font-extrabold text-white shadow">
                    {currentPlayer.dorsal}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-center gap-2 self-end pb-1">
              <button
                type="button"
                onClick={() => adjustRating(SLIDER_STEP)}
                disabled={disabled || sliderValue >= SLIDER_MAX}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#981915] text-white shadow-md transition hover:bg-[#7f1411] disabled:opacity-40 sm:h-12 sm:w-12"
                aria-label="Subir nota"
              >
                <Plus size={22} />
              </button>

              <div className="text-center">
                <p className="text-4xl font-black tabular-nums leading-none text-[#981915] sm:text-5xl">
                  {formatFanRating(sliderValue)}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Tu nota</p>
              </div>

              <button
                type="button"
                onClick={() => adjustRating(-SLIDER_STEP)}
                disabled={disabled || sliderValue <= SLIDER_MIN}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-[#981915] text-white shadow-md transition hover:bg-[#7f1411] disabled:opacity-40 sm:h-12 sm:w-12"
                aria-label="Bajar nota"
              >
                <Minus size={22} />
              </button>

              {community ? (
                <div className="mt-1 rounded-xl border border-[#214C9B]/15 bg-slate-50 px-2.5 py-2 text-center">
                  <p className="text-[10px] font-bold uppercase text-slate-500">Comunidad</p>
                  <p className="text-base font-extrabold tabular-nums text-[#214C9B] sm:text-lg">
                    {formatFanRating(community.average)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {community.count} voto{community.count === 1 ? "" : "s"}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-1.5">
        {players.map((player, index) => (
          <button
            key={player.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === activeIndex ? "w-6 bg-[#981915]" : "w-1.5 bg-slate-300 hover:bg-slate-400"
            }`}
            aria-label={`Ir a ${getPlayerFullName(player)}`}
          />
        ))}
      </div>
    </div>
  );
}

/** Mantiene el índice dentro de rango cuando cambia el número de jugadores. */
function useStateSafe(initial: number, itemCount: number) {
  const [index, setIndex] = useState(initial);

  const safeIndex = itemCount === 0 ? 0 : Math.min(index, itemCount - 1);

  const setSafeIndex = (updater: number | ((current: number) => number)) => {
    setIndex((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      if (itemCount === 0) return 0;
      return ((next % itemCount) + itemCount) % itemCount;
    });
  };

  return [safeIndex, setSafeIndex] as const;
}
