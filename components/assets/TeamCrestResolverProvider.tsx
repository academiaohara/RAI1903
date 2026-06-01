"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import { getTeamCrestsBundle } from "@/lib/cms/team-crests-bundle";
import { setCmsTeamCrestMap } from "@/lib/team-crests";

export function TeamCrestResolverProvider({ children }: { children: ReactNode }) {
  const { bundles } = useSeason();

  const crestMap = useMemo(() => getTeamCrestsBundle(bundles).crests, [bundles]);

  useEffect(() => {
    setCmsTeamCrestMap(crestMap);
  }, [crestMap]);

  return children;
}
