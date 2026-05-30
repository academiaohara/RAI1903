"use client";

import { useMemo, useState } from "react";
import { CanteraJornadasView } from "@/components/cantera/CanteraJornadasView";
import { CanteraRosterTable } from "@/components/cantera/CanteraRosterTable";
import { FILIAL_AVILES_B_AVERAGE_AGE } from "@/data/filial-real-aviles-b-squad";
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
import type { AcademyTeam } from "@/types";

const baseSections = [
  { id: "plantilla", label: "Plantilla" },
  { id: "calendario", label: "Calendario" },
  { id: "clasificacion", label: "Clasificacion" },
] as const;

const jornadasSection = { id: "jornadas", label: "Jornadas" } as const;

type BaseSectionId = (typeof baseSections)[number]["id"];
type SectionId = BaseSectionId | typeof jornadasSection.id;

type CanteraTeamSectionsProps = {
  team: AcademyTeam;
};

export function CanteraTeamSections({ team }: CanteraTeamSectionsProps) {
  const canteraTeamId = team.id as CanteraTeamId;
  const avilesTeamId = getCanteraPrimaryAvilesTeamId(canteraTeamId);
  const sections = useMemo(
    () => [...baseSections, jornadasSection] as const,
    [],
  );

  const [activeSection, setActiveSection] = useState<SectionId>("plantilla");

  const standings = useMemo(() => getCanteraStandings(canteraTeamId), [canteraTeamId]);

  const calendarMatches = useMemo(
    () => matchesToCanteraCalendarMatches(team.calendar, avilesTeamId),
    [team.calendar, avilesTeamId],
  );

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
        <strong className="text-slate-900">Entrenador:</strong> {team.coach}
      </p>

      {activeSection === "plantilla" && (
        <CanteraRosterTable
          roster={team.roster}
          averageAge={canteraTeamId === "filial" ? FILIAL_AVILES_B_AVERAGE_AGE : undefined}
        />
      )}

      {activeSection === "calendario" && (
        <TeamCalendar matches={calendarMatches} listOnly showCrests={false} />
      )}

      {activeSection === "clasificacion" && (
        <LeagueTable
          teams={standings}
          compact={false}
          showCrests={false}
          showLegend={false}
          highlightTeamId={avilesTeamId}
          isClubHighlight={(row) => isCanteraClubTeam(canteraTeamId, row.id, row.name)}
        />
      )}

      {activeSection === "jornadas" && <CanteraJornadasView teamId={canteraTeamId} />}
    </div>
  );
}
