import type { Route } from "next";
import { redirect } from "next/navigation";
import {
  defaultCronicaId,
  isLegacyPreviaArticleId,
  matchIdFromCronicaArticleId,
  matchIdFromPreviaArticleId,
} from "@/lib/match-article-factory";
import { isPrimerEquipoGender, primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";

export default async function PreviaDetailRedirectPage({
  params,
}: {
  params: Promise<{ gender: string; articleId: string }>;
}) {
  const { gender: genderParam, articleId } = await params;
  if (!isPrimerEquipoGender(genderParam)) {
    redirect("/primer-equipo/masculino/plantilla" as Route);
  }
  const gender = genderParam as PrimerEquipoGender;

  const legacyPreviaMatchId = matchIdFromPreviaArticleId(articleId, gender);
  if (legacyPreviaMatchId !== null && isLegacyPreviaArticleId(articleId, gender)) {
    redirect(`${primerEquipoBase(gender)}/cronicas/${defaultCronicaId(legacyPreviaMatchId, gender)}` as Route);
  }

  const cronicaMatchId = matchIdFromCronicaArticleId(articleId, gender);
  if (cronicaMatchId !== null) {
    redirect(`${primerEquipoBase(gender)}/cronicas/${articleId}` as Route);
  }

  redirect(`${primerEquipoBase(gender)}/cronicas/${articleId}` as Route);
}
