import { JornadasView } from "@/components/jornadas/JornadasView";
import { PrimerEquipoPageHero } from "@/components/PrimerEquipoPageHero";
import { genderLabels, type PrimerEquipoGender } from "@/lib/primer-equipo";

export default async function PrimerEquipoJornadasPage({ params }: { params: Promise<{ gender: PrimerEquipoGender }> }) {
  const { gender } = await params;

  return (
    <>
      <PrimerEquipoPageHero
        title="Jornadas"
        description={`Resultados por jornada de ${genderLabels[gender].club}: selector de fechas, partido destacado del blanquiazul y resto de la liga por grupos.`}
      />

      <JornadasView gender={gender} />
    </>
  );
}
