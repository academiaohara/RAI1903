"use client";

import { useMemo } from "react";
import { useSeason, type SeasonDataScope } from "@/components/season/SeasonProvider";
import {
  zonesToLegacyConfig,
  type SeasonCompetitionConfigBundle,
} from "@/lib/cms/competition-config-bundle";
import { resolveGroupTeams } from "@/lib/cms/group-teams";
import { collectClubMatches, resolveClubTeamIds } from "@/lib/season/club-team-ids";
import { RAI_FEM_TEAM_ID, RAI_TEAM_ID } from "@/data/mock";
import { useEditedMatchdays, useEditedMatches } from "@/hooks/useEditedMatchdays";
import { getLeagueMatchdaysForGender } from "@/lib/season/aviles-matches";
import { getLastPlayedLeagueRound } from "@/lib/standings";
import {
  latestMatchesBeforeToday,
  upcomingMatchesAfterToday,
} from "@/lib/match-calendar-dates";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { StandingsZonesConfig } from "@/lib/standings";
import type { Match, Matchday, Team } from "@/types";

export function usePrimerEquipoLeagueSeason(
  gender: PrimerEquipoGender,
  seasonScope: SeasonDataScope = "viewed",
) {
  const { getEnrichedFixtureSource, getBundles, getCompetitionConfig, isBundlesLoading, resolveSeasonId } =
    useSeason();
  const seasonId = resolveSeasonId(seasonScope);
  const bundles = useMemo(() => getBundles(seasonId), [getBundles, seasonId]);
  const fixtureSource = useMemo(
    () => getEnrichedFixtureSource(gender, seasonScope),
    [gender, getEnrichedFixtureSource, seasonScope],
  );
  const competitionConfig = useMemo(
    () => getCompetitionConfig(gender, seasonScope),
    [gender, getCompetitionConfig, seasonScope],
  );
  const standingsZones = useMemo(
    () => zonesToLegacyConfig(competitionConfig.zones),
    [competitionConfig.zones],
  );
  const bundlesLoading = isBundlesLoading(seasonId);
  const baseLeagueMatchdays = useMemo(
    () => getLeagueMatchdaysForGender(fixtureSource, gender),
    [fixtureSource, gender],
  );
  const editedLeagueMatchdays = useEditedMatchdays(baseLeagueMatchdays, gender);
  const teams = useMemo(() => resolveGroupTeams(bundles, gender, "1"), [bundles, gender]);
  const clubTeamIds = useMemo(
    () => resolveClubTeamIds(bundles, gender, "1", editedLeagueMatchdays),
    [bundles, editedLeagueMatchdays, gender],
  );
  const baseAvilesMatches = useMemo(
    () => collectClubMatches(editedLeagueMatchdays, fixtureSource, gender, clubTeamIds),
    [editedLeagueMatchdays, fixtureSource, gender, clubTeamIds],
  );
  const avilesMatches = useEditedMatches(baseAvilesMatches, gender);
  const currentRound = useMemo(
    () => getLastPlayedLeagueRound(editedLeagueMatchdays),
    [editedLeagueMatchdays],
  );
  const latestMatches = useMemo(
    () => latestMatchesBeforeToday(avilesMatches, 5),
    [avilesMatches],
  );
  const upcomingMatches = useMemo(
    () => upcomingMatchesAfterToday(avilesMatches, 5),
    [avilesMatches],
  );
  const nextMatch = upcomingMatches[0];
  const highlightTeamId = gender === "femenino" ? RAI_FEM_TEAM_ID : RAI_TEAM_ID;

  return {
    teams,
    leagueMatchdays: editedLeagueMatchdays,
    editedLeagueMatchdays,
    avilesMatches,
    latestMatches,
    upcomingMatches,
    nextMatch,
    currentRound,
    highlightTeamId,
    bundlesLoading,
    standingsZones,
    competitionConfig,
  };
}

export type PrimerEquipoLeagueSeason = {
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
