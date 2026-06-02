import { getGroupTeamSlots, groupSlotToTeam } from "@/lib/cms/group-teams";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { isRaiCompetitionTeam } from "@/lib/competicion-squad";
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
      if (index >= 0) return groupSlotToTeam(slots[index]!, index);
    }
  }

  return undefined;
}


/** Plantilla detallada solo en el grupo del Avilés (Grupo I); en Grupo II basta la clasificación. */
export function shouldShowDetailedRivalSquad(
  gender: PrimerEquipoGender,
  teamId: string,
  bundles?: SeasonBundlesMap,
): boolean {
  if (gender === "femenino" || isRaiCompetitionTeam(teamId, gender)) {
    return true;
  }
  const grupo = findGrupoForTeamId(teamId, gender, bundles);
  if (grupo) return grupo === "1";
  return isTeamInRfefGrupo1(teamId);
}

export function canLinkEquipoLiga(
  gender: PrimerEquipoGender,
  teamId: string,
  bundles?: SeasonBundlesMap,
): boolean {
  if (!resolveEquipoLigaTeam(teamId, gender, bundles)) {
    return false;
  }
  if (gender === "femenino") return true;
  if (bundles) return true;
  return isTeamInRfefGrupo1(teamId) || isTeamInRfefGrupo(teamId, "2");
}
