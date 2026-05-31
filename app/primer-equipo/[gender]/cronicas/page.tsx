import { Card } from "@/components/Card";
import { MatchArticleList } from "@/components/match-articles/MatchArticleList";
import { PrimerEquipoPageHero } from "@/components/PrimerEquipoPageHero";
import { getMatchArticles } from "@/lib/match-articles";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { MatchArticle } from "@/types";

function sortArticles(articles: MatchArticle[]) {
  return [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export default async function CronicasPage({ params }: { params: Promise<{ gender: PrimerEquipoGender }> }) {
  const { gender } = await params;
  const articles = sortArticles([
    ...getMatchArticles(gender, "cronica"),
    ...getMatchArticles(gender, "previa"),
  ]);

  return (
    <>
      <PrimerEquipoPageHero
        title="Crónicas"
        description="Resúmenes de partidos disputados y previas de los encuentros por jugar."
      />

      <Card>
        <MatchArticleList articles={articles} gender={gender} />
      </Card>
    </>
  );
}
