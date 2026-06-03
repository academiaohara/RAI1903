import type { SeasonBundlesMap, SeasonFixturesBundle, SeasonFemeninoFixturesBundle } from "@/lib/cms/season-bundles";
import { getFixturesBundle } from "@/lib/cms/season-bundles";
import { getAllTeamsForGender } from "@/lib/fixtures";
import { shouldUseMockCompetitionFallback } from "@/lib/season/cms-data-policy";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Match, Matchday } from "@/types";

export type TeamRef = {
  id: string;
  name: string;
};

function addFromMatchday(map: Map<string, string>, matchday: Matchday) {
  for (const match of matchday.matches) {
    map.set(match.homeTeamId, match.homeTeam);
    map.set(match.awayTeamId, match.awayTeam);
  }
}

function addFromMatches(map: Map<string, string>, matches: Match[]) {
  for (const match of matches) {
    map.set(match.homeTeamId, match.homeTeam);
    map.set(match.awayTeamId, match.awayTeam);
  }
}

export function collectTeamsFromBundles(bundles: SeasonBundlesMap): TeamRef[] {
  const map = new Map<string, string>();

  const masc = getFixturesBundle(bundles, "masculino") as SeasonFixturesBundle | null;
  if (masc?.matchdays) masc.matchdays.forEach((md) => addFromMatchday(map, md));
  if (masc?.matchdaysGrupo2) masc.matchdaysGrupo2.forEach((md) => addFromMatchday(map, md));
  if (masc?.amistosoMatches) addFromMatches(map, masc.amistosoMatches);
  if (masc?.copaDelReyMatches) addFromMatches(map, masc.copaDelReyMatches);
  if (masc?.calendarExtraMatches) addFromMatches(map, masc.calendarExtraMatches);

  const fem = getFixturesBundle(bundles, "femenino") as SeasonFemeninoFixturesBundle | null;
  if (fem?.matchdaysFemenino) fem.matchdaysFemenino.forEach((md) => addFromMatchday(map, md));

  if (shouldUseMockCompetitionFallback()) {
    const genders: PrimerEquipoGender[] = ["masculino", "femenino"];
    for (const gender of genders) {
      for (const team of getAllTeamsForGender(gender)) {
        if (!map.has(team.id)) map.set(team.id, team.name);
      }
    }
  }

  return [...map.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}
