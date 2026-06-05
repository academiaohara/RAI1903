"use client";

import { useCallback, useEffect, useState } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import {
  fetchSeasonPlayerRatingAverages,
  type PlayerRatingAverage,
} from "@/lib/match-ratings-storage";

export function useSeasonPlayerRatings() {
  const { viewedSeasonId } = useSeason();
  const [averages, setAverages] = useState<Record<string, PlayerRatingAverage>>({});
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const next = await fetchSeasonPlayerRatingAverages(viewedSeasonId);
    setAverages(next);
    setLoading(false);
  }, [viewedSeasonId]);

  useEffect(() => {
    let cancelled = false;

    void fetchSeasonPlayerRatingAverages(viewedSeasonId).then((next) => {
      if (cancelled) return;
      setAverages(next);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [viewedSeasonId]);

  return { averages, loading, reload };
}
