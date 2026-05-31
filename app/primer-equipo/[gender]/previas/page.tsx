import { Card } from "@/components/Card";
import { MatchArticleList } from "@/components/match-articles/MatchArticleList";
import { PrimerEquipoPageHero } from "@/components/PrimerEquipoPageHero";
import { getMatchArticles } from "@/lib/match-articles";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

export default async function PreviasPage({ params }: { params: Promise<{ gender: PrimerEquipoGender }> }) {
  const { gender } = await params;
  const articles = getMatchArticles(gender, "previa");

  return (
    <>
      <PrimerEquipoPageHero title="Previas" description="Analisis previos a cada jornada con forma reciente, claves tacticas y estado de la plantilla." />

      <Card>
        <MatchArticleList articles={articles} gender={gender} type="previa" />
      </Card>
    </>
  );
}
