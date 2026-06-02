"use client";

import { createContext, useContext, useMemo } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import type { CanteraCmsScope } from "@/lib/cantera/cantera-cms";
import { resolveCanteraSeasonData, type CanteraSeasonData } from "@/lib/cantera/cantera-season-data";

const CanteraSeasonContext = createContext<CanteraSeasonData | null>(null);

export function CanteraSeasonProvider({
  scope,
  children,
}: {
  scope: CanteraCmsScope;
  children: React.ReactNode;
}) {
  const { bundles, viewedSeason } = useSeason();
  const data = useMemo(
    () => resolveCanteraSeasonData(scope, bundles, viewedSeason.label),
    [scope, bundles, viewedSeason.label],
  );

  return <CanteraSeasonContext.Provider value={data}>{children}</CanteraSeasonContext.Provider>;
}

export function useCanteraSeason(): CanteraSeasonData {
  const context = useContext(CanteraSeasonContext);
  if (!context) {
    throw new Error("useCanteraSeason debe usarse dentro de CanteraSeasonProvider");
  }
  return context;
}

export function useCanteraSeasonOptional(): CanteraSeasonData | null {
  return useContext(CanteraSeasonContext);
}

/** @deprecated Usa CanteraSeasonProvider con scope="filial". */
export function FilialSeasonProvider({ children }: { children: React.ReactNode }) {
  return <CanteraSeasonProvider scope="filial">{children}</CanteraSeasonProvider>;
}

/** @deprecated Usa useCanteraSeason(). */
export function useFilialSeason(): CanteraSeasonData {
  return useCanteraSeason();
}

/** @deprecated Usa useCanteraSeasonOptional(). */
export function useFilialSeasonOptional(): CanteraSeasonData | null {
  return useCanteraSeasonOptional();
}
