"use client";

import { useEffect, useMemo, useState } from "react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useSeason } from "@/components/season/SeasonProvider";
import { useTeamCrestMap } from "@/components/assets/TeamCrestResolverProvider";
import { useSeasonMatchArticles } from "@/hooks/useSeasonMatchArticles";
import { getCalendarMatchesFromSource } from "@/lib/calendar";
import { getTeamsBundle, resolveFixtureTeamDisplayName } from "@/lib/cms/teams-bundle";
import { fetchSeasonBundles } from "@/lib/cms/season-bundles";
import type { CmsSeason } from "@/lib/cms/seasons";
import { applyMatchInlineOverride } from "@/lib/fixture-overrides";
import { getAvilesMatchesFromSource } from "@/lib/season/aviles-matches";
import { enrichFixtureSource } from "@/lib/season/enriched-fixtures";
import { fixtureSourceFromBundles } from "@/lib/season/fixture-source";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { CalendarMatch, Match } from "@/types";

function publishedSeasonList(seasons: CmsSeason[]) {
  const published = seasons.filter((row) => row.published);
  return published.length ? published : seasons;
}

function mergeCalendarMatchesFromBundles(
  maps: Awaited<ReturnType<typeof fetchSeasonBundles>>[],
  gender: PrimerEquipoGender,
  articles: {
    getForMatch: ReturnType<typeof useSeasonMatchArticles>["getForMatch"];
    crestMap: Record<string, string>;
  },
  mapMatch?: (match: Match) => Match,
): CalendarMatch[] {
  const byId = new Map<string, CalendarMatch>();
  for (const map of maps) {
    const cmsTeams = getTeamsBundle(map, gender)?.teams ?? [];
    const resolveTeamName = (teamId: string, fallback: string) =>
      resolveFixtureTeamDisplayName(teamId, fallback, cmsTeams, map, gender);
    const source = enrichFixtureSource(fixtureSourceFromBundles(map, gender), map, gender);
    const aviles = getAvilesMatchesFromSource(source, gender, { mapMatch });
    const rows = getCalendarMatchesFromSource(aviles, gender, { ...articles, resolveTeamName });
    for (const row of rows) {
      byId.set(row.id, row);
    }
  }
  return [...byId.values()].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function useAllSeasonsCalendarMatches(gender: PrimerEquipoGender) {
  const { seasons, bundles, getEnrichedFixtureSource } = useSeason();
  const cmsTeams = useMemo(() => getTeamsBundle(bundles, gender)?.teams ?? [], [bundles, gender]);
  const resolveTeamName = useMemo(
    () => (teamId: string, fallback: string) =>
      resolveFixtureTeamDisplayName(teamId, fallback, cmsTeams, bundles, gender),
    [bundles, cmsTeams, gender],
  );
  const { getOverride } = useInlineEditing();
  const crestMap = useTeamCrestMap();
  const { getForMatch } = useSeasonMatchArticles();
  const [multiSeasonMatches, setMultiSeasonMatches] = useState<CalendarMatch[]>([]);
  const [fetchedSeasonIdsKey, setFetchedSeasonIdsKey] = useState<string | null>(null);

  const publishedList = useMemo(() => publishedSeasonList(seasons), [seasons]);
  const needsMultiSeasonFetch = publishedList.length > 1;
  const seasonIdsKey = useMemo(() => publishedList.map((row) => row.id).join(","), [publishedList]);

  const mapMatch = useMemo(
    () => (match: Match) => applyMatchInlineOverride(match, getOverride, gender, resolveTeamName),
    [getOverride, gender, resolveTeamName],
  );

  const seasonMatches = useMemo(() => {
    const source = getEnrichedFixtureSource(gender);
    const aviles = getAvilesMatchesFromSource(source, gender, { mapMatch });
    return getCalendarMatchesFromSource(aviles, gender, {
      getForMatch,
      crestMap,
      resolveTeamName,
    });
  }, [gender, getForMatch, getEnrichedFixtureSource, crestMap, mapMatch, resolveTeamName]);

  useEffect(() => {
    if (!needsMultiSeasonFetch) return;

    let cancelled = false;
    void Promise.all(publishedList.map((row) => fetchSeasonBundles(row.id))).then((maps) => {
      if (cancelled) return;
      setMultiSeasonMatches(mergeCalendarMatchesFromBundles(maps, gender, { getForMatch, crestMap }, mapMatch));
      setFetchedSeasonIdsKey(seasonIdsKey);
    });

    return () => {
      cancelled = true;
    };
  }, [
    needsMultiSeasonFetch,
    publishedList,
    seasonIdsKey,
    gender,
    getForMatch,
    crestMap,
    mapMatch,
  ]);

  const allMatches = needsMultiSeasonFetch ? multiSeasonMatches : seasonMatches;
  const loading = needsMultiSeasonFetch && fetchedSeasonIdsKey !== seasonIdsKey;

  return { allMatches, seasonMatches, loading };
}
