import type { Route } from "next";
import { notFound, redirect } from "next/navigation";
import { MatchArticleDetailSeason } from "@/components/primer-equipo/MatchArticleDetailSeason";
import {
  defaultCronicaId,
  isLegacyPreviaArticleId,
  matchIdFromPreviaArticleId,
} from "@/lib/match-article-factory";
import { isPrimerEquipoGender, primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";

export default async function MatchArticleDetailPage({
  params,
}: {
  params: Promise<{ gender: string; articleId: string }>;
}) {
  const { gender: genderParam, articleId } = await params;
  if (!isPrimerEquipoGender(genderParam)) notFound();
  const gender = genderParam as PrimerEquipoGender;

  if (articleId === "resumenes") notFound();

  const legacyMatchId = matchIdFromPreviaArticleId(articleId, gender);
  if (legacyMatchId !== null && isLegacyPreviaArticleId(articleId, gender)) {
    redirect(`${primerEquipoBase(gender)}/cronicas/${defaultCronicaId(legacyMatchId, gender)}` as Route);
  }

  return <MatchArticleDetailSeason gender={gender} articleId={articleId} />;
}
