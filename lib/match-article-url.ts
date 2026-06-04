import { defaultCronicaId } from "@/lib/match-article-factory";
import { primerEquipoBase, primerEquipoHasCronicas, type PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Route } from "next";

export function getMatchArticlePageHref(
  matchId: string,
  gender: PrimerEquipoGender,
  articleId?: string,
): Route | null {
  if (!primerEquipoHasCronicas(gender)) return null;
  const id = articleId ?? defaultCronicaId(matchId, gender);
  return `${primerEquipoBase(gender)}/cronicas/${id}` as Route;
}
