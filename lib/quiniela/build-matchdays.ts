import type { InlineOverridesMap } from "@/lib/cms/inline-overrides";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { applyMatchdayOverrides } from "@/lib/fixture-overrides";
import { filterQuinielaMatchdays } from "@/lib/quiniela";
import { enrichFixtureSource, getLeagueMatchdaysEnriched } from "@/lib/season/enriched-fixtures";
import { fixtureSourceFromBundles } from "@/lib/season/fixture-source";
import type { Matchday } from "@/types";

/** Jornadas de liga del primer equipo (sin filtro de quiniela). */
export function buildLeagueMatchdaysFromBundles(
  bundles: SeasonBundlesMap,
  inlineOverrides: InlineOverridesMap = {},
): Matchday[] {
  const source = fixtureSourceFromBundles(bundles, "masculino");
  const enriched = enrichFixtureSource(source, bundles, "masculino");
  const matchdays = getLeagueMatchdaysEnriched(enriched, "masculino");
  if (Object.keys(inlineOverrides).length === 0) return matchdays;
  return applyMatchdayOverrides(matchdays, (key) => inlineOverrides[key], "masculino");
}

/** Jornadas del Grupo I (masculino) listas para puntuar la quiniela desde bundles CMS. */
export function buildQuinielaMatchdaysFromBundles(
  bundles: SeasonBundlesMap,
  inlineOverrides: InlineOverridesMap = {},
): Matchday[] {
  const source = fixtureSourceFromBundles(bundles, "masculino");
  const enriched = enrichFixtureSource(source, bundles, "masculino");
  const matchdays = getLeagueMatchdaysEnriched(enriched, "masculino");
  const filtered = filterQuinielaMatchdays(matchdays);
  if (Object.keys(inlineOverrides).length === 0) return filtered;
  return applyMatchdayOverrides(filtered, (key) => inlineOverrides[key], "masculino");
}
