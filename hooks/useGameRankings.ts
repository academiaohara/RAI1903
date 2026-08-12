"use client";

import { useEffect, useState } from "react";
import type { CompetitionSeasonId } from "@/data/mock";
import type { GameRankingEntry, GameSeasonRankingEntry } from "@/lib/game-rankings";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Matchday } from "@/types";

export function useQuinigolRoundRanking(
  seasonId: CompetitionSeasonId,
  matchday: Matchday | undefined,
) {
  const [entries, setEntries] = useState<GameRankingEntry[]>([]);
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
        const response = await fetch(`/api/quinigol/ranking?${params.toString()}`);
        const payload = (await response.json()) as {
          entries?: GameRankingEntry[];
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

export function useQuinigolSeasonRanking(seasonId: CompetitionSeasonId) {
  const [entries, setEntries] = useState<GameSeasonRankingEntry[]>([]);
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
        const response = await fetch(`/api/quinigol/ranking?${params.toString()}`);
        const payload = (await response.json()) as {
          entries?: GameSeasonRankingEntry[];
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

export function useClasificacionRanking(seasonId: CompetitionSeasonId) {
  const [entries, setEntries] = useState<GameRankingEntry[]>([]);
  const [countPoints, setCountPoints] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!isSupabaseConfigured()) {
        setEntries([]);
        setCountPoints(false);
        setLoading(false);
        setError("Supabase no configurado");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ seasonId });
        const response = await fetch(`/api/clasificacion/ranking?${params.toString()}`);
        const payload = (await response.json()) as {
          entries?: GameRankingEntry[];
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
