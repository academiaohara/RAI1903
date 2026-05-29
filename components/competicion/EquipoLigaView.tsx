import Link from "next/link";
import { Card } from "@/components/Card";
import { EquipoLigaSquad } from "@/components/competicion/EquipoLigaSquad";
import { LeagueTable } from "@/components/LeagueTable";
import { RAI_FEM_TEAM_ID, RAI_TEAM_ID } from "@/data/mock";
import { getLeagueZoneStandingsWindow } from "@/lib/standings-window";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Route } from "next";
import type { Team } from "@/types";

type EquipoLigaViewProps = {
  gender: PrimerEquipoGender;
  team: Team;
  allTeams: Team[];
};

export function EquipoLigaView({ gender, team, allTeams }: EquipoLigaViewProps) {
  const windowTeams = getLeagueZoneStandingsWindow(allTeams, team.id);
  const clubHighlightTeamId = gender === "femenino" ? RAI_FEM_TEAM_ID : RAI_TEAM_ID;
  const backHref = `${primerEquipoBase(gender)}/competicion` as Route;

  return (
    <div className="space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-bold text-[#214C9B] transition hover:text-[#981915]"
      >
        ← Volver a competicion
      </Link>

      <EquipoLigaSquad gender={gender} team={team} />

      <Card eyebrow="Clasificacion" title="Tu zona en la liga" borderlessHeader>
        <LeagueTable
          teams={windowTeams}
          highlightTeamId={team.id}
          clubHighlightTeamId={clubHighlightTeamId}
          compact
          showLegend={false}
        />
      </Card>
    </div>
  );
}
