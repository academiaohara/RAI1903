"use client";

import { useMemo } from "react";
import { Card } from "@/components/Card";
import { TeamCalendar } from "@/components/TeamCalendar";
import { ExtraFixturesOnPageEditor } from "@/components/editor/ExtraFixturesOnPageEditor";
import { useEditedCalendarMatches } from "@/components/calendar/CalendarMatchEditor";
import { SectionUnderConstructionGate } from "@/components/season/SectionUnderConstructionGate";
import { useSeason } from "@/components/season/SeasonProvider";
import { useAllSeasonsCalendarMatches } from "@/hooks/useAllSeasonsCalendarMatches";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

type CalendarioSeasonViewProps = {
  gender: PrimerEquipoGender;
};

export function CalendarioSeasonView({ gender }: CalendarioSeasonViewProps) {
  const { viewedSeasonId } = useSeason();
  const { seasonMatches } = useAllSeasonsCalendarMatches(gender);

  const matches = useEditedCalendarMatches(seasonMatches, gender);

  const seasonIds = useMemo(() => [viewedSeasonId], [viewedSeasonId]);

  const played = matches.filter((match) => match.played).length;
  const upcoming = matches.length - played;

  return (
    <SectionUnderConstructionGate scope={gender} section="calendario">
    <Card eyebrow="Temporada" title="Partidos del equipo">
      <ExtraFixturesOnPageEditor gender={gender} />
      <div className="mb-6 flex flex-wrap gap-4 text-sm font-bold text-slate-600">
        <span>
          <span className="text-[#214C9B]">{matches.length}</span> partidos
        </span>
        <span>
          <span className="text-emerald-700">{played}</span> jugados
        </span>
        <span>
          <span className="text-[#981915]">{upcoming}</span> pendientes
        </span>
      </div>
      <TeamCalendar
        matches={matches}
        seasonIds={seasonIds}
        gender={gender}
        listOnly={gender === "femenino"}
        showVenue={gender !== "femenino"}
      />
    </Card>
    </SectionUnderConstructionGate>
  );
}
