import {
  getCompetitionConfigBundle,
  resolveCompetitionConfig,
  type SeasonCompetitionConfigBundle,
} from "@/lib/cms/competition-config-bundle";
import { getTeamsBundle, resolveFixtureTeamDisplayName } from "@/lib/cms/teams-bundle";
import {
  applyFixtureTeamNames,
  applyFixtureTeamNamesToMatches,
  normalizeGrupo2Matchdays,
  normalizeLeagueMatchdays,
} from "@/lib/competition/normalize-fixtures";
import {
  enrichFixtureMatchesVenues,
  enrichMatchdaysVenues,
} from "@/lib/match-venue";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import type { JornadasFixtureSource } from "@/lib/season/fixture-source";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Matchday } from "@/types";

export type EnrichedFixtureSource = JornadasFixtureSource & {
  competitionConfig: SeasonCompetitionConfigBundle;
};

export function enrichFixtureSource(
  source: JornadasFixtureSource,
  bundles: SeasonBundlesMap,
  gender: PrimerEquipoGender,
): EnrichedFixtureSource {
  const config = resolveCompetitionConfig(bundles, gender);
  const cmsTeams = getTeamsBundle(bundles, gender)?.teams ?? [];

  const resolveName = (teamId: string, fallback: string) =>
    resolveFixtureTeamDisplayName(teamId, fallback, cmsTeams, bundles, gender);

  const matchdays = applyFixtureTeamNames(
    normalizeLeagueMatchdays(source.matchdays, config, undefined, "masculino"),
    resolveName,
  );

  const matchdaysGrupo2 =
    config.groupCount >= 2
      ? applyFixtureTeamNames(
          normalizeGrupo2Matchdays(source.matchdaysGrupo2, config, undefined, "masculino"),
          resolveName,
        )
      : source.matchdaysGrupo2;

  const matchdaysFemenino = applyFixtureTeamNames(
    normalizeLeagueMatchdays(source.matchdaysFemenino, config, undefined, "femenino"),
    resolveName,
  );

  const amistosoMatches = applyFixtureTeamNamesToMatches(source.amistosoMatches, resolveName);
  const copaDelReyMatches = applyFixtureTeamNamesToMatches(source.copaDelReyMatches, resolveName);
  const calendarExtraMatches = applyFixtureTeamNamesToMatches(source.calendarExtraMatches, resolveName);

  const venueOptions = { bundles, seasonLabel: undefined };
  const withVenues = {
    matchdays: enrichMatchdaysVenues(matchdays, gender, venueOptions),
    matchdaysGrupo2: enrichMatchdaysVenues(matchdaysGrupo2, gender, venueOptions),
    matchdaysFemenino: enrichMatchdaysVenues(matchdaysFemenino, gender, venueOptions),
    amistosoMatches: enrichFixtureMatchesVenues(amistosoMatches, gender, venueOptions),
    copaDelReyMatches: enrichFixtureMatchesVenues(copaDelReyMatches, gender, venueOptions),
    calendarExtraMatches: enrichFixtureMatchesVenues(calendarExtraMatches, gender, venueOptions),
  };

  return {
    ...source,
    ...withVenues,
    competitionConfig: config,
  };
}

export function getCompetitionConfigForBundles(
  bundles: SeasonBundlesMap,
  gender: PrimerEquipoGender,
): SeasonCompetitionConfigBundle {
  return getCompetitionConfigBundle(bundles, gender) ?? resolveCompetitionConfig(bundles, gender);
}

export function getLeagueMatchdaysEnriched(
  enriched: EnrichedFixtureSource,
  gender: PrimerEquipoGender,
): Matchday[] {
  return gender === "femenino" ? enriched.matchdaysFemenino : enriched.matchdays;
}
