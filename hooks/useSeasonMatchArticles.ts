"use client";

import { useMemo } from "react";
import { useSeason } from "@/components/season/SeasonProvider";
import {
  getCronicaForMatchFromBundles,
  getMatchArticleByIdFromBundles,
  getMatchArticlesByType,
  getPreviaForMatchFromBundles,
} from "@/lib/season/match-articles-source";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { MatchArticle } from "@/types";

export function useSeasonMatchArticles() {
  const { bundles } = useSeason();

  return useMemo(
    () => ({
      getByType: (gender: PrimerEquipoGender, type: MatchArticle["type"]) =>
        getMatchArticlesByType(bundles, gender, type),
      getById: (id: string) => getMatchArticleByIdFromBundles(bundles, id),
      getCronica: (matchId: string, gender: PrimerEquipoGender = "masculino") =>
        getCronicaForMatchFromBundles(bundles, matchId, gender),
      getPrevia: (matchId: string, gender: PrimerEquipoGender = "masculino") =>
        getPreviaForMatchFromBundles(bundles, matchId, gender),
    }),
    [bundles],
  );
}
