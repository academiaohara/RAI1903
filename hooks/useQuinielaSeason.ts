"use client";

import { useMemo } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import { RAI_TEAM_ID } from "@/data/mock";
import { getTeamsBundle, mergeTeamsWithCms } from "@/lib/cms/teams-bundle";
import { filterQuinielaMatchdays } from "@/lib/quiniela";
import { getLeagueMatchdaysEnriched } from "@/lib/season/enriched-fixtures";
import { getTeamsForRfefGrupo } from "@/lib/rfef-grupos";
import { getLastPlayedLeagueRound } from "@/lib/standings";
import type { CompetitionSeasonId } from "@/data/mock";
import type { Matchday, Team } from "@/types";

/** Partidos de liga del Grupo I (donde juega el Real Avilés) para la quiniela. */
export function useQuinielaSeason() {
  const { getEnrichedFixtureSource, viewedSeasonId, bundles, bundlesLoading } = useSeason();
  const fixtureSource = useMemo(() => getEnrichedFixtureSource("masculino"), [getEnrichedFixtureSource]);
  const matchdays = useMemo(() => {
    const league = getLeagueMatchdaysEnriched(fixtureSource, "masculino");
    return filterQuinielaMatchdays(league);
  }, [fixtureSource]);
  const teams = useMemo(() => {
    const base = getTeamsForRfefGrupo("1");
    return mergeTeamsWithCms(base, getTeamsBundle(bundles, "masculino"));
  }, [bundles]);
  const currentRound = useMemo(() => getLastPlayedLeagueRound(matchdays), [matchdays]);

  return {
    matchdays,
    teams,
    currentRound,
    seasonId: viewedSeasonId as CompetitionSeasonId,
    highlightTeamId: RAI_TEAM_ID,
    bundlesLoading,
  };
}

export type QuinielaSeason = {
  matchdays: Matchday[];
  teams: Team[];
  currentRound: number;
  seasonId: CompetitionSeasonId;
  highlightTeamId: string;
  bundlesLoading: boolean;
};
