"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { DEFAULT_COMPETITION_SEASON_ID, type CompetitionSeasonId } from "@/data/mock";
import { fetchPublishedSeasons } from "@/lib/cms/seasons";
import { saveSeasonId } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type SeasonSelectorProps = {
  className?: string;
  /** Si es true, solo muestra la temporada 25/26 sin permitir cambiar. */
  singleSeason?: boolean;
};

type SeasonOption = {
  id: CompetitionSeasonId;
  label: string;
};

export function SeasonSelector({ className, singleSeason = false }: SeasonSelectorProps) {
  const [seasons, setSeasons] = useState<SeasonOption[]>([
    { id: DEFAULT_COMPETITION_SEASON_ID, label: "2025/26" },
  ]);
  const [seasonId, setSeasonId] = useState<CompetitionSeasonId>(DEFAULT_COMPETITION_SEASON_ID);

  useEffect(() => {
    void fetchPublishedSeasons().then((rows) => {
      if (!rows.length) return;
      setSeasons(
        rows.map((row) => ({
          id: row.id as CompetitionSeasonId,
          label: row.label,
        })),
      );
      const defaultSeason = rows.find((row) => row.isDefault) ?? rows[0];
      if (defaultSeason) {
        setSeasonId(defaultSeason.id as CompetitionSeasonId);
      }
    });
  }, []);

  const index = seasons.findIndex((season) => season.id === seasonId);
  const currentIndex = index >= 0 ? index : 0;
  const current = seasons[currentIndex] ?? seasons[0];

  const changeSeason = (nextIndex: number) => {
    const next = seasons[nextIndex];
    if (!next) return;
    setSeasonId(next.id);
    saveSeasonId(next.id);
  };

  if (singleSeason) {
    const locked = seasons.find((season) => season.id === DEFAULT_COMPETITION_SEASON_ID) ?? current;
    return (
      <div
        className={cn("inline-flex items-center justify-center rounded-xl border px-4 py-2.5", className)}
        aria-label="Temporada"
      >
        <span className="text-xs font-bold uppercase tracking-normal text-[#214C9B]">Temporada {locked.label}</span>
      </div>
    );
  }

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
        onClick={() => changeSeason(Math.min(seasons.length - 1, currentIndex + 1))}
        disabled={currentIndex === seasons.length - 1}
        className="rounded-full p-2 text-[#214C9B] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Temporada siguiente"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
