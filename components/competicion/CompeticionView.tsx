"use client";

import { CalendarNavButton } from "@/components/CalendarNavButton";
import { Card } from "@/components/Card";
import { GuiaLiga } from "@/components/competicion/GuiaLiga";
import { LeagueTableCard } from "@/components/LeagueTableCard";
import { MatchCard } from "@/components/MatchCard";
import { getLatestAvilesMatchesByGender, getUpcomingAvilesMatchesByGender } from "@/lib/fixtures";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Route } from "next";
import type { Team } from "@/types";

type CompeticionViewProps = {
  gender: PrimerEquipoGender;
  teams: Team[];
  highlightTeamId: string;
};

export function CompeticionView({ gender, teams, highlightTeamId }: CompeticionViewProps) {
  const latest = getLatestAvilesMatchesByGender(gender, 5);
  const upcoming = getUpcomingAvilesMatchesByGender(gender, 5);
  const calendarHref = `${primerEquipoBase(gender)}/calendario` as Route;

  return (
    <div className="space-y-6">
      <GuiaLiga gender={gender} teams={teams} highlightTeamId={highlightTeamId} />

      <section className="grid gap-6 xl:grid-cols-2">
        <LeagueTableCard
          eyebrow="Liga"
          title="Clasificacion"
          teams={teams}
          highlightTeamId={highlightTeamId}
          borderlessHeader
        />
        <div className="grid gap-6">
          <Card eyebrow="Forma reciente" title="Ultimos resultados" borderlessHeader>
            <div className="space-y-3">
              {latest.length > 0 ? (
                latest.map((match) => <MatchCard key={match.id} match={match} compact highlightTeamId={highlightTeamId} />)
              ) : (
                <p className="text-sm font-bold text-slate-500">Sin partidos finalizados.</p>
              )}
            </div>
          </Card>
          <Card
            eyebrow="Calendario"
            title="Proximos partidos"
            borderlessHeader
            action={<CalendarNavButton href={calendarHref} />}
          >
            <div className="space-y-3">
              {upcoming.length > 0 ? (
                upcoming.map((match) => <MatchCard key={match.id} match={match} compact highlightTeamId={highlightTeamId} />)
              ) : (
                <p className="text-sm font-bold text-slate-500">Sin partidos programados.</p>
              )}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
