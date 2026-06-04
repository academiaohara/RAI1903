import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { filterQuinielaMatchdays } from "@/lib/quiniela";
import { enrichFixtureSource, getLeagueMatchdaysEnriched } from "@/lib/season/enriched-fixtures";
import { fixtureSourceFromBundles } from "@/lib/season/fixture-source";
import type { Matchday } from "@/types";

/** Jornadas del Grupo I (masculino) listas para puntuar la quiniela desde bundles CMS. */
export function buildQuinielaMatchdaysFromBundles(bundles: SeasonBundlesMap): Matchday[] {
  const source = fixtureSourceFromBundles(bundles, "masculino");
  const enriched = enrichFixtureSource(source, bundles, "masculino");
  const matchdays = getLeagueMatchdaysEnriched(enriched, "masculino");
  return filterQuinielaMatchdays(matchdays);
}
