import { EquipoLigaView } from "@/components/competicion/EquipoLigaView";
import { canLinkEquipoLiga } from "@/lib/equipo-liga";
import { getAllTeamsForGender, getTeamByGender } from "@/lib/fixtures";
import { getTeamsForRfefGrupo } from "@/lib/rfef-grupos";
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

  if (!team || !canLinkEquipoLiga(gender, teamId)) {
    notFound();
  }

  const allTeams =
    gender === "masculino" ? getTeamsForRfefGrupo("1") : getAllTeamsForGender(gender);

  return <EquipoLigaView gender={gender} team={team} allTeams={allTeams} />;
}
