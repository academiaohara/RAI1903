"use client";

import { useMemo } from "react";
import { Card } from "@/components/Card";
import { MatchArticleList } from "@/components/match-articles/MatchArticleList";
import { useSeason } from "@/components/season/SeasonProvider";
import { useSeasonMatchArticles } from "@/hooks/useSeasonMatchArticles";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

type CronicasSeasonPageProps = {
  gender: PrimerEquipoGender;
};

export function CronicasSeasonPage({ gender }: CronicasSeasonPageProps) {
  const { bundles } = useSeason();
  const { getForGender } = useSeasonMatchArticles();
  const articles = useMemo(
    () =>
      [...getForGender(gender)].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [gender, getForGender],
  );

  return (
    <Card>
      <MatchArticleList articles={articles} gender={gender} bundles={bundles} />
    </Card>
  );
}
