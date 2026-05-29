import { getTeamByGender } from "@/lib/fixtures";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Route } from "next";

/** Ruta de la ficha de un rival de liga (Primer Equipo → Competición). */
export function equipoLigaHref(gender: PrimerEquipoGender, teamId: string): Route {
  return `${primerEquipoBase(gender)}/competicion/equipo/${teamId}` as Route;
}

/** Solo enlaza si el equipo existe en los datos de liga para ese género. */
export function canLinkEquipoLiga(gender: PrimerEquipoGender, teamId: string): boolean {
  return Boolean(getTeamByGender(teamId, gender));
}
