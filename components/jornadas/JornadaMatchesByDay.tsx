"use client";

import { JornadaMatchRow } from "@/components/jornadas/JornadaMatchRow";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { RfefGrupoId } from "@/lib/rfef-grupos";
import type { JornadaDayGroup } from "@/lib/jornadas-data";

type JornadaMatchesByDayProps = {
  groups: JornadaDayGroup[];
  highlightTeamId: string;
  gender: PrimerEquipoGender;
  showCrests?: boolean;
  grupo?: RfefGrupoId;
};

export function JornadaMatchesByDay({
  groups,
  highlightTeamId,
  gender,
  showCrests = true,
  grupo = "1",
}: JornadaMatchesByDayProps) {
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
              <JornadaMatchRow
                key={fixture.id}
                fixture={fixture}
                highlighted={fixture.involvesRai}
                highlightTeamId={highlightTeamId}
                gender={gender}
                showCrests={showCrests}
                grupo={fixture.grupo ?? grupo}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
