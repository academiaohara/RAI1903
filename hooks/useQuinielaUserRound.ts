"use client";

import { useEffect, useState } from "react";
import type { CompetitionSeasonId } from "@/data/mock";
import type { QuinielaUserRoundResult } from "@/lib/quiniela-ranking";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function useQuinielaUserRound(
  seasonId: CompetitionSeasonId,
  userId: string | null,
  round?: number,
) {
  const [data, setData] = useState<QuinielaUserRoundResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!userId || !isSupabaseConfigured()) {
        setData(null);
        setLoading(false);
        setError(userId && !isSupabaseConfigured() ? "Supabase no configurado" : null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ seasonId, userId });
        if (round !== undefined) {
          params.set("round", String(round));
        }
        const response = await fetch(`/api/quiniela/user-round?${params.toString()}`);
        const payload = (await response.json()) as QuinielaUserRoundResult & { error?: string };

        if (cancelled) return;

        if (!response.ok) {
          setData(null);
          setError(payload.error ?? "No se pudo cargar la quiniela");
          setLoading(false);
          return;
        }

        setData(payload);
        setLoading(false);
      } catch {
        if (cancelled) return;
        setData(null);
        setError("No se pudo cargar la quiniela");
        setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [seasonId, userId, round]);

  return { data, loading, error };
}
