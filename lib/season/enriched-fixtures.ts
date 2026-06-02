import {
  getCompetitionConfigBundle,
  resolveCompetitionConfig,
  type SeasonCompetitionConfigBundle,
} from "@/lib/cms/competition-config-bundle";
import { buildFixtureTeamNameResolver } from "@/lib/cms/resolve-fixture-team-name";
import {
  applyFixtureTeamNames,
  normalizeGrupo2Matchdays,
  normalizeLeagueMatchdays,
} from "@/lib/competition/normalize-fixtures";
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
  const resolveGrupo1 = buildFixtureTeamNameResolver(bundles, gender, "1");
  const resolveGrupo2 = buildFixtureTeamNameResolver(bundles, gender, "2");

  const matchdays = applyFixtureTeamNames(
    normalizeLeagueMatchdays(source.matchdays, config),
    resolveGrupo1,
  );

  const matchdaysGrupo2 =
    config.groupCount >= 2
      ? applyFixtureTeamNames(normalizeGrupo2Matchdays(source.matchdaysGrupo2, config), resolveGrupo2)
      : source.matchdaysGrupo2;

  const matchdaysFemenino = applyFixtureTeamNames(
    normalizeLeagueMatchdays(source.matchdaysFemenino, config),
    resolveGrupo1,
  );

  return {
    ...source,
    matchdays,
    matchdaysGrupo2,
    matchdaysFemenino,
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
