import { getTeamByGender } from "@/lib/fixtures";
import { isTeamInRfefGrupo1 } from "@/lib/rfef-grupos";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Route } from "next";

/** Ruta de la ficha de un rival de liga (Primer Equipo → Competición). */
export function equipoLigaHref(gender: PrimerEquipoGender, teamId: string): Route {
  return `${primerEquipoBase(gender)}/competicion/equipo/${teamId}` as Route;
}

/** Plantillas rivales solo para equipos del Grupo I (masculino). */
export function canLinkEquipoLiga(gender: PrimerEquipoGender, teamId: string): boolean {
  if (!getTeamByGender(teamId, gender)) {
    return false;
  }
  if (gender === "masculino") {
    return isTeamInRfefGrupo1(teamId);
  }
  return true;
}
