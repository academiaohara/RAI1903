"use client";

import { useEffect, useMemo, useState } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import { useTeamCrestMap } from "@/components/assets/TeamCrestResolverProvider";
import { useSeasonMatchArticles } from "@/hooks/useSeasonMatchArticles";
import { getCalendarMatchesFromSource } from "@/lib/calendar";
import { fetchSeasonBundles } from "@/lib/cms/season-bundles";
import type { CmsSeason } from "@/lib/cms/seasons";
import { getAvilesMatchesFromSource } from "@/lib/season/aviles-matches";
import { enrichFixtureSource } from "@/lib/season/enriched-fixtures";
import { fixtureSourceFromBundles } from "@/lib/season/fixture-source";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { CalendarMatch } from "@/types";

function publishedSeasonList(seasons: CmsSeason[]) {
  const published = seasons.filter((row) => row.published);
  return published.length ? published : seasons;
}

function mergeCalendarMatchesFromBundles(
  maps: Awaited<ReturnType<typeof fetchSeasonBundles>>[],
  gender: PrimerEquipoGender,
  articles: {
    getCronica: ReturnType<typeof useSeasonMatchArticles>["getCronica"];
    getPrevia: ReturnType<typeof useSeasonMatchArticles>["getPrevia"];
    crestMap: Record<string, string>;
  },
): CalendarMatch[] {
  const byId = new Map<string, CalendarMatch>();
  for (const map of maps) {
    const source = enrichFixtureSource(fixtureSourceFromBundles(map, gender), map, gender);
    const aviles = getAvilesMatchesFromSource(source, gender);
    const rows = getCalendarMatchesFromSource(aviles, gender, articles);
    for (const row of rows) {
      byId.set(row.id, row);
    }
  }
  return [...byId.values()].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function useAllSeasonsCalendarMatches(gender: PrimerEquipoGender) {
  const { seasons, bundles, getEnrichedFixtureSource } = useSeason();
  const crestMap = useTeamCrestMap();
  const { getCronica, getPrevia } = useSeasonMatchArticles();
  const [multiSeasonMatches, setMultiSeasonMatches] = useState<CalendarMatch[]>([]);
  const [fetchedSeasonIdsKey, setFetchedSeasonIdsKey] = useState<string | null>(null);

  const publishedList = useMemo(() => publishedSeasonList(seasons), [seasons]);
  const needsMultiSeasonFetch = publishedList.length > 1;
  const seasonIdsKey = useMemo(() => publishedList.map((row) => row.id).join(","), [publishedList]);

  const seasonMatches = useMemo(() => {
    const source = getEnrichedFixtureSource(gender);
    const aviles = getAvilesMatchesFromSource(source, gender);
    return getCalendarMatchesFromSource(aviles, gender, { getCronica, getPrevia, crestMap });
  }, [gender, getCronica, getEnrichedFixtureSource, getPrevia, crestMap]);

  useEffect(() => {
    if (!needsMultiSeasonFetch) return;

    let cancelled = false;
    void Promise.all(publishedList.map((row) => fetchSeasonBundles(row.id))).then((maps) => {
      if (cancelled) return;
      setMultiSeasonMatches(mergeCalendarMatchesFromBundles(maps, gender, { getCronica, getPrevia, crestMap }));
      setFetchedSeasonIdsKey(seasonIdsKey);
    });

    return () => {
      cancelled = true;
    };
  }, [needsMultiSeasonFetch, publishedList, seasonIdsKey, gender, getCronica, getPrevia, crestMap, bundles]);

  const allMatches = needsMultiSeasonFetch ? multiSeasonMatches : seasonMatches;
  const loading = needsMultiSeasonFetch && fetchedSeasonIdsKey !== seasonIdsKey;

  return { allMatches, seasonMatches, loading };
}
