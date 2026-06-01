import { getAvilesMatchesFromSource } from "@/lib/season/aviles-matches";
import { fixtureSourceFromBundles } from "@/lib/season/fixture-source";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Match } from "@/types";

const GENDERS: PrimerEquipoGender[] = ["masculino", "femenino"];

export function findMatchInBundles(bundles: SeasonBundlesMap, matchId: string): Match | undefined {
  for (const gender of GENDERS) {
    const source = fixtureSourceFromBundles(bundles, gender);
    const matches = getAvilesMatchesFromSource(source, gender);
    const found = matches.find((match) => match.id === matchId);
    if (found) return found;
  }
  return undefined;
}
