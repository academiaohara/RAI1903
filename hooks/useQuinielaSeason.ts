"use client";

import { useMemo } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import { RAI_TEAM_ID } from "@/data/mock";
import { getLeagueMatchdaysForGender } from "@/lib/season/aviles-matches";
import { getTeamsForRfefGrupo } from "@/lib/rfef-grupos";
import { getLastPlayedLeagueRound } from "@/lib/standings";
import type { CompetitionSeasonId } from "@/data/mock";
import type { Matchday, Team } from "@/types";

/** Partidos de liga del Grupo I (donde juega el Real Avilés) para la quiniela. */
export function useQuinielaSeason() {
  const { getFixtureSource, viewedSeasonId, bundlesLoading } = useSeason();
  const fixtureSource = useMemo(() => getFixtureSource("masculino"), [getFixtureSource]);
  const matchdays = useMemo(
    () => getLeagueMatchdaysForGender(fixtureSource, "masculino"),
    [fixtureSource],
  );
  const teams = useMemo(() => getTeamsForRfefGrupo("1"), []);
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
