import { notFound } from "next/navigation";
import { MatchCenter } from "@/components/match-center/MatchCenter";
import { getMatchDetailForArticle } from "@/lib/match-detail";
import { getMatchArticleById } from "@/lib/match-articles";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Route } from "next";

export default async function CronicaDetailPage({ params }: { params: Promise<{ gender: PrimerEquipoGender; articleId: string }> }) {
  const { gender, articleId } = await params;
  const article = getMatchArticleById(articleId);

  if (!article || article.type !== "cronica" || article.gender !== gender) notFound();

  const detail = getMatchDetailForArticle(article);
  if (!detail) notFound();

  return (
    <MatchCenter
      detail={detail}
      article={article}
      backHref={`${primerEquipoBase(gender)}/cronicas` as Route}
      backLabel="Volver a cronicas"
    />
  );
}
