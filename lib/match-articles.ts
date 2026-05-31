import { matchArticles, newsItems } from "@/data/mock";
import type { MatchArticle, NewsItem, PrimerEquipoGender } from "@/types";

export function getMatchArticles(gender: PrimerEquipoGender, type: MatchArticle["type"]) {
  return matchArticles
    .filter((article) => article.gender === gender && article.type === type)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getMatchArticleById(id: string) {
  return matchArticles.find((article) => article.id === id);
}

export function getCronicaForMatch(matchId: string, gender: PrimerEquipoGender = "masculino") {
  return matchArticles.find((article) => article.matchId === matchId && article.type === "cronica" && article.gender === gender);
}

export function getPreviaForMatch(matchId: string, gender: PrimerEquipoGender = "masculino") {
  return matchArticles.find((article) => article.matchId === matchId && article.type === "previa" && article.gender === gender);
}

export function getClubChronicleNews(article: MatchArticle, items: NewsItem[] = newsItems): NewsItem | null {
  if (!article.clubNewsId) return null;
  return items.find((item) => item.id === article.clubNewsId) ?? null;
}
