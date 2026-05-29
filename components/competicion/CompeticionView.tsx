"use client";

import { useMemo, useState } from "react";
import { CalendarNavButton } from "@/components/CalendarNavButton";
import { Card } from "@/components/Card";
import { GrupoSwitcher } from "@/components/competicion/GrupoSwitcher";
import { GuiaLiga } from "@/components/competicion/GuiaLiga";
import { StandingsLeagueTableCard } from "@/components/StandingsLeagueTableCard";
import { MatchCard } from "@/components/MatchCard";
import {
  getLatestAvilesMatchesByGender,
  getTeamsByGender,
  getUpcomingAvilesMatchesByGender,
} from "@/lib/fixtures";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import { getTeamsForRfefGrupo, type RfefGrupoId } from "@/lib/rfef-grupos";
import { getPlayedLeagueRounds } from "@/lib/standings";
import { matchdays, matchdaysGrupo2 } from "@/data/mock";
import type { Route } from "next";
type CompeticionViewProps = {
  gender: PrimerEquipoGender;
  highlightTeamId: string;
  initialGrupo?: RfefGrupoId;
};

export function CompeticionView({ gender, highlightTeamId, initialGrupo = "1" }: CompeticionViewProps) {
  const [grupo, setGrupo] = useState<RfefGrupoId>(initialGrupo);
  const isMasculino = gender === "masculino";
  const teams = isMasculino ? getTeamsForRfefGrupo(grupo) : getTeamsByGender(gender);
  const standingsMatchdays = isMasculino && grupo === "2" ? matchdaysGrupo2 : matchdays;
  const showAvilesSidebar = !isMasculino || grupo === "1";
  const latest = getLatestAvilesMatchesByGender(gender, 5);
  const upcoming = getUpcomingAvilesMatchesByGender(gender, 5);
  const calendarHref = `${primerEquipoBase(gender)}/calendario` as Route;

  const lastGrupoJornada = useMemo(() => {
    if (showAvilesSidebar) return null;
    const playedRounds = getPlayedLeagueRounds(standingsMatchdays);
    const lastRound = playedRounds[playedRounds.length - 1];
    if (!lastRound) return null;
    const matchday = standingsMatchdays.find((round) => round.round === lastRound);
    if (!matchday) return null;
    return { round: lastRound, matches: matchday.matches };
  }, [showAvilesSidebar, standingsMatchdays]);

  return (
    <div className="space-y-6">
      {isMasculino && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <GrupoSwitcher value={grupo} onChange={setGrupo} />
          <p className="text-sm font-bold text-slate-600">
            {grupo === "1" ? "1ª RFEF - Grupo I (Real Avilés)" : "1ª RFEF - Grupo II"}
          </p>
        </div>
      )}

      {showAvilesSidebar && (
        <GuiaLiga gender={gender} teams={teams} grupo={isMasculino ? grupo : "1"} />
      )}

      <section className="grid gap-6 xl:grid-cols-2">
        <StandingsLeagueTableCard
          key={`${gender}-${grupo}`}
          eyebrow="Liga"
          sourceTeams={teams}
          matchdays={standingsMatchdays}
          highlightTeamId={showAvilesSidebar ? highlightTeamId : ""}
          centerOnHighlight={showAvilesSidebar}
          compact
          borderlessHeader
        />
        <div className="grid gap-6">
          {showAvilesSidebar && (
            <>
              <Card eyebrow="Forma reciente" title="Ultimos resultados" borderlessHeader>
                <div className="space-y-3">
                  {latest.length > 0 ? (
                    latest.map((match) => (
                      <MatchCard key={match.id} match={match} compact highlightTeamId={highlightTeamId} />
                    ))
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
                    upcoming.map((match) => (
                      <MatchCard key={match.id} match={match} compact highlightTeamId={highlightTeamId} />
                    ))
                  ) : (
                    <p className="text-sm font-bold text-slate-500">Sin partidos programados.</p>
                  )}
                </div>
              </Card>
            </>
          )}
          {isMasculino && !showAvilesSidebar && lastGrupoJornada && (
            <Card
              eyebrow="Grupo II"
              title={`Ultima jornada · J${lastGrupoJornada.round}`}
              borderlessHeader
            >
              <div className="space-y-3">
                {lastGrupoJornada.matches.map((match) => (
                  <MatchCard key={match.id} match={match} compact highlightTeamId="" />
                ))}
              </div>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
