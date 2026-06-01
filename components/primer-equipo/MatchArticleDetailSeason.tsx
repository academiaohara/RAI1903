"use client";

import { notFound } from "next/navigation";
import type { Route } from "next";
import { MatchCenter } from "@/components/match-center/MatchCenter";
import { useSeasonMatchArticles } from "@/hooks/useSeasonMatchArticles";
import { getMatchDetailForArticle } from "@/lib/match-detail";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";

type MatchArticleDetailSeasonProps = {
  gender: PrimerEquipoGender;
  articleId: string;
};

export function MatchArticleDetailSeason({ gender, articleId }: MatchArticleDetailSeasonProps) {
  const { getById } = useSeasonMatchArticles();
  const article = getById(articleId);

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
