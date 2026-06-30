"use client";

import { useMemo } from "react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useSeason } from "@/components/season/SeasonProvider";
import { useTeamCrestMap } from "@/components/assets/TeamCrestResolverProvider";
import { useSeasonMatchArticles } from "@/hooks/useSeasonMatchArticles";
import { getCalendarMatchesFromSource } from "@/lib/calendar";
import { getTeamsBundle, resolveFixtureTeamDisplayName } from "@/lib/cms/teams-bundle";
import { applyMatchInlineOverride } from "@/lib/fixture-overrides";
import { enrichMatchVenue } from "@/lib/match-venue";
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
    () => (match: ReturnType<typeof getAvilesMatchesFromSource>[number]) => {
      const withVenue = enrichMatchVenue(match, gender, { bundles });
      return applyMatchInlineOverride(withVenue, getOverride, gender, resolveTeamName);
    },
    [bundles, getOverride, gender, resolveTeamName],
  );

  const clubTeamIds = useMemo(() => {
    const ids = new Set([
      ...resolveClubTeamIds(bundles, gender, "1"),
      ...resolveClubTeamIds(bundles, gender, "2"),
    ]);
    return [...ids];
  }, [bundles, gender]);

  const seasonMatches = useMemo(() => {
    const source = getEnrichedFixtureSource(gender);
    const aviles = getAvilesMatchesFromSource(source, gender, { mapMatch, clubTeamIds });
    return getCalendarMatchesFromSource(aviles, gender, {
      getForMatch,
      crestMap,
      resolveTeamName,
      venueOptions: { bundles },
    });
  }, [bundles, gender, getForMatch, getEnrichedFixtureSource, crestMap, mapMatch, resolveTeamName, clubTeamIds]);

  return { allMatches: seasonMatches, seasonMatches, loading: false };
}
