import { CompeticionView } from "@/components/competicion/CompeticionView";
import { PrimerEquipoPageHero } from "@/components/PrimerEquipoPageHero";
import { RAI_FEM_TEAM_ID, RAI_TEAM_ID } from "@/data/mock";
import { getLeagueMatchdaysResolved, getStandingsTeamsResolved } from "@/lib/football-data";
import { hasFootballDataInSupabase } from "@/lib/football-supabase";
import { genderLabels, type PrimerEquipoGender } from "@/lib/primer-equipo";

export default async function PrimerEquipoCompeticionPage({ params }: { params: Promise<{ gender: PrimerEquipoGender }> }) {
  const { gender } = await params;
  const highlightTeamId = gender === "femenino" ? RAI_FEM_TEAM_ID : RAI_TEAM_ID;

  const supabaseMatchdays =
    gender === "masculino" && (await hasFootballDataInSupabase()) ? await getLeagueMatchdaysResolved() : undefined;
  const supabaseTeams =
    gender === "masculino" && supabaseMatchdays?.length ? await getStandingsTeamsResolved() : undefined;

  return (
    <>
      <PrimerEquipoPageHero
        title="Competición"
        description={`Guia de la liga, clasificacion completa, resultados y fichas de rivales de ${genderLabels[gender].club}.`}
      />

      <CompeticionView
        gender={gender}
        highlightTeamId={highlightTeamId}
        supabaseMatchdays={supabaseMatchdays ?? undefined}
        supabaseTeams={supabaseTeams ?? undefined}
      />
    </>
  );
}
