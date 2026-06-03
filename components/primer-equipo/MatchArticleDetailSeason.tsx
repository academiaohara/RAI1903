"use client";

import { notFound } from "next/navigation";
import type { Route } from "next";
import { useMemo } from "react";
import { MatchCenter } from "@/components/match-center/MatchCenter";
import { useSeason } from "@/components/season/SeasonProvider";
import { useSeasonMatchArticles } from "@/hooks/useSeasonMatchArticles";
import {
  buildPlaceholderCronica,
  buildPlaceholderUpcomingMatch,
  matchIdFromCronicaArticleId,
} from "@/lib/match-article-factory";
import { buildMatchDetail, getMatchForArticle } from "@/lib/match-detail";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import { findMatchInBundles } from "@/lib/season/find-match-in-bundles";

type MatchArticleDetailSeasonProps = {
  gender: PrimerEquipoGender;
  articleId: string;
};

export function MatchArticleDetailSeason({ gender, articleId }: MatchArticleDetailSeasonProps) {
  const { bundles, bundlesLoading } = useSeason();
  const { getById } = useSeasonMatchArticles();

  const article = useMemo(() => {
    const fromBundles = getById(articleId);
    if (fromBundles) return fromBundles;

    const matchId = matchIdFromCronicaArticleId(articleId, gender);
    if (!matchId) return undefined;

    const match = findMatchInBundles(bundles, matchId);
    if (!match) return undefined;

    return match.status === "finished"
      ? buildPlaceholderCronica(match, gender)
      : buildPlaceholderUpcomingMatch(match, gender);
  }, [articleId, bundles, gender, getById]);

  const detail = useMemo(() => {
    if (!article || article.gender !== gender) return null;
    const match = findMatchInBundles(bundles, article.matchId) ?? getMatchForArticle(article);
    if (!match) return null;
    return buildMatchDetail(match, article.gender);
  }, [article, bundles, gender]);

  if (bundlesLoading) {
    return (
      <p className="rounded-2xl border border-dashed border-[#214C9B]/20 bg-slate-50/80 p-6 text-sm font-bold text-slate-600">
        Cargando ficha del partido…
      </p>
    );
  }

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
