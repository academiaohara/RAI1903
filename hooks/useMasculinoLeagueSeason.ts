"use client";

import { useMemo } from "react";
import { useSeason, type SeasonDataScope } from "@/components/season/SeasonProvider";
import { RAI_TEAM_ID } from "@/data/mock";
import { useEditedMatchdays, useEditedMatches } from "@/hooks/useEditedMatchdays";
import {
  getAvilesMatchesFromSource,
  getLeagueMatchdaysForGender,
} from "@/lib/season/aviles-matches";
import { getTeamsForRfefGrupo } from "@/lib/rfef-grupos";
import { getLastPlayedLeagueRound } from "@/lib/standings";
import { isMatchPlayed } from "@/lib/match-result";
import type { Match, Matchday, Team } from "@/types";

export function useMasculinoLeagueSeason(seasonScope: SeasonDataScope = "viewed") {
  const { getFixtureSource, isBundlesLoading, resolveSeasonId } = useSeason();
  const seasonId = resolveSeasonId(seasonScope);
  const fixtureSource = useMemo(
    () => getFixtureSource("masculino", seasonScope),
    [getFixtureSource, seasonScope],
  );
  const bundlesLoading = isBundlesLoading(seasonId);
  const baseLeagueMatchdays = useMemo(
    () => getLeagueMatchdaysForGender(fixtureSource, "masculino"),
    [fixtureSource],
  );
  const leagueMatchdays = useEditedMatchdays(baseLeagueMatchdays, "masculino");
  const teams = useMemo(() => getTeamsForRfefGrupo("1"), []);
  const baseAvilesMatches = useMemo(
    () => getAvilesMatchesFromSource(fixtureSource, "masculino"),
    [fixtureSource],
  );
  const avilesMatches = useEditedMatches(baseAvilesMatches, "masculino");
  const currentRound = useMemo(
    () => getLastPlayedLeagueRound(leagueMatchdays),
    [leagueMatchdays],
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
    leagueMatchdays: baseLeagueMatchdays,
    editedLeagueMatchdays: leagueMatchdays,
    avilesMatches,
    latestMatches,
    upcomingMatches,
    nextMatch,
    currentRound,
    highlightTeamId: RAI_TEAM_ID,
    bundlesLoading,
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
};
