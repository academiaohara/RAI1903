"use client";

import { useEffect, useState } from "react";
import type { CompetitionSeasonId } from "@/data/mock";
import type { ClasificacionUserSubmissionResult } from "@/lib/game-rankings";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export function useClasificacionUserSubmission(seasonId: CompetitionSeasonId, userId: string | null) {
  const [data, setData] = useState<ClasificacionUserSubmissionResult | null>(null);
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
        const response = await fetch(`/api/clasificacion/user-submission?${params.toString()}`);
        const payload = (await response.json()) as ClasificacionUserSubmissionResult & { error?: string };

        if (cancelled) return;

        if (!response.ok) {
          setData(null);
          setError(payload.error ?? "No se pudo cargar la predicción");
          setLoading(false);
          return;
        }

        setData(payload);
        setLoading(false);
      } catch {
        if (cancelled) return;
        setData(null);
        setError("No se pudo cargar la predicción");
        setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [seasonId, userId]);

  return { data, loading, error };
}
