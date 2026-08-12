"use client";

import { useEffect, useState } from "react";
import type { CompetitionSeasonId } from "@/data/mock";
import type { QuinielaRankingEntry, QuinielaSeasonRankingEntry } from "@/lib/quiniela-ranking";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Matchday } from "@/types";

export function useQuinielaRoundRanking(
  seasonId: CompetitionSeasonId,
  matchday: Matchday | undefined,
) {
  const [entries, setEntries] = useState<QuinielaRankingEntry[]>([]);
  const [countPoints, setCountPoints] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const round = matchday?.round;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!matchday || !isSupabaseConfigured()) {
        setEntries([]);
        setCountPoints(false);
        setLoading(false);
        setError(isSupabaseConfigured() ? null : "Supabase no configurado");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          seasonId,
          scope: "round",
          round: String(round),
        });
        const response = await fetch(`/api/quiniela/ranking?${params.toString()}`);
        const payload = (await response.json()) as {
          entries?: QuinielaRankingEntry[];
          countPoints?: boolean;
          error?: string;
        };

        if (cancelled) return;

        if (!response.ok) {
          setEntries([]);
          setCountPoints(false);
          setError(payload.error ?? "No se pudo cargar el ranking");
          setLoading(false);
          return;
        }

        setEntries(payload.entries ?? []);
        setCountPoints(Boolean(payload.countPoints));
        setLoading(false);
      } catch {
        if (cancelled) return;
        setEntries([]);
        setCountPoints(false);
        setError("No se pudo cargar el ranking");
        setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [seasonId, round, matchday]);

  return { entries, loading, countPoints, error, needsAuth: isSupabaseConfigured() };
}

export function useQuinielaSeasonRanking(seasonId: CompetitionSeasonId) {
  const [entries, setEntries] = useState<QuinielaSeasonRankingEntry[]>([]);
  const [countPoints, setCountPoints] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!isSupabaseConfigured()) {
        setEntries([]);
        setLoading(false);
        setError("Supabase no configurado");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ seasonId, scope: "season" });
        const response = await fetch(`/api/quiniela/ranking?${params.toString()}`);
        const payload = (await response.json()) as {
          entries?: QuinielaSeasonRankingEntry[];
          countPoints?: boolean;
          error?: string;
        };

        if (cancelled) return;

        if (!response.ok) {
          setEntries([]);
          setCountPoints(false);
          setError(payload.error ?? "No se pudo cargar el ranking");
          setLoading(false);
          return;
        }

        setEntries(payload.entries ?? []);
        setCountPoints(Boolean(payload.countPoints));
        setLoading(false);
      } catch {
        if (cancelled) return;
        setEntries([]);
        setCountPoints(false);
        setError("No se pudo cargar el ranking");
        setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [seasonId]);

  return { entries, loading, countPoints, error, needsAuth: isSupabaseConfigured() };
}
