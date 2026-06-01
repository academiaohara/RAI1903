"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import { getTeamCrestsBundle } from "@/lib/cms/team-crests-bundle";
import { setCmsTeamCrestMap } from "@/lib/team-crests";

const TeamCrestMapContext = createContext<Record<string, string>>({});

export function useTeamCrestMap(): Record<string, string> {
  return useContext(TeamCrestMapContext);
}

export function TeamCrestResolverProvider({ children }: { children: ReactNode }) {
  const { bundles } = useSeason();

  const crestMap = useMemo(() => getTeamCrestsBundle(bundles).crests, [bundles]);

  // Sync before children render so getTeamCrest() sees CMS paths on the same pass.
  setCmsTeamCrestMap(crestMap);

  return <TeamCrestMapContext.Provider value={crestMap}>{children}</TeamCrestMapContext.Provider>;
}
