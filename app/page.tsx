import { HomePageSections } from "@/components/home/HomePageSections";
import { PageHero } from "@/components/PageHero";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <PageHero
        title="RAI1903"
        description="Inicio blanquiazul para seguir ultimo partido, proxima previa, clasificacion, forma, calendario, stats y noticiero."
        titleWrapperClassName="title-gear-rai-home"
      />

      <HomePageSections />
    </div>
  );
}
