import { HomeTransfersGate } from "@/components/fichajes/HomeTransfersGate";
import { HomeCompetitionSection } from "@/components/home/HomeCompetitionSection";
import { HomeNewsTicker } from "@/components/home/HomeNewsTicker";
import { Card } from "@/components/Card";
import { NewsNavButton } from "@/components/NewsNavButton";
import { PageHero } from "@/components/PageHero";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <PageHero
        title="RAI1903"
        description="Inicio blanquiazul para seguir ultimo partido, proxima previa, clasificacion, forma, calendario, stats y noticiero."
        titleWrapperClassName="title-gear-rai-home"
      />

      <HomeCompetitionSection />

      <Card
        eyebrow="Noticiero"
        title="Actualidad en movimiento"
        action={<NewsNavButton href="/noticias/club" />}
      >
        <HomeNewsTicker />
      </Card>

      <HomeTransfersGate />
    </div>
  );
}
