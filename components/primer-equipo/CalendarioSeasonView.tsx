"use client";

import { useMemo } from "react";
import { Card } from "@/components/Card";
import { TeamCalendar } from "@/components/TeamCalendar";
import { useEditedCalendarMatches } from "@/components/calendar/CalendarMatchEditor";
import { useSeason } from "@/components/season/SeasonProvider";
import { useAllSeasonsCalendarMatches } from "@/hooks/useAllSeasonsCalendarMatches";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

type CalendarioSeasonViewProps = {
  gender: PrimerEquipoGender;
};

export function CalendarioSeasonView({ gender }: CalendarioSeasonViewProps) {
  const { seasons } = useSeason();
  const { allMatches, seasonMatches, loading } = useAllSeasonsCalendarMatches(gender);

  const monthMatches = useEditedCalendarMatches(allMatches, gender);
  const listMatches = useEditedCalendarMatches(seasonMatches, gender);

  const seasonIds = useMemo(() => {
    const published = seasons.filter((row) => row.published);
    const list = published.length ? published : seasons;
    return list.map((row) => row.id);
  }, [seasons]);

  const played = listMatches.filter((match) => match.played).length;
  const upcoming = listMatches.length - played;

  return (
    <Card eyebrow="Temporada" title="Partidos del equipo">
      <div className="mb-6 flex flex-wrap gap-4 text-sm font-bold text-slate-600">
        <span>
          <span className="text-[#214C9B]">{listMatches.length}</span> partidos
        </span>
        <span>
          <span className="text-emerald-700">{played}</span> jugados
        </span>
        <span>
          <span className="text-[#981915]">{upcoming}</span> pendientes
        </span>
      </div>
      {loading ? (
        <p className="text-sm font-bold text-slate-500">Cargando calendario…</p>
      ) : (
        <TeamCalendar
          matches={monthMatches}
          listMatches={listMatches}
          seasonIds={seasonIds}
          gender={gender}
          listOnly={gender === "femenino"}
          showVenue={gender !== "femenino"}
        />
      )}
    </Card>
  );
}
