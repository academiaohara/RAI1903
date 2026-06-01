"use client";

import { useMemo } from "react";
import { Card } from "@/components/Card";
import { MatchArticleList } from "@/components/match-articles/MatchArticleList";
import { useSeasonMatchArticles } from "@/hooks/useSeasonMatchArticles";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { MatchArticle } from "@/types";

type CronicasSeasonPageProps = {
  gender: PrimerEquipoGender;
};

function sortArticles(articles: MatchArticle[]) {
  return [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function CronicasSeasonPage({ gender }: CronicasSeasonPageProps) {
  const { getByType } = useSeasonMatchArticles();
  const articles = useMemo(
    () => sortArticles([...getByType(gender, "cronica"), ...getByType(gender, "previa")]),
    [gender, getByType],
  );

  return (
    <Card>
      <MatchArticleList articles={articles} gender={gender} />
    </Card>
  );
}
