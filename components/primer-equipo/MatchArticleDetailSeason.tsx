"use client";

import { notFound } from "next/navigation";
import type { Route } from "next";
import { useCallback, useMemo } from "react";
import { MatchCenter } from "@/components/match-center/MatchCenter";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useSeason } from "@/components/season/SeasonProvider";
import { useSeasonMatchArticles } from "@/hooks/useSeasonMatchArticles";
import { getTeamsBundle, resolveFixtureTeamDisplayName } from "@/lib/cms/teams-bundle";
import { applyMatchInlineOverride } from "@/lib/fixture-overrides";
import {
  buildPlaceholderCronica,
  buildPlaceholderUpcomingMatch,
  matchIdFromCronicaArticleId,
} from "@/lib/match-article-factory";
import { buildMatchDetail, getMatchForArticle } from "@/lib/match-detail";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import { findMatchInFixtureSource } from "@/lib/season/find-match-in-bundles";
import { getLeagueMatchdaysForGender } from "@/lib/season/aviles-matches";

type MatchArticleDetailSeasonProps = {
  gender: PrimerEquipoGender;
  articleId: string;
};

export function MatchArticleDetailSeason({ gender, articleId }: MatchArticleDetailSeasonProps) {
  const { bundles, bundlesLoading, getEnrichedFixtureSource } = useSeason();
  const { getOverride } = useInlineEditing();
  const { getById } = useSeasonMatchArticles();
  const cmsTeams = useMemo(() => getTeamsBundle(bundles, gender)?.teams ?? [], [bundles, gender]);
  const resolveTeamName = useMemo(
    () => (teamId: string, fallback: string) =>
      resolveFixtureTeamDisplayName(teamId, fallback, cmsTeams, bundles, gender),
    [bundles, cmsTeams, gender],
  );
  const mapMatch = useCallback(
    (match: Parameters<typeof applyMatchInlineOverride>[0]) =>
      applyMatchInlineOverride(match, getOverride, gender, resolveTeamName),
    [gender, getOverride, resolveTeamName],
  );
  const fixtureSource = useMemo(() => getEnrichedFixtureSource(gender), [gender, getEnrichedFixtureSource]);

  const findMatch = useCallback(
    (matchId: string) => findMatchInFixtureSource(fixtureSource, matchId, gender, mapMatch),
    [fixtureSource, gender, mapMatch],
  );

  const article = useMemo(() => {
    const fromBundles = getById(articleId);
    if (fromBundles) return fromBundles;

    const matchId = matchIdFromCronicaArticleId(articleId, gender);
    if (!matchId) return undefined;

    const match = findMatch(matchId);
    if (!match) return undefined;

    return match.status === "finished"
      ? buildPlaceholderCronica(match, gender)
      : buildPlaceholderUpcomingMatch(match, gender);
  }, [articleId, findMatch, gender, getById]);

  const leagueMatchdays = useMemo(
    () => getLeagueMatchdaysForGender(getEnrichedFixtureSource(gender), gender),
    [gender, getEnrichedFixtureSource],
  );

  const detail = useMemo(() => {
    if (!article || article.gender !== gender) return null;
    const match = findMatch(article.matchId) ?? getMatchForArticle(article);
    if (!match) return null;
    return buildMatchDetail(match, article.gender, { leagueMatchdays });
  }, [article, findMatch, gender, leagueMatchdays]);

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
      backHref={`${primerEquipoBase(gender)}/calendario` as Route}
      backLabel="Volver al calendario"
    />
  );
}
