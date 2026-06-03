import { matchArticles } from "@/data/mock";
import type { SeasonBundlesMap, SeasonMatchArticlesBundle } from "@/lib/cms/season-bundles";
import { getMatchArticlesBundle } from "@/lib/cms/season-bundles";
import { ensureAvilesMatchArticles, normalizeMatchArticles } from "@/lib/match-article-factory";
import { getAvilesMatchesFromSource } from "@/lib/season/aviles-matches";
import { shouldUseMockCompetitionFallback } from "@/lib/season/cms-data-policy";
import { fixtureSourceFromBundles } from "@/lib/season/fixture-source";
import type { MatchArticle, PrimerEquipoGender } from "@/types";

const GENDERS: PrimerEquipoGender[] = ["masculino", "femenino"];

function mergeAvilesPlaceholders(bundles: SeasonBundlesMap, cmsArticles: MatchArticle[]): MatchArticle[] {
  let merged = normalizeMatchArticles(cmsArticles);
  for (const gender of GENDERS) {
    const source = fixtureSourceFromBundles(bundles, gender);
    const matches = getAvilesMatchesFromSource(source, gender);
    merged = ensureAvilesMatchArticles(merged, matches, gender);
  }
  return merged;
}

export function getMatchArticlesForSeason(bundles: SeasonBundlesMap): MatchArticle[] {
  const bundle = getMatchArticlesBundle(bundles);
  const cmsArticles = bundle?.articles;

  if (cmsArticles !== undefined) {
    return mergeAvilesPlaceholders(bundles, cmsArticles);
  }

  if (shouldUseMockCompetitionFallback()) {
    return normalizeMatchArticles(matchArticles);
  }

  return mergeAvilesPlaceholders(bundles, []);
}

export function getMatchArticlesForGender(bundles: SeasonBundlesMap, gender: PrimerEquipoGender) {
  return getMatchArticlesForSeason(bundles)
    .filter((article) => article.gender === gender)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

export function getMatchArticleForMatchFromBundles(
  bundles: SeasonBundlesMap,
  matchId: string,
  gender: PrimerEquipoGender = "masculino",
) {
  return getMatchArticlesForSeason(bundles).find(
    (article) => article.matchId === matchId && article.gender === gender,
  );
}

export function getCronicaForMatchFromBundles(
  bundles: SeasonBundlesMap,
  matchId: string,
  gender: PrimerEquipoGender = "masculino",
) {
  return getMatchArticleForMatchFromBundles(bundles, matchId, gender);
}

/** @deprecated Usar getMatchArticleForMatchFromBundles. */
export function getPreviaForMatchFromBundles(
  bundles: SeasonBundlesMap,
  matchId: string,
  gender: PrimerEquipoGender = "masculino",
) {
  return getMatchArticleForMatchFromBundles(bundles, matchId, gender);
}

export function seasonMatchArticlesBundlePayload(articles: MatchArticle[]): SeasonMatchArticlesBundle {
  return { articles: normalizeMatchArticles(articles) };
}
