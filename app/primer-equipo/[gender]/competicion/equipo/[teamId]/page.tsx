import { EquipoLigaView } from "@/components/competicion/EquipoLigaView";
import { getAllTeamsForGender, getTeamByGender } from "@/lib/fixtures";
import { getTeamsForRfefGrupo, type RfefGrupoId } from "@/lib/rfef-grupos";
import { isPrimerEquipoGender, type PrimerEquipoGender } from "@/lib/primer-equipo";
import { notFound } from "next/navigation";

export default async function EquipoLigaPage({
  params,
}: {
  params: Promise<{ gender: string; teamId: string }>;
}) {
  const { gender: genderParam, teamId } = await params;

  if (!isPrimerEquipoGender(genderParam)) {
    notFound();
  }

  const gender = genderParam as PrimerEquipoGender;
  const team = getTeamByGender(teamId, gender);

  if (!team) {
    notFound();
  }

  const grupo: RfefGrupoId =
    gender === "masculino" && getTeamsForRfefGrupo("2").some((entry) => entry.id === teamId) ? "2" : "1";
  const allTeams = gender === "masculino" ? getTeamsForRfefGrupo(grupo) : getAllTeamsForGender(gender);

  return <EquipoLigaView gender={gender} team={team} allTeams={allTeams} />;
}
