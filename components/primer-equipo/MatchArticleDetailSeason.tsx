"use client";

import { notFound } from "next/navigation";
import type { Route } from "next";
import { useMemo } from "react";
import { MatchCenter } from "@/components/match-center/MatchCenter";
import { useSeason } from "@/components/season/SeasonProvider";
import { useSeasonMatchArticles } from "@/hooks/useSeasonMatchArticles";
import { buildMatchDetail, getMatchForArticle } from "@/lib/match-detail";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import { findMatchInBundles } from "@/lib/season/find-match-in-bundles";

type MatchArticleDetailSeasonProps = {
  gender: PrimerEquipoGender;
  articleId: string;
};

export function MatchArticleDetailSeason({ gender, articleId }: MatchArticleDetailSeasonProps) {
  const { bundles } = useSeason();
  const { getById } = useSeasonMatchArticles();
  const article = getById(articleId);

  const detail = useMemo(() => {
    if (!article || article.gender !== gender) return null;
    const match = findMatchInBundles(bundles, article.matchId) ?? getMatchForArticle(article);
    if (!match) return null;
    return buildMatchDetail(match, article.gender);
  }, [article, bundles, gender]);

  if (!article || article.gender !== gender) notFound();
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
