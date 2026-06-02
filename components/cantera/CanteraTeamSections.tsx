"use client";

import { useMemo, useState } from "react";
import { CanteraJornadasView } from "@/components/cantera/CanteraJornadasView";
import { CanteraSquadTable } from "@/components/cantera/CanteraSquadTable";
import { useFilialSeasonOptional } from "@/components/cantera/FilialSeasonContext";
import { SubsectionFilterNav } from "@/components/SubsectionFilterNav";
import { LeagueTable } from "@/components/LeagueTable";
import { TeamCalendar } from "@/components/TeamCalendar";
import {
  getCanteraPrimaryAvilesTeamId,
  getCanteraStandings,
  isCanteraClubTeam,
  matchesToCanteraCalendarMatches,
  type CanteraTeamId,
} from "@/lib/cantera-data";
import { getCanteraSquadImport } from "@/lib/cantera-squad";
import { academyTeams } from "@/data/mock";
const baseSections = [
  { id: "plantilla", label: "Plantilla" },
  { id: "calendario", label: "Calendario" },
  { id: "clasificacion", label: "Clasificacion" },
] as const;

const jornadasSection = { id: "jornadas", label: "Jornadas" } as const;

type BaseSectionId = (typeof baseSections)[number]["id"];
type SectionId = BaseSectionId | typeof jornadasSection.id;

type CanteraTeamSectionsProps = {
  teamId: CanteraTeamId;
};

export function CanteraTeamSections({ teamId }: CanteraTeamSectionsProps) {
  const isFilial = teamId === "filial";
  const filialSeason = useFilialSeasonOptional();
  const staticTeam = academyTeams.find((item) => item.id === teamId);

  const avilesTeamId = getCanteraPrimaryAvilesTeamId(teamId);
  const sections = useMemo(() => [...baseSections, jornadasSection] as const, []);

  const [activeSection, setActiveSection] = useState<SectionId>("plantilla");

  const coach = isFilial ? filialSeason!.squad.entrenador : staticTeam?.coach ?? "—";
  const category = isFilial ? filialSeason!.summary.category : staticTeam?.category ?? "";
  const seasonLabel = isFilial ? filialSeason!.seasonLabel : "2025/26";

  const standings = useMemo(() => {
    if (isFilial) return filialSeason!.standings;
    return getCanteraStandings(teamId);
  }, [filialSeason, isFilial, teamId]);

  const calendarMatches = useMemo(() => {
    const source = isFilial ? filialSeason!.calendar : staticTeam?.calendar ?? [];
    return matchesToCanteraCalendarMatches(source, avilesTeamId);
  }, [avilesTeamId, filialSeason, isFilial, staticTeam?.calendar]);

  if (!isFilial && !staticTeam) return null;
  if (isFilial && !filialSeason) return null;

  return (
    <div className="space-y-5">
      <SubsectionFilterNav
        items={sections.map((section) => section.id)}
        value={activeSection}
        onChange={setActiveSection}
        getLabel={(id) => sections.find((section) => section.id === id)?.label ?? id}
        ariaLabel="Secciones del equipo"
      />

      <p className="text-sm text-slate-600">
        <strong className="text-slate-900">Entrenador:</strong> {coach}
        {category ? (
          <>
            {" · "}
            <span className="text-slate-500">{category}</span>
          </>
        ) : null}
        {" · "}
        <span className="text-slate-500">Temporada {seasonLabel}</span>
      </p>

      {activeSection === "plantilla" && (
        <CanteraSquadTable
          teamId={teamId}
          squadImport={isFilial ? filialSeason!.squad : getCanteraSquadImport(teamId)}
          seasonLabel={seasonLabel}
        />
      )}

      {activeSection === "calendario" && (
        <TeamCalendar matches={calendarMatches} listOnly showCrests={false} showVenue={false} />
      )}

      {activeSection === "clasificacion" && (
        <LeagueTable
          teams={standings}
          compact={false}
          showCrests={false}
          showLegend
          highlightTeamId={avilesTeamId}
          isClubHighlight={(row) => isCanteraClubTeam(teamId, row.id, row.name)}
          zoneLegend={isFilial ? filialSeason!.zoneLegend : undefined}
        />
      )}

      {activeSection === "jornadas" && (
        <CanteraJornadasView
          teamId={teamId}
          filialMatches={isFilial ? filialSeason!.allMatches : undefined}
        />
      )}
    </div>
  );
}
