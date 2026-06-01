import { matchArticles } from "@/data/mock";
import type { SeasonBundlesMap, SeasonMatchArticlesBundle } from "@/lib/cms/season-bundles";
import { shouldUseMockCompetitionFallback } from "@/lib/season/cms-data-policy";
import { getMatchArticlesBundle } from "@/lib/cms/season-bundles";
import type { MatchArticle, PrimerEquipoGender } from "@/types";

export function getMatchArticlesForSeason(bundles: SeasonBundlesMap): MatchArticle[] {
  const bundle = getMatchArticlesBundle(bundles);
  if (bundle?.articles?.length) return bundle.articles;
  return shouldUseMockCompetitionFallback() ? matchArticles : [];
}

export function getMatchArticlesByType(
  bundles: SeasonBundlesMap,
  gender: PrimerEquipoGender,
  type: MatchArticle["type"],
) {
  return getMatchArticlesForSeason(bundles)
    .filter((article) => article.gender === gender && article.type === type)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getMatchArticleByIdFromBundles(bundles: SeasonBundlesMap, id: string) {
  return getMatchArticlesForSeason(bundles).find((article) => article.id === id);
}

export function getCronicaForMatchFromBundles(
  bundles: SeasonBundlesMap,
  matchId: string,
  gender: PrimerEquipoGender = "masculino",
) {
  return getMatchArticlesForSeason(bundles).find(
    (article) => article.matchId === matchId && article.type === "cronica" && article.gender === gender,
  );
}

export function getPreviaForMatchFromBundles(
  bundles: SeasonBundlesMap,
  matchId: string,
  gender: PrimerEquipoGender = "masculino",
) {
  return getMatchArticlesForSeason(bundles).find(
    (article) => article.matchId === matchId && article.type === "previa" && article.gender === gender,
  );
}

export function seasonMatchArticlesBundlePayload(articles: MatchArticle[]): SeasonMatchArticlesBundle {
  return { articles };
}
