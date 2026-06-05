import { HomePageSections } from "@/components/home/HomePageSections";
import { PageHero } from "@/components/PageHero";
import { SeasonSelector } from "@/components/SeasonSelector";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <PageHero
        title="RAI1903"
        description="Inicio blanquiazul para seguir ultimo partido, proxima previa, clasificacion, forma, calendario, stats y noticiero."
        titleWrapperClassName="title-gear-rai-home"
        titleActions={<SeasonSelector className="border-[#214C9B]/20 sm:w-auto sm:shrink-0" />}
      />

      <HomePageSections />
    </div>
  );
}
