import Link from "next/link";
import { Card } from "@/components/Card";
import { EquipoLigaTeamInfo } from "@/components/competicion/EquipoLigaTeamInfo";
import { EquipoLigaSquad } from "@/components/competicion/EquipoLigaSquad";
import { LeagueTable } from "@/components/LeagueTable";
import { StandingsEvolutionChart } from "@/components/squad/StandingsEvolutionChart";
import { RAI_FEM_TEAM_ID, RAI_TEAM_ID } from "@/data/mock";
import { getLeagueZoneStandingsWindow } from "@/lib/standings-window";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import type { RfefGrupoId } from "@/lib/rfef-grupos";
import type { StandingsZonesConfig } from "@/lib/standings";
import type { Route } from "next";
import type { Matchday, Team } from "@/types";
import type { LeagueTiebreakContext } from "@/lib/rfef-rules/types";

type EquipoLigaViewProps = {
  gender: PrimerEquipoGender;
  team: Team;
  grupo?: RfefGrupoId;
  allTeams: Team[];
  leagueMatchdays: Matchday[];
  standingsZones: StandingsZonesConfig;
  tiebreak: LeagueTiebreakContext;
  evolutionSubtitle: string;
};

export function EquipoLigaView({
  gender,
  team,
  grupo,
  allTeams,
  leagueMatchdays,
  standingsZones,
  tiebreak,
  evolutionSubtitle,
}: EquipoLigaViewProps) {
  const windowTeams = getLeagueZoneStandingsWindow(allTeams, team.id);
  const clubHighlightTeamId = gender === "femenino" ? RAI_FEM_TEAM_ID : RAI_TEAM_ID;
  const backHref = `${primerEquipoBase(gender)}/competicion` as Route;

  const showSquad = gender === "masculino" && grupo === "1";

  return (
    <div className="space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-bold text-[#214C9B] transition hover:text-[#981915]"
      >
        ← Volver a competicion
      </Link>

      <EquipoLigaTeamInfo gender={gender} team={team} />

      {showSquad ? (
        <Card eyebrow="Plantilla" title={`Jugadores · ${team.shortName ?? team.name}`} borderlessHeader>
          <EquipoLigaSquad gender={gender} team={team} grupo={grupo} leagueMatchdays={leagueMatchdays} />
        </Card>
      ) : null}

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

      <StandingsEvolutionChart
        teamId={team.id}
        gender={gender}
        teams={allTeams}
        matchdays={leagueMatchdays}
        zones={standingsZones}
        tiebreak={tiebreak}
        subtitle={evolutionSubtitle}
      />
    </div>
  );
}
