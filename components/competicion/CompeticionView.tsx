"use client";

import { useMemo, useState } from "react";
import { CalendarNavButton } from "@/components/CalendarNavButton";
import { Card } from "@/components/Card";
import { GrupoSwitcher } from "@/components/competicion/GrupoSwitcher";
import { GuiaLiga } from "@/components/competicion/GuiaLiga";
import { QuinielaViewToggle } from "@/components/QuinielaViewToggle";
import { StandingsLeagueTableCard } from "@/components/StandingsLeagueTableCard";
import { MatchCard } from "@/components/MatchCard";
import {
  getCopaDelReyMatchesByGender,
  getLatestAvilesMatchesByGender,
  getTeamsByGender,
  getUpcomingAvilesMatchesByGender,
} from "@/lib/fixtures";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import { getTeamsForRfefGrupo, type RfefGrupoId } from "@/lib/rfef-grupos";
import { getPlayedLeagueRounds } from "@/lib/standings";
import { matchdays, matchdaysGrupo2 } from "@/data/mock";
import type { Route } from "next";
import type { Match } from "@/types";

type CompeticionViewProps = {
  gender: PrimerEquipoGender;
  highlightTeamId: string;
  initialGrupo?: RfefGrupoId;
};

const COMPETICION_OPTIONS = [
  { id: "liga", label: "Liga" },
  { id: "copa-rey", label: "Copa del Rey" },
] as const;

type CompeticionPanel = (typeof COMPETICION_OPTIONS)[number]["id"];

export function CompeticionView({ gender, highlightTeamId, initialGrupo = "1" }: CompeticionViewProps) {
  const [grupo, setGrupo] = useState<RfefGrupoId>(initialGrupo);
  const [panel, setPanel] = useState<CompeticionPanel>("liga");
  const isMasculino = gender === "masculino";
  const teams = isMasculino ? getTeamsForRfefGrupo(grupo) : getTeamsByGender(gender);
  const standingsMatchdays = isMasculino && grupo === "2" ? matchdaysGrupo2 : matchdays;
  const showAvilesSidebar = !isMasculino || grupo === "1";
  const latest = getLatestAvilesMatchesByGender(gender, 5);
  const upcoming = getUpcomingAvilesMatchesByGender(gender, 5);
  const copaDelReyMatches = getCopaDelReyMatchesByGender(gender);
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
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <QuinielaViewToggle
              value={panel}
              onChange={setPanel}
              options={COMPETICION_OPTIONS}
              layoutId="competicion-panel-toggle"
              className="w-full sm:max-w-sm"
            />
            <p className="text-sm font-bold text-slate-600">
              {panel === "liga"
                ? grupo === "1"
                  ? "1ª RFEF - Grupo I (Real Avilés)"
                  : "1ª RFEF - Grupo II"
                : "Copa del Rey 2025/26"}
            </p>
          </div>
          {panel === "liga" && <GrupoSwitcher value={grupo} onChange={setGrupo} />}
        </div>
      )}

      {panel === "copa-rey" ? (
        <CopaDelReyPanel
          matches={copaDelReyMatches}
          highlightTeamId={highlightTeamId}
          gender={gender}
          calendarHref={calendarHref}
        />
      ) : (
        <>
          {showAvilesSidebar && <GuiaLiga gender={gender} teams={teams} grupo={isMasculino ? grupo : "1"} />}

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
              gender={gender}
            />
            <div className="grid gap-6">
              {showAvilesSidebar && (
                <>
                  <Card eyebrow="Forma reciente" title="Ultimos resultados" borderlessHeader>
                    <div className="space-y-3">
                      {latest.length > 0 ? (
                        latest.map((match) => (
                          <MatchCard key={match.id} match={match} compact highlightTeamId={highlightTeamId} gender={gender} />
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
                          <MatchCard key={match.id} match={match} compact highlightTeamId={highlightTeamId} gender={gender} />
                        ))
                      ) : (
                        <p className="text-sm font-bold text-slate-500">Sin partidos programados.</p>
                      )}
                    </div>
                  </Card>
                </>
              )}
              {isMasculino && !showAvilesSidebar && lastGrupoJornada && (
                <Card eyebrow="Grupo II" title={`Ultima jornada · J${lastGrupoJornada.round}`} borderlessHeader>
                  <div className="space-y-3">
                    {lastGrupoJornada.matches.map((match) => (
                      <MatchCard key={match.id} match={match} compact highlightTeamId="" gender={gender} />
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function CopaDelReyPanel({
  matches,
  highlightTeamId,
  gender,
  calendarHref,
}: {
  matches: Match[];
  highlightTeamId: string;
  gender: PrimerEquipoGender;
  calendarHref: Route;
}) {
  const wins = matches.filter((match) => getAvilesGoals(match, highlightTeamId) > getRivalGoals(match, highlightTeamId)).length;
  const lastMatch = matches[matches.length - 1];
  const status =
    lastMatch && getAvilesGoals(lastMatch, highlightTeamId) < getRivalGoals(lastMatch, highlightTeamId)
      ? `Eliminado en ${lastMatch.competitionStage ?? "Copa del Rey"}`
      : "En competicion";

  return (
    <Card
      eyebrow="Copa del Rey"
      title="Camino copero"
      borderlessHeader
      action={<CalendarNavButton href={calendarHref} />}
    >
      {matches.length > 0 ? (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <CupStat label="Partidos" value={matches.length.toString()} />
            <CupStat label="Victorias" value={wins.toString()} />
            <CupStat label="Estado" value={status} />
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} highlightTeamId={highlightTeamId} gender={gender} />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm font-bold text-slate-500">Sin partidos de Copa del Rey registrados.</p>
      )}
    </Card>
  );
}

function CupStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#214C9B]/15 bg-white p-4 shadow-[0_8px_24px_rgba(17,24,39,0.05)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-[#214C9B]">{value}</p>
    </div>
  );
}

function getAvilesGoals(match: Match, highlightTeamId: string): number {
  if (match.homeScore === undefined || match.awayScore === undefined) return 0;
  return match.homeTeamId === highlightTeamId ? match.homeScore : match.awayScore;
}

function getRivalGoals(match: Match, highlightTeamId: string): number {
  if (match.homeScore === undefined || match.awayScore === undefined) return 0;
  return match.homeTeamId === highlightTeamId ? match.awayScore : match.homeScore;
}
