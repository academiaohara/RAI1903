import Link from "next/link";
import { Card } from "@/components/Card";
import { EquipoLigaSquad } from "@/components/competicion/EquipoLigaSquad";
import { EquipoLigaTeamSummary } from "@/components/competicion/EquipoLigaTeamSummary";
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
  /** Grupo II y similares: sin plantilla de jugadores, solo datos básicos + clasificación. */
  showDetailedSquad?: boolean;
};

export function EquipoLigaView({ gender, team, allTeams, showDetailedSquad = true }: EquipoLigaViewProps) {
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

      {showDetailedSquad ? (
        <EquipoLigaSquad gender={gender} team={team} />
      ) : (
        <EquipoLigaTeamSummary team={team} />
      )}

      <Card eyebrow="Clasificacion" title="Tu zona en la liga" borderlessHeader>
        <LeagueTable
          teams={windowTeams}
          highlightTeamId={team.id}
          clubHighlightTeamId={clubHighlightTeamId}
          compact
          showLegend={false}
          gender={gender}
        />
      </Card>
    </div>
  );
}
