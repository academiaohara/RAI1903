import { notFound } from "next/navigation";
import { MatchCenter } from "@/components/match-center/MatchCenter";
import { getMatchDetailForArticle } from "@/lib/match-detail";
import { getMatchArticleById } from "@/lib/match-articles";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Route } from "next";

export default async function MatchArticleDetailPage({
  params,
}: {
  params: Promise<{ gender: PrimerEquipoGender; articleId: string }>;
}) {
  const { gender, articleId } = await params;
  const article = getMatchArticleById(articleId);

  if (articleId === "resumenes") notFound();
  if (!article || article.gender !== gender) notFound();
  if (article.type !== "cronica" && article.type !== "previa") notFound();

  const detail = getMatchDetailForArticle(article);
  if (!detail) notFound();

  return (
    <MatchCenter
      detail={detail}
      article={article}
      backHref={`${primerEquipoBase(gender)}/cronicas` as Route}
      backLabel="Volver a crónicas"
    />
  );
}
