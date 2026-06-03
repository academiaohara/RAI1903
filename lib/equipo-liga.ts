import {
  canLinkEquipoLiga as canLinkEquipoLigaImpl,
  resolveEquipoLigaTeam,
} from "@/lib/equipo-liga-resolve";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Route } from "next";

export { resolveEquipoLigaTeam };

/** Ruta de la ficha de un rival de liga (Primer Equipo → Competición). */
export function equipoLigaHref(gender: PrimerEquipoGender, teamId: string): Route {
  return `${primerEquipoBase(gender)}/competicion/equipo/${teamId}` as Route;
}

export function canLinkEquipoLiga(
  gender: PrimerEquipoGender,
  teamId: string,
  bundles?: SeasonBundlesMap,
): boolean {
  return canLinkEquipoLigaImpl(gender, teamId, bundles);
}
