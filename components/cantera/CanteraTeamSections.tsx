"use client";

import { useMemo, useState } from "react";
import { SubsectionFilterNav } from "@/components/SubsectionFilterNav";
import { LeagueTable } from "@/components/LeagueTable";
import { TeamCalendar } from "@/components/TeamCalendar";
import {
  getCanteraPrimaryAvilesTeamId,
  isCanteraClubTeam,
  matchesToCanteraCalendarMatches,
  type CanteraTeamId,
} from "@/lib/cantera-data";
import type { AcademyTeam } from "@/types";

const sections = [
  { id: "plantilla", label: "Plantilla" },
  { id: "calendario", label: "Calendario" },
  { id: "clasificacion", label: "Clasificacion" },
] as const;

type SectionId = (typeof sections)[number]["id"];

type CanteraTeamSectionsProps = {
  team: AcademyTeam;
};

export function CanteraTeamSections({ team }: CanteraTeamSectionsProps) {
  const [activeSection, setActiveSection] = useState<SectionId>("plantilla");
  const canteraTeamId = team.id as CanteraTeamId;
  const avilesTeamId = getCanteraPrimaryAvilesTeamId(canteraTeamId);

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
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {team.roster.map((player) => (
            <div key={player.id} className="rounded-2xl border border-[#214C9B]/15 bg-blue-50 p-3">
              <p className="font-extrabold uppercase text-[#214C9B]">
                #{player.number} {player.displayName}
              </p>
              <p className="text-sm font-bold text-slate-500">
                {player.position} · {player.age} años
              </p>
            </div>
          ))}
        </div>
      )}

      {activeSection === "calendario" && (
        <TeamCalendar matches={calendarMatches} listOnly showCrests={false} />
      )}

      {activeSection === "clasificacion" && (
        <LeagueTable
          teams={team.table}
          compact={false}
          showCrests={false}
          showLegend={false}
          highlightTeamId={avilesTeamId}
          isClubHighlight={(row) => isCanteraClubTeam(canteraTeamId, row.id, row.name)}
        />
      )}
    </div>
  );
}
