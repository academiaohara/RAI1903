"use client";

import { useMemo } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import {
  getMatchArticleByIdFromBundles,
  getMatchArticlesForGender,
  getMatchArticleForMatchFromBundles,
} from "@/lib/season/match-articles-source";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { MatchArticle } from "@/types";

export function useSeasonMatchArticles() {
  const { bundles } = useSeason();

  return useMemo(
    () => ({
      getForGender: (gender: PrimerEquipoGender) => getMatchArticlesForGender(bundles, gender),
      getByType: (gender: PrimerEquipoGender, type: MatchArticle["type"]) =>
        getMatchArticlesForGender(bundles, gender).filter((article) => article.type === type),
      getById: (id: string) => getMatchArticleByIdFromBundles(bundles, id),
      getForMatch: (matchId: string, gender: PrimerEquipoGender = "masculino") =>
        getMatchArticleForMatchFromBundles(bundles, matchId, gender),
      getCronica: (matchId: string, gender: PrimerEquipoGender = "masculino") =>
        getMatchArticleForMatchFromBundles(bundles, matchId, gender),
      getPrevia: (matchId: string, gender: PrimerEquipoGender = "masculino") =>
        getMatchArticleForMatchFromBundles(bundles, matchId, gender),
    }),
    [bundles],
  );
}
