import { getFixturesBundle, type SeasonBundlesMap, type SeasonFixturesBundle } from "@/lib/cms/season-bundles";
import type { GroupTeamSlot } from "@/lib/cms/group-teams";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Match, Matchday } from "@/types";

export type FixtureTeamIdChange = {
  from: string;
  to: string;
};

export function collectFixtureTeamIdChanges(
  previousSlots: GroupTeamSlot[],
  nextSlots: GroupTeamSlot[],
): FixtureTeamIdChange[] {
  const changes: FixtureTeamIdChange[] = [];
  const limit = Math.min(previousSlots.length, nextSlots.length);

  for (let index = 0; index < limit; index += 1) {
    const from = previousSlots[index]?.id.trim();
    const to = nextSlots[index]?.id.trim();
    if (!from || !to || from === to) continue;
    changes.push({ from, to });
  }

  return changes;
}

function replaceTeamId(teamId: string, changes: FixtureTeamIdChange[]): string {
  return changes.find((row) => row.from === teamId)?.to ?? teamId;
}

function remapMatch(match: Match, changes: FixtureTeamIdChange[]): Match {
  const homeTeamId = replaceTeamId(match.homeTeamId, changes);
  const awayTeamId = replaceTeamId(match.awayTeamId, changes);
  if (homeTeamId === match.homeTeamId && awayTeamId === match.awayTeamId) return match;
  return { ...match, homeTeamId, awayTeamId };
}

function remapMatchday(matchday: Matchday, changes: FixtureTeamIdChange[]): Matchday {
  const matches = matchday.matches.map((match) => remapMatch(match, changes));
  if (matches.every((match, index) => match === matchday.matches[index])) return matchday;
  return { ...matchday, matches };
}

/** Actualiza IDs de equipo en el bundle fixtures cuando cambian al guardar la guía de liga. */
export function remapFixturesBundleTeamIds(
  bundle: SeasonFixturesBundle,
  changes: FixtureTeamIdChange[],
): SeasonFixturesBundle {
  if (changes.length === 0) return bundle;

  const matchdays = bundle.matchdays.map((md) => remapMatchday(md, changes));
  const matchdaysGrupo2 = bundle.matchdaysGrupo2?.map((md) => remapMatchday(md, changes));
  const amistosoMatches = bundle.amistosoMatches?.map((match) => remapMatch(match, changes));
  const copaDelReyMatches = bundle.copaDelReyMatches?.map((match) => remapMatch(match, changes));

  return {
    ...bundle,
    matchdays,
    matchdaysGrupo2,
    amistosoMatches,
    copaDelReyMatches,
  };
}

export function remapSeasonFixturesForTeamIdChanges(
  bundles: SeasonBundlesMap,
  gender: PrimerEquipoGender,
  changes: FixtureTeamIdChange[],
): SeasonFixturesBundle | null {
  const raw = getFixturesBundle(bundles, gender);
  if (!raw || changes.length === 0) return null;
  return remapFixturesBundleTeamIds(raw as SeasonFixturesBundle, changes);
}
