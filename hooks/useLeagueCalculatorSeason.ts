"use client";

import { useMemo } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import { RAI_TEAM_ID } from "@/data/mock";
import { getCompetitionConfigBundle, leagueRoundCount, zonesToLegacyConfig } from "@/lib/cms/competition-config-bundle";
import { resolveGroupTeams } from "@/lib/cms/group-teams";
import { useEditedMatchdays } from "@/hooks/useEditedMatchdays";
import { getFirstPendingRound } from "@/lib/league-calculator";
import { PRIMERA_RFEF_RULES } from "@/lib/rfef-rules";
import { getLeagueMatchdaysEnriched } from "@/lib/season/enriched-fixtures";
import { getLastPlayedLeagueRound } from "@/lib/standings";
import type { Matchday, Team } from "@/types";
import type { CompetitionZoneRule } from "@/lib/cms/competition-config-bundle";
import type { StandingsZonesConfig } from "@/lib/standings";

export function useLeagueCalculatorSeason() {
  const { getEnrichedFixtureSource, bundles, bundlesLoading, viewedSeason, getCompetitionConfig } = useSeason();
  const fixtureSource = useMemo(() => getEnrichedFixtureSource("masculino"), [getEnrichedFixtureSource]);
  const baseMatchdays = useMemo(
    () => getLeagueMatchdaysEnriched(fixtureSource, "masculino"),
    [fixtureSource],
  );
  const matchdays = useEditedMatchdays(baseMatchdays, "masculino");
  const teams = useMemo(() => resolveGroupTeams(bundles, "masculino", "1"), [bundles]);
  const competitionConfig = useMemo(() => getCompetitionConfig("masculino"), [getCompetitionConfig]);
  const standingsZones = useMemo(
    () => zonesToLegacyConfig(competitionConfig.zones),
    [competitionConfig.zones],
  );
  const totalRounds = useMemo(() => {
    const config = getCompetitionConfigBundle(bundles, "masculino");
    if (config) return leagueRoundCount(config.teamsPerGroup);
    if (matchdays.length > 0) return Math.max(...matchdays.map((matchday) => matchday.round));
    return 38;
  }, [bundles, matchdays]);
  const currentRound = useMemo(() => getLastPlayedLeagueRound(matchdays), [matchdays]);
  const defaultRound = useMemo(
    () => getFirstPendingRound(matchdays, totalRounds),
    [matchdays, totalRounds],
  );
  const competitionLabel = competitionConfig.ligaLabel ?? "1ª RFEF";

  return {
    matchdays,
    teams,
    currentRound,
    defaultRound,
    totalRounds,
    standingsZones,
    zoneRules: competitionConfig.zones as CompetitionZoneRule[],
    tiebreak: PRIMERA_RFEF_RULES.tiebreak,
    highlightTeamId: RAI_TEAM_ID,
    seasonLabel: viewedSeason.label,
    competitionLabel,
    bundlesLoading,
  };
}

export type LeagueCalculatorSeason = {
  matchdays: Matchday[];
  teams: Team[];
  currentRound: number;
  defaultRound: number;
  totalRounds: number;
  standingsZones: StandingsZonesConfig;
  zoneRules: CompetitionZoneRule[];
  tiebreak: typeof PRIMERA_RFEF_RULES.tiebreak;
  highlightTeamId: string;
  seasonLabel: string;
  competitionLabel: string;
  bundlesLoading: boolean;
};
