import type { Route } from "next";
import { redirect } from "next/navigation";
import { CronicasSeasonPage } from "@/components/primer-equipo/CronicasSeasonPage";
import { PrimerEquipoPageHero } from "@/components/PrimerEquipoPageHero";
import { primerEquipoBase, primerEquipoHasCronicas, type PrimerEquipoGender } from "@/lib/primer-equipo";

export default async function CronicasPage({ params }: { params: Promise<{ gender: PrimerEquipoGender }> }) {
  const { gender } = await params;
  if (!primerEquipoHasCronicas(gender)) {
    redirect(`${primerEquipoBase(gender)}/plantilla` as Route);
  }

  return (
    <>
      <PrimerEquipoPageHero
        title="Crónicas"
        description="Crónicas de partidos disputados y previas de los encuentros por jugar."
      />

      <CronicasSeasonPage gender={gender} />
    </>
  );
}
