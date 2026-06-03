"use client";

import { OpponentCrest } from "@/components/OpponentCrest";
import { TeamCrest } from "@/components/TeamCrest";
import { EditableText } from "@/components/inline-editing/EditableText";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { getJornadaTeam } from "@/lib/jornadas-data";
import { getTeamCrestById } from "@/lib/team-crests";
import { scrollElementHorizontally } from "@/lib/scroll-horizontal";
import { cn } from "@/lib/utils";
import type { JornadaRoundId, JornadaRoundSummary } from "@/types/jornadas";
import { useEffect, useRef, type WheelEvent } from "react";

type JornadaRoundCarouselProps = {
  rounds: JornadaRoundSummary[];
  selectedId: JornadaRoundId;
  onSelect: (roundId: JornadaRoundId) => void;
  showCrests?: boolean;
};

function cardBaseClass(showCrests: boolean): string {
  if (showCrests) {
    return "group flex h-[7.25rem] w-[4.75rem] shrink-0 flex-col items-center justify-between rounded-2xl border px-2 py-2.5 text-center transition sm:h-[7.75rem] sm:w-[5.25rem]";
  }
  return "group flex h-auto w-[4.25rem] shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 py-3 text-center transition sm:w-[4.75rem]";
}

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

export function JornadaRoundCarousel({ rounds, selectedId, onSelect, showCrests = true }: JornadaRoundCarouselProps) {
  const { editMode, getValue } = useInlineEditing();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const selected = list.querySelector<HTMLButtonElement>(`[data-round-id="${selectedId}"]`);
    if (selected) {
      scrollElementHorizontally(list, selected, { behavior: "smooth", align: "center" });
    }
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
          const label = getValue(`jornada-round:${round.id}:label`, round.label);
          const shortDate = getValue(`jornada-round:${round.id}:short-date`, round.shortDate);
          const isSelected = round.id === selectedId;
          const opponent =
            round.opponentTeamId && round.opponentName
              ? getJornadaTeam(round.opponentTeamId)
              : undefined;
          const opponentLabel = round.opponentName ?? round.opponentTeamId ?? "Por determinar";
          const opponentInitials = opponentLabel
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part[0]?.toUpperCase() ?? "")
            .join("")
            .slice(0, 3);

          return (
            <button
              key={round.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              data-round-id={round.id}
              onClick={() => onSelect(round.id)}
              className={cn(cardBaseClass(showCrests), cardStateClass(isSelected, round.isCurrent))}
            >
              {editMode ? (
                <EditableText
                  storageKey={`jornada-round:${round.id}:label`}
                  value={label}
                  aria-label={`Editar nombre de ${round.label}`}
                  className="max-w-full text-sm font-extrabold leading-tight"
                  inputClassName="px-1 py-0.5 text-center text-sm font-extrabold leading-tight"
                />
              ) : (
                <span className="max-w-full text-sm font-extrabold leading-tight">{label}</span>
              )}

              {showCrests ? (
                <div className="flex h-12 w-12 items-center justify-center">
                  {opponent ? (
                    <TeamCrest team={opponent} size="md" className="transition group-hover:brightness-110" />
                  ) : round.opponentTeamId ? (
                    <OpponentCrest
                      logo={getTeamCrestById(round.opponentTeamId, opponentInitials || "EQP")}
                      opponent={opponentLabel}
                      size="md"
                      className="transition group-hover:brightness-110"
                    />
                  ) : (
                    <OpponentCrest
                      logo="?"
                      opponent="Por determinar"
                      size="md"
                      className="opacity-60"
                    />
                  )}
                </div>
              ) : null}

              {editMode ? (
                <EditableText
                  storageKey={`jornada-round:${round.id}:short-date`}
                  value={shortDate}
                  aria-label={`Editar fecha corta de ${label}`}
                  className="text-[10px] font-bold uppercase leading-tight tracking-wide opacity-90"
                  inputClassName="px-1 py-0.5 text-[10px] font-bold uppercase leading-tight"
                />
              ) : (
                <span className="text-[10px] font-bold uppercase leading-tight tracking-wide opacity-90">
                  {shortDate}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
