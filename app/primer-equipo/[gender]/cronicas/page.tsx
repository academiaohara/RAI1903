import { Card } from "@/components/Card";
import { MatchArticleList } from "@/components/match-articles/MatchArticleList";
import { PrimerEquipoPageHero } from "@/components/PrimerEquipoPageHero";
import { getMatchArticles } from "@/lib/match-articles";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

export default async function CronicasPage({ params }: { params: Promise<{ gender: PrimerEquipoGender }> }) {
  const { gender } = await params;
  const articles = getMatchArticles(gender, "cronica");

  return (
    <>
      <PrimerEquipoPageHero title="Crónicas" description="Resumenes de partidos disputados con lectura tactica y sensaciones del vestuario." />

      <Card>
        <MatchArticleList articles={articles} gender={gender} type="cronica" />
      </Card>
    </>
  );
}
