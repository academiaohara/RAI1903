"use client";

import { useMemo } from "react";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useSeason } from "@/components/season/SeasonProvider";
import { RAI_TEAM_ID } from "@/data/mock";
import { getCompetitionConfigBundle, leagueRoundCount } from "@/lib/cms/competition-config-bundle";
import { getTeamsBundle, mergeTeamsWithCms } from "@/lib/cms/teams-bundle";
import { applyMatchdayOverrides } from "@/lib/fixture-overrides";
import { filterQuinielaMatchdays } from "@/lib/quiniela";
import { getLeagueMatchdaysEnriched } from "@/lib/season/enriched-fixtures";
import { getTeamsForRfefGrupo } from "@/lib/rfef-grupos";
import { getLastPlayedLeagueRound } from "@/lib/standings";
import type { CompetitionSeasonId } from "@/data/mock";
import type { Matchday, Team } from "@/types";

/** Partidos de liga del Grupo I (donde juega el Real Avilés) para la quiniela. */
export function useQuinielaSeason() {
  const { getEnrichedFixtureSource, viewedSeasonId, bundles, bundlesLoading } = useSeason();
  const { getOverride } = useInlineEditing();
  const fixtureSource = useMemo(() => getEnrichedFixtureSource("masculino"), [getEnrichedFixtureSource]);
  const matchdays = useMemo(() => {
    const league = getLeagueMatchdaysEnriched(fixtureSource, "masculino");
    const withOverrides = applyMatchdayOverrides(league, getOverride, "masculino");
    return filterQuinielaMatchdays(withOverrides);
  }, [fixtureSource, getOverride]);
  const teams = useMemo(() => {
    const base = getTeamsForRfefGrupo("1");
    return mergeTeamsWithCms(base, getTeamsBundle(bundles, "masculino"));
  }, [bundles]);
  const totalRounds = useMemo(() => {
    const config = getCompetitionConfigBundle(bundles, "masculino");
    if (config) return leagueRoundCount(config.teamsPerGroup);
    if (matchdays.length > 0) return Math.max(...matchdays.map((md) => md.round));
    return 38;
  }, [bundles, matchdays]);
  const currentRound = useMemo(() => {
    const lastPlayed = getLastPlayedLeagueRound(matchdays);
    if (matchdays.length === 0) return 1;
    const hasCurrent = matchdays.some((md) => md.round === lastPlayed);
    if (hasCurrent) return lastPlayed;
    return matchdays[0]?.round ?? 1;
  }, [matchdays]);

  return {
    matchdays,
    teams,
    currentRound,
    totalRounds,
    seasonId: viewedSeasonId as CompetitionSeasonId,
    highlightTeamId: RAI_TEAM_ID,
    bundlesLoading,
  };
}

export type QuinielaSeason = {
  matchdays: Matchday[];
  teams: Team[];
  currentRound: number;
  totalRounds: number;
  seasonId: CompetitionSeasonId;
  highlightTeamId: string;
  bundlesLoading: boolean;
};
