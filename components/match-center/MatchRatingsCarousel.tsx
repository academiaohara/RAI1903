"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { MatchRatingsCardStack } from "@/components/match-center/MatchRatingsCardStack";
import { MatchRatingsPlayerCard } from "@/components/match-center/MatchRatingsPlayerCard";
import { formatFanRating } from "@/lib/format-fan-rating";
import type { PlayerRatingAverage } from "@/lib/match-ratings-storage";
import { getPlayerFullName } from "@/lib/squad-utils";
import type { SquadPlayer } from "@/types/squad";

const SLIDER_MIN = 0;
const SLIDER_MAX = 10;
const SLIDER_STEP = 0.5;
const SLIDER_DEFAULT = 5;
const GARNET = "#981915";

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

function UserRatingControls({
  sliderValue,
  disabled,
  onAdjust,
}: {
  sliderValue: number;
  disabled: boolean;
  onAdjust: (delta: number) => void;
}) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-2 self-end pb-1">
      <button
        type="button"
        onClick={() => onAdjust(SLIDER_STEP)}
        disabled={disabled || sliderValue >= SLIDER_MAX}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#981915] text-white shadow-md transition hover:bg-[#7f1411] disabled:opacity-40 sm:h-12 sm:w-12"
        aria-label="Subir nota"
      >
        <Plus size={22} />
      </button>

      <div className="text-center">
        <p
          className="text-4xl font-black tabular-nums leading-none sm:text-5xl"
          style={{ color: GARNET }}
        >
          {formatFanRating(sliderValue)}
        </p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Tu nota</p>
      </div>

      <button
        type="button"
        onClick={() => onAdjust(-SLIDER_STEP)}
        disabled={disabled || sliderValue <= SLIDER_MIN}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#981915] text-white shadow-md transition hover:bg-[#7f1411] disabled:opacity-40 sm:h-12 sm:w-12"
        aria-label="Bajar nota"
      >
        <Minus size={22} />
      </button>
    </div>
  );
}

export function MatchRatingsCarousel({
  players,
  draftRatings,
  averages,
  onRatingChange,
  disabled = false,
}: MatchRatingsCarouselProps) {
  const [activeIndex, setActiveIndex] = useStateSafe(0, players.length);
  const mobileTrackRef = useRef<HTMLDivElement>(null);

  const currentPlayer = players[activeIndex];
  const prevPlayer = players[(activeIndex - 1 + players.length) % players.length];
  const nextPlayer = players[(activeIndex + 1) % players.length];

  const goPrev = useCallback(() => {
    setActiveIndex((index) => (index <= 0 ? players.length - 1 : index - 1));
  }, [players.length, setActiveIndex]);

  const goNext = useCallback(() => {
    setActiveIndex((index) => (index >= players.length - 1 ? 0 : index + 1));
  }, [players.length, setActiveIndex]);

  useEffect(() => {
    const track = mobileTrackRef.current;
    if (!track) return;

    const slide = track.children[activeIndex];
    if (!(slide instanceof HTMLElement)) return;

    track.scrollTo({ left: slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2, behavior: "smooth" });
  }, [activeIndex]);

  if (!currentPlayer) return null;

  const sliderValue = draftRatings[currentPlayer.id] ?? SLIDER_DEFAULT;
  const community = averages[currentPlayer.id];

  const adjustRating = (delta: number) => {
    if (disabled) return;
    onRatingChange(currentPlayer.id, clampRating(sliderValue + delta));
  };

  return (
    <div className="space-y-4">
      {/* Desktop: carrusel con previews laterales */}
      <div className="relative hidden md:block">
        <button
          type="button"
          onClick={goPrev}
          disabled={players.length <= 1}
          className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-[#214C9B]/20 bg-white p-2 text-[#214C9B] shadow-md transition hover:border-[#214C9B]/40 hover:bg-blue-50 disabled:opacity-30"
          aria-label="Jugador anterior"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          type="button"
          onClick={goNext}
          disabled={players.length <= 1}
          className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-[#214C9B]/20 bg-white p-2 text-[#214C9B] shadow-md transition hover:border-[#214C9B]/40 hover:bg-blue-50 disabled:opacity-30"
          aria-label="Jugador siguiente"
        >
          <ChevronRight size={20} />
        </button>

        <div className="mx-auto flex max-w-2xl items-end justify-center gap-3 px-14">
          {players.length > 1 ? (
            <button
              type="button"
              onClick={goPrev}
              className="shrink-0 transition hover:opacity-60"
              aria-label={`Anterior: ${getPlayerFullName(prevPlayer)}`}
            >
              <MatchRatingsPlayerCard player={prevPlayer} variant="dimmed" widthClass="w-28" />
            </button>
          ) : (
            <div className="w-28 shrink-0" aria-hidden />
          )}

          <div className="flex items-end gap-3">
            <MatchRatingsCardStack
              player={currentPlayer}
              community={community}
              widthClass="w-40"
            />
            <UserRatingControls
              sliderValue={sliderValue}
              disabled={disabled}
              onAdjust={adjustRating}
            />
          </div>

          {players.length > 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="shrink-0 transition hover:opacity-60"
              aria-label={`Siguiente: ${getPlayerFullName(nextPlayer)}`}
            >
              <MatchRatingsPlayerCard player={nextPlayer} variant="dimmed" widthClass="w-28" />
            </button>
          ) : (
            <div className="w-28 shrink-0" aria-hidden />
          )}
        </div>
      </div>

      {/* Mobile: scroll horizontal */}
      <div className="md:hidden">
        <div
          ref={mobileTrackRef}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={(event) => {
            const track = event.currentTarget;
            const center = track.scrollLeft + track.clientWidth / 2;
            let closestIndex = 0;
            let closestDistance = Infinity;

            for (let i = 0; i < track.children.length; i++) {
              const slide = track.children[i];
              if (!(slide instanceof HTMLElement)) continue;
              const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
              const distance = Math.abs(slideCenter - center);
              if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
              }
            }

            if (closestIndex !== activeIndex) {
              setActiveIndex(closestIndex);
            }
          }}
        >
          {players.map((player) => {
            const playerSliderValue = draftRatings[player.id] ?? SLIDER_DEFAULT;
            const playerCommunity = averages[player.id];

            const adjustPlayerRating = (delta: number) => {
              if (disabled) return;
              onRatingChange(player.id, clampRating(playerSliderValue + delta));
            };

            return (
              <div
                key={player.id}
                className="flex w-[min(88vw,20rem)] shrink-0 snap-center items-end gap-2"
              >
                <MatchRatingsCardStack
                  player={player}
                  community={playerCommunity}
                  widthClass="w-[min(52vw,11rem)]"
                />
                <UserRatingControls
                  sliderValue={playerSliderValue}
                  disabled={disabled}
                  onAdjust={adjustPlayerRating}
                />
              </div>
            );
          })}
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
