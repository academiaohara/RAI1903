"use client";

import { createContext, useContext, useMemo } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import { resolveFilialSeasonData, type FilialSeasonData } from "@/lib/cantera/filial-season-data";

const FilialSeasonContext = createContext<FilialSeasonData | null>(null);

export function FilialSeasonProvider({ children }: { children: React.ReactNode }) {
  const { bundles, viewedSeason } = useSeason();
  const data = useMemo(
    () => resolveFilialSeasonData(bundles, viewedSeason.label),
    [bundles, viewedSeason.label],
  );

  return <FilialSeasonContext.Provider value={data}>{children}</FilialSeasonContext.Provider>;
}

export function useFilialSeason(): FilialSeasonData {
  const context = useContext(FilialSeasonContext);
  if (!context) {
    throw new Error("useFilialSeason debe usarse dentro de FilialSeasonProvider");
  }
  return context;
}

export function useFilialSeasonOptional(): FilialSeasonData | null {
  return useContext(FilialSeasonContext);
}
