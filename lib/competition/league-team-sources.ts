import { segundaDivisionTeams } from "@/data/segunda-division-teams";
import { teamsGrupo1 } from "@/lib/rfef-grupos";
import type { LeagueTemplateId } from "@/lib/competition/league-templates";
import { getTeamsByGender } from "@/lib/fixtures";
import { getTeamsForRfefGrupo, type RfefGrupoId } from "@/lib/rfef-grupos";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Team } from "@/types";

/** Equipos mock por defecto al aplicar una plantilla de liga o rellenar slots vacíos. */
export function defaultTeamsForLeagueTemplate(
  templateId: LeagueTemplateId | undefined,
  gender: PrimerEquipoGender,
  grupo: RfefGrupoId,
  count: number,
): Team[] {
  if (templateId === "segunda-division-22") {
    return segundaDivisionTeams.slice(0, count);
  }
  if (templateId === "segunda-rfef-1x18") {
    return teamsGrupo1.slice(0, count);
  }
  if (templateId === "segunda-rfef-femenina-14") {
    return getTeamsByGender("femenino").slice(0, count);
  }
  if (gender === "masculino") {
    return getTeamsForRfefGrupo(grupo).slice(0, count);
  }
  return getTeamsByGender(gender).slice(0, count);
}
