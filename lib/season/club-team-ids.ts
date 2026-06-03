import { RAI_FEM_TEAM_ID, RAI_TEAM_ID } from "@/data/mock";
import { resolveGroupTeams } from "@/lib/cms/group-teams";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { getRaiTeamId } from "@/lib/fixtures";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { RfefGrupoId } from "@/lib/rfef-grupos";
import type { Match } from "@/types";

const CLUB_NAME_PATTERN = /avil[eé]s/i;

const CANONICAL_CLUB_IDS: Record<PrimerEquipoGender, string> = {
  masculino: RAI_TEAM_ID,
  femenino: RAI_FEM_TEAM_ID,
};

/** IDs del club en el grupo CMS (p. ej. slug distinto de `real-aviles-industrial`). */
export function resolveClubTeamIds(
  bundles: SeasonBundlesMap,
  gender: PrimerEquipoGender,
  grupo: RfefGrupoId = "1",
): string[] {
  const canonical = getRaiTeamId(gender);
  const ids = new Set<string>([canonical, CANONICAL_CLUB_IDS[gender]]);

  for (const team of resolveGroupTeams(bundles, gender, grupo)) {
    if (team.id === canonical || CLUB_NAME_PATTERN.test(team.name)) {
      ids.add(team.id);
    }
  }

  return [...ids];
}

export function isClubTeamMatch(match: Match, clubTeamIds: readonly string[]): boolean {
  return clubTeamIds.includes(match.homeTeamId) || clubTeamIds.includes(match.awayTeamId);
}
