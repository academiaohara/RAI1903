"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchSeasonPlayerRatingAverages,
  type PlayerRatingAverage,
} from "@/lib/match-ratings-storage";

export function useSeasonPlayerRatings() {
  const [averages, setAverages] = useState<Record<string, PlayerRatingAverage>>({});
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const next = await fetchSeasonPlayerRatingAverages();
    setAverages(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void fetchSeasonPlayerRatingAverages().then((next) => {
      if (cancelled) return;
      setAverages(next);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { averages, loading, reload };
}
