import { PageHero } from "@/components/PageHero";
import { SeasonSelector } from "@/components/SeasonSelector";

type PrimerEquipoPageHeroProps = {
  title: string;
  description: string;
  eyebrow?: string;
  compactTitle?: boolean;
  compactSeasonSelector?: boolean;
};

export function PrimerEquipoPageHero({
  title,
  description,
  eyebrow,
  compactTitle = false,
  compactSeasonSelector = false,
}: PrimerEquipoPageHeroProps) {
  return (
    <PageHero
      eyebrow={eyebrow}
      title={title}
      description={description}
      titleSize={compactTitle ? "compact" : "default"}
      titleActions={
        <SeasonSelector
          compact={compactSeasonSelector}
          className="border-[#214C9B]/15 bg-[#214C9B]/5 sm:w-auto sm:shrink-0"
        />
      }
    />
  );
}
