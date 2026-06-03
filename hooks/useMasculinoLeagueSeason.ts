"use client";

import { useMemo } from "react";
import { useSeason, type SeasonDataScope } from "@/components/season/SeasonProvider";
import {
  zonesToLegacyConfig,
  type SeasonCompetitionConfigBundle,
} from "@/lib/cms/competition-config-bundle";
import { resolveGroupTeams } from "@/lib/cms/group-teams";
import { RAI_TEAM_ID } from "@/data/mock";
import { useEditedMatchdays, useEditedMatches } from "@/hooks/useEditedMatchdays";
import {
  getAvilesMatchesFromSource,
  getLeagueMatchdaysForGender,
} from "@/lib/season/aviles-matches";
import { getLastPlayedLeagueRound } from "@/lib/standings";
import { isMatchPlayed } from "@/lib/match-result";
import type { StandingsZonesConfig } from "@/lib/standings";
import type { Match, Matchday, Team } from "@/types";

export function useMasculinoLeagueSeason(seasonScope: SeasonDataScope = "viewed") {
  const { getEnrichedFixtureSource, getBundles, getCompetitionConfig, isBundlesLoading, resolveSeasonId } =
    useSeason();
  const seasonId = resolveSeasonId(seasonScope);
  const bundles = useMemo(() => getBundles(seasonId), [getBundles, seasonId]);
  const fixtureSource = useMemo(
    () => getEnrichedFixtureSource("masculino", seasonScope),
    [getEnrichedFixtureSource, seasonScope],
  );
  const competitionConfig = useMemo(
    () => getCompetitionConfig("masculino", seasonScope),
    [getCompetitionConfig, seasonScope],
  );
  const standingsZones = useMemo(
    () => zonesToLegacyConfig(competitionConfig.zones),
    [competitionConfig.zones],
  );
  const bundlesLoading = isBundlesLoading(seasonId);
  const baseLeagueMatchdays = useMemo(
    () => getLeagueMatchdaysForGender(fixtureSource, "masculino"),
    [fixtureSource],
  );
  const editedLeagueMatchdays = useEditedMatchdays(baseLeagueMatchdays, "masculino");
  const teams = useMemo(() => resolveGroupTeams(bundles, "masculino", "1"), [bundles]);
  const baseAvilesMatches = useMemo(
    () => getAvilesMatchesFromSource(fixtureSource, "masculino"),
    [fixtureSource],
  );
  const avilesMatches = useEditedMatches(baseAvilesMatches, "masculino");
  const currentRound = useMemo(
    () => getLastPlayedLeagueRound(editedLeagueMatchdays),
    [editedLeagueMatchdays],
  );

  const latestMatches = useMemo(
    () =>
      avilesMatches
        .filter((match) => isMatchPlayed(match))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [avilesMatches],
  );

  const upcomingMatches = useMemo(
    () =>
      avilesMatches
        .filter((match) => !isMatchPlayed(match))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5),
    [avilesMatches],
  );

  const nextMatch = upcomingMatches[0];

  return {
    teams,
    leagueMatchdays: editedLeagueMatchdays,
    editedLeagueMatchdays,
    avilesMatches,
    latestMatches,
    upcomingMatches,
    nextMatch,
    currentRound,
    highlightTeamId: RAI_TEAM_ID,
    bundlesLoading,
    standingsZones,
    competitionConfig,
  };
}

export type MasculinoLeagueSeason = {
  teams: Team[];
  leagueMatchdays: Matchday[];
  editedLeagueMatchdays: Matchday[];
  avilesMatches: Match[];
  latestMatches: Match[];
  upcomingMatches: Match[];
  nextMatch: Match | undefined;
  currentRound: number;
  highlightTeamId: string;
  bundlesLoading: boolean;
  standingsZones: StandingsZonesConfig;
  competitionConfig: SeasonCompetitionConfigBundle;
};
