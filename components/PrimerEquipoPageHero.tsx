import { PageHero } from "@/components/PageHero";

type PrimerEquipoPageHeroProps = {
  title: string;
  description: string;
  eyebrow?: string;
};

export function PrimerEquipoPageHero({ title, description, eyebrow }: PrimerEquipoPageHeroProps) {
  return <PageHero eyebrow={eyebrow} title={title} description={description} />;
}
