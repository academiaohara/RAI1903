"use client";

import { useMemo } from "react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useSeason } from "@/components/season/SeasonProvider";
import { useTeamCrestMap } from "@/components/assets/TeamCrestResolverProvider";
import { useSeasonMatchArticles } from "@/hooks/useSeasonMatchArticles";
import { getCalendarMatchesFromSource } from "@/lib/calendar";
import { getTeamsBundle, resolveFixtureTeamDisplayName } from "@/lib/cms/teams-bundle";
import { applyMatchInlineOverride } from "@/lib/fixture-overrides";
import { resolveClubTeamIds } from "@/lib/season/club-team-ids";
import { getAvilesMatchesFromSource } from "@/lib/season/aviles-matches";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

export function useAllSeasonsCalendarMatches(gender: PrimerEquipoGender) {
  const { bundles, getEnrichedFixtureSource } = useSeason();
  const cmsTeams = useMemo(() => getTeamsBundle(bundles, gender)?.teams ?? [], [bundles, gender]);
  const resolveTeamName = useMemo(
    () => (teamId: string, fallback: string) =>
      resolveFixtureTeamDisplayName(teamId, fallback, cmsTeams, bundles, gender),
    [bundles, cmsTeams, gender],
  );
  const { getOverride } = useInlineEditing();
  const crestMap = useTeamCrestMap();
  const { getForMatch } = useSeasonMatchArticles();

  const mapMatch = useMemo(
    () => (match: ReturnType<typeof getAvilesMatchesFromSource>[number]) =>
      applyMatchInlineOverride(match, getOverride, gender, resolveTeamName),
    [getOverride, gender, resolveTeamName],
  );

  const clubTeamIds = useMemo(() => resolveClubTeamIds(bundles, gender), [bundles, gender]);

  const seasonMatches = useMemo(() => {
    const source = getEnrichedFixtureSource(gender);
    const aviles = getAvilesMatchesFromSource(source, gender, { mapMatch, clubTeamIds });
    return getCalendarMatchesFromSource(aviles, gender, {
      getForMatch,
      crestMap,
      resolveTeamName,
    });
  }, [gender, getForMatch, getEnrichedFixtureSource, crestMap, mapMatch, resolveTeamName, clubTeamIds]);

  return { allMatches: seasonMatches, seasonMatches, loading: false };
}
