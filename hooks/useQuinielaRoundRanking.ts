"use client";

import { useEffect, useState } from "react";
import type { CompetitionSeasonId } from "@/data/mock";
import {
  fetchQuinielaRoundRanking,
  fetchQuinielaSeasonRanking,
  type QuinielaRankingEntry,
  type QuinielaSeasonRankingEntry,
} from "@/lib/quiniela-ranking";
import { hasFirstMatchStarted } from "@/lib/quiniela";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Matchday } from "@/types";

export function useQuinielaRoundRanking(
  seasonId: CompetitionSeasonId,
  matchday: Matchday | undefined,
) {
  const [entries, setEntries] = useState<QuinielaRankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const round = matchday?.round;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!matchday) {
        setEntries([]);
        setLoading(false);
        return;
      }

      const countPoints = hasFirstMatchStarted(matchday);
      const rows = await fetchQuinielaRoundRanking(seasonId, matchday, countPoints);
      if (cancelled) return;
      setEntries(rows);
      setLoading(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [seasonId, round, matchday]);

  return { entries, loading, needsAuth: isSupabaseConfigured() };
}

export function useQuinielaSeasonRanking(
  seasonId: CompetitionSeasonId,
  matchdays: Matchday[],
) {
  const [entries, setEntries] = useState<QuinielaSeasonRankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const countPointsForRound = (round: number) => {
        const matchday = matchdays.find((md) => md.round === round);
        return matchday ? hasFirstMatchStarted(matchday) : false;
      };

      const rows = await fetchQuinielaSeasonRanking(seasonId, matchdays, countPointsForRound);
      if (cancelled) return;
      setEntries(rows);
      setLoading(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [seasonId, matchdays]);

  return { entries, loading, needsAuth: isSupabaseConfigured() };
}
