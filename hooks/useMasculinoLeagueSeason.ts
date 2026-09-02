"use client";

import { useMemo } from "react";
import { useSeason, type SeasonDataScope } from "@/components/season/SeasonProvider";
import {
  zonesToLegacyConfig,
  type SeasonCompetitionConfigBundle,
} from "@/lib/cms/competition-config-bundle";
import { resolveGroupTeams } from "@/lib/cms/group-teams";
import { resolveClubTeamIds } from "@/lib/season/club-team-ids";
import { RAI_TEAM_ID } from "@/data/mock";
import { useEditedMatchdays, useEditedMatches } from "@/hooks/useEditedMatchdays";
import { getAvilesMatchesFromSource } from "@/lib/season/aviles-matches";
import { enrichMatchVenue } from "@/lib/match-venue";
import { getLastPlayedLeagueRound } from "@/lib/standings";
import {
  latestMatchesBeforeToday,
  upcomingMatchesAfterToday,
} from "@/lib/match-calendar-dates";
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
    () => fixtureSource.matchdays,
    [fixtureSource.matchdays],
  );
  const baseGrupo2Matchdays = useMemo(
    () => fixtureSource.matchdaysGrupo2,
    [fixtureSource.matchdaysGrupo2],
  );
  const editedLeagueMatchdays = useEditedMatchdays(baseLeagueMatchdays, "masculino");
  const editedGrupo2Matchdays = useEditedMatchdays(baseGrupo2Matchdays, "masculino");
  const teams = useMemo(() => resolveGroupTeams(bundles, "masculino", "1"), [bundles]);
  const clubTeamIds = useMemo(() => {
    const ids = new Set([
      ...resolveClubTeamIds(bundles, "masculino", "1", editedLeagueMatchdays),
      ...resolveClubTeamIds(bundles, "masculino", "2", editedGrupo2Matchdays),
    ]);
    return [...ids];
  }, [bundles, editedLeagueMatchdays, editedGrupo2Matchdays]);
  const sourceForClub = useMemo(
    () => ({
      ...fixtureSource,
      matchdays: editedLeagueMatchdays,
      matchdaysGrupo2: editedGrupo2Matchdays,
    }),
    [fixtureSource, editedLeagueMatchdays, editedGrupo2Matchdays],
  );
  const baseAvilesMatches = useMemo(
    () =>
      getAvilesMatchesFromSource(sourceForClub, "masculino", { clubTeamIds }).map((match) =>
        enrichMatchVenue(match, "masculino", { bundles }),
      ),
    [sourceForClub, clubTeamIds, bundles],
  );
  const avilesMatches = useEditedMatches(baseAvilesMatches, "masculino");
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

  return {
    teams,
    leagueMatchdays: editedLeagueMatchdays,
    editedLeagueMatchdays,
    avilesMatches,
    clubTeamIds,
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
  clubTeamIds: string[];
  latestMatches: Match[];
  upcomingMatches: Match[];
  nextMatch: Match | undefined;
  currentRound: number;
  highlightTeamId: string;
  bundlesLoading: boolean;
  standingsZones: StandingsZonesConfig;
  competitionConfig: SeasonCompetitionConfigBundle;
};
