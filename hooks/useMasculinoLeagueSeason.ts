"use client";

import { useMemo } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import { RAI_TEAM_ID } from "@/data/mock";
import {
  getAvilesMatchesFromSource,
  getLeagueMatchdaysForGender,
} from "@/lib/season/aviles-matches";
import { getTeamsForRfefGrupo } from "@/lib/rfef-grupos";
import type { Match, Matchday, Team } from "@/types";

export function useMasculinoLeagueSeason() {
  const { getFixtureSource, bundlesLoading } = useSeason();
  const fixtureSource = useMemo(() => getFixtureSource("masculino"), [getFixtureSource]);
  const leagueMatchdays = useMemo(
    () => getLeagueMatchdaysForGender(fixtureSource, "masculino"),
    [fixtureSource],
  );
  const teams = useMemo(() => getTeamsForRfefGrupo("1"), []);
  const avilesMatches = useMemo(
    () => getAvilesMatchesFromSource(fixtureSource, "masculino"),
    [fixtureSource],
  );
  const currentRound = fixtureSource.lastRoundMasculino;

  const latestMatches = useMemo(
    () =>
      avilesMatches
        .filter((match) => match.status === "finished")
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [avilesMatches],
  );

  const upcomingMatches = useMemo(
    () =>
      avilesMatches
        .filter((match) => match.status === "scheduled")
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5),
    [avilesMatches],
  );

  const nextMatch = upcomingMatches[0];

  return {
    teams,
    leagueMatchdays,
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
  avilesMatches: Match[];
  latestMatches: Match[];
  upcomingMatches: Match[];
  nextMatch: Match | undefined;
  currentRound: number;
  highlightTeamId: string;
  bundlesLoading: boolean;
};
