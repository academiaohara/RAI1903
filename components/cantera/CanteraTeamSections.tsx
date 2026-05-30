"use client";

import { useState } from "react";
import { SubsectionFilterNav } from "@/components/SubsectionFilterNav";
import { LeagueTable } from "@/components/LeagueTable";
import { MatchCard } from "@/components/MatchCard";
import { FILIAL_TEAM_ID } from "@/lib/segunda-asturfutbol-2526";
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
  const highlightTeamId = team.id === "filial" ? FILIAL_TEAM_ID : undefined;

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
        <div className="space-y-3">
          {team.calendar.map((match) => (
            <MatchCard key={match.id} match={match} compact highlightTeamId={highlightTeamId} />
          ))}
        </div>
      )}

      {activeSection === "clasificacion" && (
        <LeagueTable teams={team.table} compact highlightTeamId={highlightTeamId} clubHighlightTeamId={highlightTeamId} />
      )}
    </div>
  );
}
