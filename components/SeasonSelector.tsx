"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CompetitionSeasonId } from "@/data/mock";
import { useSeason } from "@/components/season/SeasonProvider";
import { cn } from "@/lib/utils";

type SeasonSelectorProps = {
  className?: string;
};

export function SeasonSelector({ className }: SeasonSelectorProps) {
  const { seasons, viewedSeasonId, setViewedSeasonId, isViewingArchive, activeSeasonId } = useSeason();

  const published = seasons.filter((row) => row.published);
  const list = published.length ? published : seasons;

  const currentIndex = Math.max(
    0,
    list.findIndex((season) => season.id === viewedSeasonId),
  );
  const current = list[currentIndex] ?? list[0];

  const changeSeason = (nextIndex: number) => {
    const next = list[nextIndex];
    if (!next) return;
    setViewedSeasonId(next.id as CompetitionSeasonId);
  };

  if (!current) return null;

  return (
    <div className="flex flex-col items-end gap-1">
      <div
        className={cn("inline-flex items-center gap-0.5 rounded-xl border p-1", className)}
        role="group"
        aria-label="Temporada"
      >
        <button
          type="button"
          onClick={() => changeSeason(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="rounded-full p-2 text-[#214C9B] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Temporada anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="min-w-[7.5rem] px-2 text-center text-xs font-bold uppercase tracking-normal text-[#214C9B]">
          Temporada {current.label}
        </span>
        <button
          type="button"
          onClick={() => changeSeason(Math.min(list.length - 1, currentIndex + 1))}
          disabled={currentIndex === list.length - 1}
          className="rounded-full p-2 text-[#214C9B] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Temporada siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      {isViewingArchive && (
        <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700">
          Archivo · activa {list.find((row) => row.id === activeSeasonId)?.label ?? activeSeasonId}
        </span>
      )}
    </div>
  );
}
