import { getRaiTeamId } from "@/lib/fixtures";
import { fixtureSourceFromBundles, type JornadasFixtureSource } from "@/lib/season/fixture-source";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Match } from "@/types";

const GENDERS: PrimerEquipoGender[] = ["masculino", "femenino"];

export type FindMatchInBundlesOptions = {
  /** Applied to each fixture before id / Avilés checks (e.g. inline `match-result` overrides). */
  mapMatch?: (match: Match) => Match;
  /** Limit search to one gender (faster when the route gender is known). */
  gender?: PrimerEquipoGender;
};

function listFixtureMatches(source: JornadasFixtureSource, gender: PrimerEquipoGender): Match[] {
  if (gender === "femenino") {
    return source.matchdaysFemenino.flatMap((matchday) => matchday.matches);
  }
  return [
    ...source.matchdays.flatMap((matchday) => matchday.matches),
    ...source.amistosoMatches,
    ...source.copaDelReyMatches,
  ];
}

export function findMatchInBundles(
  bundles: SeasonBundlesMap,
  matchId: string,
  options?: FindMatchInBundlesOptions,
): Match | undefined {
  const genders = options?.gender ? [options.gender] : GENDERS;
  const mapMatch = options?.mapMatch ?? ((match: Match) => match);

  for (const gender of genders) {
    const source = fixtureSourceFromBundles(bundles, gender);
    const raiId = getRaiTeamId(gender);

    for (const raw of listFixtureMatches(source, gender)) {
      const match = mapMatch(raw);
      if (match.id !== matchId) continue;
      if (match.homeTeamId === raiId || match.awayTeamId === raiId) return match;
    }
  }

  return undefined;
}
