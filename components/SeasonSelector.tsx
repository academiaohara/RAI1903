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

  const compactLabel = (label: string) => {
    const match = label.match(/(?:\d{2})?(\d{2})\D+(\d{2})$/);
    return match ? `${match[1]}/${match[2]}` : label.replace(/^temporada\s+/i, "");
  };

  return (
    <div className="flex min-w-0 flex-col items-end gap-1">
      <label className="sr-only" htmlFor="season-select-mobile">
        Temporada
      </label>
      <select
        id="season-select-mobile"
        value={viewedSeasonId}
        onChange={(event) => setViewedSeasonId(event.target.value as CompetitionSeasonId)}
        className={cn(
          "w-auto max-w-full rounded-lg border bg-white px-2 py-1.5 text-[11px] font-extrabold uppercase tracking-normal text-[#214C9B] outline-none focus:border-[#214C9B] focus:ring-1 focus:ring-[#214C9B]/30 sm:hidden",
          className,
        )}
        aria-label="Seleccionar temporada"
      >
        {list.map((season) => (
          <option key={season.id} value={season.id}>
            {compactLabel(season.label)}
          </option>
        ))}
      </select>

      <div
        className={cn("hidden items-center gap-0.5 rounded-xl border p-1 sm:inline-flex", className)}
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
