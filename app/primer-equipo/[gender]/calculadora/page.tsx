import { LeagueCalculatorView } from "@/components/competicion/LeagueCalculatorView";
import { PrimerEquipoPageHero } from "@/components/PrimerEquipoPageHero";
import { notFound } from "next/navigation";
import { genderLabels, type PrimerEquipoGender } from "@/lib/primer-equipo";

export default async function PrimerEquipoCalculadoraPage({
  params,
}: {
  params: Promise<{ gender: PrimerEquipoGender }>;
}) {
  const { gender } = await params;
  if (gender !== "masculino") notFound();

  return (
    <>
      <PrimerEquipoPageHero
        title="Calculadora"
        description={`Simula los resultados que queden por jugar en ${genderLabels.masculino.club} y proyecta la clasificacion final del Grupo I.`}
        compactTitle
        compactSeasonSelector
      />

      <LeagueCalculatorView />
    </>
  );
}
