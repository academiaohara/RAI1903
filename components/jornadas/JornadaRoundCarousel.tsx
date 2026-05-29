"use client";

import { OpponentCrest } from "@/components/OpponentCrest";
import { TeamCrest } from "@/components/TeamCrest";
import { getJornadaTeam } from "@/lib/jornadas-data";
import { cn } from "@/lib/utils";
import type { JornadaRoundId, JornadaRoundSummary } from "@/types/jornadas";
import { useEffect, useRef, type WheelEvent } from "react";

type JornadaRoundCarouselProps = {
  rounds: JornadaRoundSummary[];
  selectedId: JornadaRoundId;
  onSelect: (roundId: JornadaRoundId) => void;
};

const cardBase =
  "group flex h-[7.25rem] w-[4.75rem] shrink-0 flex-col items-center justify-between rounded-2xl border px-2 py-2.5 text-center transition sm:h-[7.75rem] sm:w-[5.25rem]";

function cardStateClass(isSelected: boolean, isCurrent: boolean): string {
  if (isSelected) {
    return isCurrent
      ? "border-[#981915] bg-[#981915] text-white shadow-md shadow-[#981915]/25"
      : "border-[#981915] bg-[#981915] text-white shadow-md shadow-[#981915]/20";
  }
  if (isCurrent) {
    return "border-[#981915]/40 bg-[#981915]/8 text-[#981915] hover:border-[#214C9B] hover:bg-[#214C9B] hover:text-white";
  }
  return "border-[#214C9B]/15 bg-slate-50 text-slate-800 hover:border-[#214C9B] hover:bg-[#214C9B] hover:text-white";
}

export function JornadaRoundCarousel({ rounds, selectedId, onSelect }: JornadaRoundCarouselProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const selected = list.querySelector<HTMLButtonElement>(`[data-round-id="${selectedId}"]`);
    selected?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [selectedId]);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    const list = event.currentTarget;
    if (list.scrollWidth <= list.clientWidth) return;
    event.preventDefault();
    list.scrollLeft += event.deltaY;
  };

  return (
    <div className="min-w-0 rounded-3xl border border-[#214C9B]/15 bg-white p-3 shadow-[0_12px_30px_rgba(17,24,39,0.06)] sm:p-4">
      <p className="text-xs font-bold uppercase tracking-normal text-[#214C9B]">Jornadas</p>
      <div
        ref={listRef}
        onWheel={handleWheel}
        role="tablist"
        aria-label="Selector de jornadas"
        className="no-scrollbar mt-3 flex w-full min-w-0 touch-pan-x flex-nowrap gap-2 overflow-x-auto overscroll-x-contain pb-1"
      >
        {rounds.map((round) => {
          const isSelected = round.id === selectedId;
          const opponent = round.opponentTeamId ? getJornadaTeam(round.opponentTeamId) : undefined;

          return (
            <button
              key={round.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              data-round-id={round.id}
              onClick={() => onSelect(round.id)}
              className={cn(cardBase, cardStateClass(isSelected, round.isCurrent))}
            >
              <span className="text-sm font-extrabold leading-none">{round.label}</span>

              <div className="flex h-10 w-10 items-center justify-center">
                {opponent ? (
                  <TeamCrest team={opponent} size="sm" className="transition group-hover:brightness-110" />
                ) : round.kind === "playoff" ? (
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border text-[10px] font-extrabold uppercase",
                      isSelected
                        ? "border-white/40 bg-white/15 text-white"
                        : "border-[#214C9B]/25 bg-white text-[#214C9B] group-hover:border-white/40 group-hover:bg-white/15 group-hover:text-white",
                    )}
                    aria-hidden
                  >
                    PO
                  </span>
                ) : (
                  <OpponentCrest
                    logo="?"
                    opponent="Por determinar"
                    size="sm"
                    className="opacity-60"
                  />
                )}
              </div>

              <span className="text-[10px] font-bold uppercase leading-tight tracking-wide opacity-90">
                {round.shortDate}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
