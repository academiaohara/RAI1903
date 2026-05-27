import { PageHero } from "@/components/PageHero";
import { PrimerEquipoHeaderActions } from "@/components/PrimerEquipoHeaderActions";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

type PrimerEquipoPageHeroProps = {
  gender: PrimerEquipoGender;
  title: string;
  description: string;
  eyebrow?: string;
};

export function PrimerEquipoPageHero({ gender, title, description, eyebrow }: PrimerEquipoPageHeroProps) {
  return (
    <PageHero
      eyebrow={eyebrow}
      title={title}
      description={description}
      titleActions={<PrimerEquipoHeaderActions gender={gender} />}
    />
  );
}
