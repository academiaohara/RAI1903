"use client";

import { useMemo } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import { RAI_TEAM_ID } from "@/data/mock";
import { getCompetitionConfigBundle, leagueRoundCount } from "@/lib/cms/competition-config-bundle";
import { getTeamsBundle, mergeTeamsWithCms } from "@/lib/cms/teams-bundle";
import { useEditedMatchdays } from "@/hooks/useEditedMatchdays";
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
  const baseMatchdays = useMemo(
    () => getLeagueMatchdaysEnriched(fixtureSource, "masculino"),
    [fixtureSource],
  );
  const editedMatchdays = useEditedMatchdays(baseMatchdays, "masculino");
  const matchdays = useMemo(
    () => filterQuinielaMatchdays(editedMatchdays),
    [editedMatchdays],
  );
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
