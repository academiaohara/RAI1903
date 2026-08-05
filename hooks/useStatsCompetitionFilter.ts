"use client";

import { useCallback, useState } from "react";
import {
  DEFAULT_STATS_COMPETITION_FILTER,
  type StatsCompetitionFilter,
} from "@/lib/competition/stats-filters";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

function storageKey(gender: PrimerEquipoGender, seasonId: string) {
  return `stats-competition-filter:${gender}:${seasonId}`;
}

function readStoredFilter(gender: PrimerEquipoGender, seasonId: string): StatsCompetitionFilter {
  try {
    const stored = localStorage.getItem(storageKey(gender, seasonId));
    if (
      stored === "liga" ||
      stored === "copa-rey" ||
      stored === "amistoso" ||
      stored === "todos"
    ) {
      return stored;
    }
  } catch {
    // ignore quota / private mode
  }
  return DEFAULT_STATS_COMPETITION_FILTER;
}

export function useStatsCompetitionFilter(gender: PrimerEquipoGender, seasonId: string) {
  const scopeKey = `${gender}:${seasonId}`;
  const [scopeFilter, setScopeFilter] = useState<{ key: string; value: StatsCompetitionFilter }>(() => ({
    key: scopeKey,
    value: readStoredFilter(gender, seasonId),
  }));

  const filter =
    scopeFilter.key === scopeKey ? scopeFilter.value : readStoredFilter(gender, seasonId);

  const setFilter = useCallback(
    (value: StatsCompetitionFilter) => {
      setScopeFilter({ key: scopeKey, value });
      try {
        localStorage.setItem(storageKey(gender, seasonId), value);
      } catch {
        // ignore quota / private mode
      }
    },
    [gender, seasonId, scopeKey],
  );

  return { filter, setFilter };
}
