import { resolveGroupTeams } from "@/lib/cms/group-teams";
import { countsAsLeagueCompetition } from "@/lib/competition-labels";
import { findGrupoForTeamId } from "@/lib/equipo-liga-resolve";
import { getGrupo2Matchdays, getLeagueMatchdaysForGender } from "@/lib/season/aviles-matches";
import type { EnrichedFixtureSource } from "@/lib/season/enriched-fixtures";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Match, Matchday, Team } from "@/types";

export type LeagueContextForMatch = {
  leagueMatchdays: Matchday[];
  sourceTeams: Team[];
};

/** Jornadas y plantel del grupo de liga al que pertenece el partido. */
export function resolveLeagueContextForMatch(
  match: Match,
  gender: PrimerEquipoGender,
  source: EnrichedFixtureSource,
  bundles: SeasonBundlesMap,
): LeagueContextForMatch | null {
  if (!countsAsLeagueCompetition(match.competition)) return null;

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
