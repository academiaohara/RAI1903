"use client";

import { useEffect, useState } from "react";
import type { CompetitionSeasonId } from "@/data/mock";
import { useSeason } from "@/components/season/SeasonProvider";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

export function useMatchRatingsSeasonId(matchId: string, gender: PrimerEquipoGender) {
  const { resolveSeasonIdForMatch, viewedSeasonId } = useSeason();
  const [seasonId, setSeasonId] = useState<CompetitionSeasonId>(viewedSeasonId);
  const [resolving, setResolving] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void resolveSeasonIdForMatch(matchId, gender).then((resolved) => {
      if (cancelled) return;
      setSeasonId(resolved);
      setResolving(false);
    });

    return () => {
      cancelled = true;
    };
  }, [gender, matchId, resolveSeasonIdForMatch]);

  return { seasonId, resolving };
}
