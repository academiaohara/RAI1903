"use client";

import { CanteraJornadaMatchRow } from "@/components/cantera/CanteraJornadaMatchRow";
import { groupFixturesByCalendarDay } from "@/lib/jornadas-data";
import type { JornadaFixture } from "@/types/jornadas";

type CanteraJornadaMatchesByDayProps = {
  fixtures: JornadaFixture[];
  highlightTeamId: string;
};

export function CanteraJornadaMatchesByDay({ fixtures, highlightTeamId }: CanteraJornadaMatchesByDayProps) {
  const groups = groupFixturesByCalendarDay(fixtures);

  if (groups.length === 0) {
    return <p className="text-sm font-bold text-slate-500">No hay partidos disponibles para esta jornada.</p>;
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.dayKey} className="space-y-3">
          <h3 className="text-base font-extrabold text-[#214C9B] sm:text-lg">{group.heading}</h3>
          <div className="space-y-2">
            {group.fixtures.map((fixture) => (
              <CanteraJornadaMatchRow
                key={fixture.id}
                fixture={fixture}
                highlighted={fixture.involvesRai}
                highlightTeamId={highlightTeamId}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
