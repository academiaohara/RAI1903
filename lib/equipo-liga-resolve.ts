import { getGroupTeamSlots, groupSlotToTeam } from "@/lib/cms/group-teams";
import { getTeamsBundle } from "@/lib/cms/teams-bundle";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { getTeamByGender } from "@/lib/fixtures";
import { isTeamInRfefGrupo, isTeamInRfefGrupo1, type RfefGrupoId } from "@/lib/rfef-grupos";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Team } from "@/types";

export function findGrupoForTeamId(
  teamId: string,
  gender: PrimerEquipoGender,
  bundles?: SeasonBundlesMap,
): RfefGrupoId | undefined {
  if (gender !== "masculino" || !bundles) return undefined;
  for (const grupo of ["1", "2"] as const) {
    const slots = getGroupTeamSlots(bundles, gender, grupo);
    const index = slots.findIndex((slot) => slot.id === teamId && slot.name.trim());
    if (index >= 0) return grupo;
  }
  return undefined;
}

export function resolveEquipoLigaTeam(
  teamId: string,
  gender: PrimerEquipoGender,
  bundles?: SeasonBundlesMap,
): Team | undefined {
  const mock = getTeamByGender(teamId, gender);
  if (mock) return mock;

  if (gender === "masculino" && bundles) {
    for (const grupo of ["1", "2"] as const) {
      const slots = getGroupTeamSlots(bundles, gender, grupo);
      const index = slots.findIndex((slot) => slot.id === teamId && slot.name.trim());
      if (index >= 0) {
        const cmsColors = getTeamsBundle(bundles, gender)?.teams.find((team) => team.id === teamId)?.colors;
        return groupSlotToTeam(slots[index]!, index, cmsColors);
      }
    }
  }

  return undefined;
}

export function canLinkEquipoLiga(
  gender: PrimerEquipoGender,
  teamId: string,
  bundles?: SeasonBundlesMap,
): boolean {
  if (gender === "femenino") return false;
  if (!resolveEquipoLigaTeam(teamId, gender, bundles)) {
    return false;
  }
  if (bundles) return true;
  return isTeamInRfefGrupo1(teamId) || isTeamInRfefGrupo(teamId, "2");
}
