import { CompeticionView } from "@/components/competicion/CompeticionView";
import { PrimerEquipoPageHero } from "@/components/PrimerEquipoPageHero";
import { RAI_FEM_TEAM_ID, RAI_TEAM_ID } from "@/data/mock";
import { getTeamsByGender } from "@/lib/fixtures";
import { genderLabels, type PrimerEquipoGender } from "@/lib/primer-equipo";

export default async function PrimerEquipoCompeticionPage({ params }: { params: Promise<{ gender: PrimerEquipoGender }> }) {
  const { gender } = await params;
  const teams = getTeamsByGender(gender);
  const highlightTeamId = gender === "femenino" ? RAI_FEM_TEAM_ID : RAI_TEAM_ID;

  return (
    <>
      <PrimerEquipoPageHero
        title="Competicion"
        description={`Guia de la liga, clasificacion en tu zona, resultados y plantillas rivales de ${genderLabels[gender].club}.`}
      />

      <CompeticionView gender={gender} teams={teams} highlightTeamId={highlightTeamId} />
    </>
  );
}
