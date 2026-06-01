"use client";

import { useMemo } from "react";
import { Card } from "@/components/Card";
import { TeamCalendar } from "@/components/TeamCalendar";
import { useTeamCrestMap } from "@/components/assets/TeamCrestResolverProvider";
import { useSeason } from "@/components/season/SeasonProvider";
import { useSeasonMatchArticles } from "@/hooks/useSeasonMatchArticles";
import { getCalendarMatchesFromSource } from "@/lib/calendar";
import { getAvilesMatchesFromSource } from "@/lib/season/aviles-matches";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

type CalendarioSeasonViewProps = {
  gender: PrimerEquipoGender;
};

export function CalendarioSeasonView({ gender }: CalendarioSeasonViewProps) {
  const { getFixtureSource } = useSeason();
  const crestMap = useTeamCrestMap();
  const { getCronica, getPrevia } = useSeasonMatchArticles();
  const matches = useMemo(() => {
    const source = getFixtureSource(gender);
    const aviles = getAvilesMatchesFromSource(source, gender);
    return getCalendarMatchesFromSource(aviles, gender, { getCronica, getPrevia, crestMap });
  }, [gender, getCronica, getFixtureSource, getPrevia, crestMap]);

  const played = matches.filter((match) => match.played).length;
  const upcoming = matches.length - played;

  return (
    <Card eyebrow="Temporada" title="Partidos del equipo">
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
        gender={gender}
        listOnly={gender === "femenino"}
        showVenue={gender !== "femenino"}
      />
    </Card>
  );
}
