import type { Route } from "next";
import { redirect } from "next/navigation";
import {
  defaultCronicaId,
  isLegacyPreviaArticleId,
  matchIdFromPreviaArticleId,
} from "@/lib/match-article-factory";
import { getMatchArticleById } from "@/lib/match-articles";
import { primerEquipoBase, primerEquipoHasCronicas, type PrimerEquipoGender } from "@/lib/primer-equipo";

export default async function PreviaDetailRedirectPage({
  params,
}: {
  params: Promise<{ gender: PrimerEquipoGender; articleId: string }>;
}) {
  const { gender, articleId } = await params;

  if (!primerEquipoHasCronicas(gender)) {
    redirect(`${primerEquipoBase(gender)}/plantilla` as Route);
  }

  const legacyMatchId = matchIdFromPreviaArticleId(articleId, gender);
  if (legacyMatchId !== null && isLegacyPreviaArticleId(articleId, gender)) {
    redirect(`${primerEquipoBase(gender)}/cronicas/${defaultCronicaId(legacyMatchId, gender)}` as Route);
  }

  const article = getMatchArticleById(articleId);
  if (!article || article.gender !== gender) {
    redirect(`${primerEquipoBase(gender)}/cronicas` as Route);
  }

  redirect(`${primerEquipoBase(gender)}/cronicas/${article.id}` as Route);
}
