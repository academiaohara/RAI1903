import { CalendarioSeasonView } from "@/components/primer-equipo/CalendarioSeasonView";
import { PrimerEquipoPageHero } from "@/components/PrimerEquipoPageHero";
import { genderLabels, type PrimerEquipoGender } from "@/lib/primer-equipo";

export default async function PrimerEquipoCalendarioPage({ params }: { params: Promise<{ gender: PrimerEquipoGender }> }) {
  const { gender } = await params;

  return (
    <>
      <PrimerEquipoPageHero
        title="Calendario"
        description={`Calendario completo de ${genderLabels[gender].club}: partidos jugados y pendientes.`}
      />

      <CalendarioSeasonView gender={gender} />
    </>
  );
}
