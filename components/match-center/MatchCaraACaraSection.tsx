"use client";

import { useMemo } from "react";
import { CaraACaraPanel } from "@/components/match-center/CaraACaraPanel";
import { useSeason } from "@/components/season/SeasonProvider";
import { resolveGroupTeams } from "@/lib/cms/group-teams";
import { buildCaraACaraData } from "@/lib/cara-a-cara";
import { isLeagueCompetition } from "@/lib/competition-labels";
import { findGrupoForTeamId } from "@/lib/equipo-liga-resolve";
import { getGrupo2Matchdays, getLeagueMatchdaysForGender } from "@/lib/season/aviles-matches";
import type { EnrichedFixtureSource } from "@/lib/season/enriched-fixtures";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Match, MatchDetail, Matchday, Team } from "@/types";

function resolveLeagueContext(
  match: Match,
  gender: PrimerEquipoGender,
  getEnrichedFixtureSource: (gender: PrimerEquipoGender) => EnrichedFixtureSource,
  bundles: Parameters<typeof resolveGroupTeams>[0],
): { leagueMatchdays: Matchday[]; sourceTeams: Team[] } | null {
  if (!isLeagueCompetition(match.competition)) return null;

  const source = getEnrichedFixtureSource(gender);

  if (gender === "femenino") {
    return {
      leagueMatchdays: source.matchdaysFemenino,
      sourceTeams: resolveGroupTeams(bundles, gender, "1"),
    };
  }

  const inGrupo1 = source.matchdays.some((matchday) =>
    matchday.matches.some((entry) => entry.id === match.id),
  );
  if (inGrupo1) {
    return {
      leagueMatchdays: source.matchdays,
      sourceTeams: resolveGroupTeams(bundles, gender, "1"),
    };
  }

  const inGrupo2 = source.matchdaysGrupo2.some((matchday) =>
    matchday.matches.some((entry) => entry.id === match.id),
  );
  if (inGrupo2) {
    return {
      leagueMatchdays: source.matchdaysGrupo2,
      sourceTeams: resolveGroupTeams(bundles, gender, "2"),
    };
  }

  const grupo =
    findGrupoForTeamId(match.homeTeamId, gender, bundles) ??
    findGrupoForTeamId(match.awayTeamId, gender, bundles) ??
    "1";

  return {
    leagueMatchdays:
      grupo === "2" ? getGrupo2Matchdays(source) : getLeagueMatchdaysForGender(source, gender),
    sourceTeams: resolveGroupTeams(bundles, gender, grupo),
  };
}

export function MatchCaraACaraSection({ detail }: { detail: MatchDetail }) {
  const { match, gender } = detail;
  const { bundles, getEnrichedFixtureSource } = useSeason();

  const leagueContext = useMemo(
    () => resolveLeagueContext(match, gender, getEnrichedFixtureSource, bundles),
    [bundles, gender, getEnrichedFixtureSource, match],
  );

  const data = useMemo(
    () =>
      leagueContext
        ? buildCaraACaraData(match.homeTeamId, match.awayTeamId, gender, {
            referenceMatch: match,
            leagueMatchdays: leagueContext.leagueMatchdays,
            sourceTeams: leagueContext.sourceTeams,
          })
        : buildCaraACaraData(match.homeTeamId, match.awayTeamId, gender),
    [gender, leagueContext, match],
  );

  if (!data) return null;

  return <CaraACaraPanel data={data} gender={gender} />;
}
