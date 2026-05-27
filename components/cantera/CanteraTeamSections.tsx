"use client";

import { useState } from "react";
import { LeagueTable } from "@/components/LeagueTable";
import { MatchCard } from "@/components/MatchCard";
import { cn } from "@/lib/utils";
import type { AcademyTeam } from "@/types";

const sectionShellClassName =
  "rounded-3xl border border-[#214C9B]/20 bg-white p-3 shadow-[0_12px_30px_rgba(17,24,39,0.06)] no-scrollbar flex gap-2 overflow-x-auto";

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

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600">
        <strong className="text-slate-900">Entrenador:</strong> {team.coach}
      </p>

      <nav className={sectionShellClassName} aria-label="Secciones del equipo">
        {sections.map((section) => {
          const active = activeSection === section.id;
          return (
            <button
              key={section.id}
              type="button"
              aria-pressed={active}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "min-w-fit rounded-2xl border px-4 py-3 text-sm font-bold uppercase tracking-normal transition",
                active
                  ? "border-[#214C9B] bg-[#214C9B] text-white shadow-md shadow-blue-950/10"
                  : "border-[#214C9B]/15 bg-white text-[#214C9B] hover:border-[#214C9B] hover:bg-blue-50",
              )}
            >
              {section.label}
            </button>
          );
        })}
      </nav>

      {activeSection === "plantilla" && (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {team.roster.map((player) => (
            <div key={player.id} className="rounded-2xl border border-[#214C9B]/15 bg-blue-50 p-3">
              <p className="font-extrabold uppercase text-[#214C9B]">
                #{player.number} {player.displayName}
              </p>
              <p className="text-sm font-bold text-slate-500">
                {player.position} · {player.age} anos
              </p>
            </div>
          ))}
        </div>
      )}

      {activeSection === "calendario" && (
        <div className="space-y-3">
          {team.calendar.map((match) => (
            <MatchCard key={match.id} match={match} compact />
          ))}
        </div>
      )}

      {activeSection === "clasificacion" && <LeagueTable teams={team.table} compact />}
    </div>
  );
}
