"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { competitionSeasons, DEFAULT_COMPETITION_SEASON_ID, type CompetitionSeasonId } from "@/data/mock";
import { saveSeasonId } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function SeasonSelector({ className }: { className?: string }) {
  const [seasonId, setSeasonId] = useState<CompetitionSeasonId>(DEFAULT_COMPETITION_SEASON_ID);

  const index = competitionSeasons.findIndex((season) => season.id === seasonId);
  const currentIndex = index >= 0 ? index : competitionSeasons.findIndex((season) => season.id === DEFAULT_COMPETITION_SEASON_ID);
  const current = competitionSeasons[currentIndex] ?? competitionSeasons[1];

  const changeSeason = (nextIndex: number) => {
    const next = competitionSeasons[nextIndex];
    if (!next) return;
    setSeasonId(next.id);
    saveSeasonId(next.id);
  };

  return (
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
        onClick={() => changeSeason(Math.min(competitionSeasons.length - 1, currentIndex + 1))}
        disabled={currentIndex === competitionSeasons.length - 1}
        className="rounded-full p-2 text-[#214C9B] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Temporada siguiente"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
