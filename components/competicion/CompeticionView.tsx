"use client";

import { useMemo, useState } from "react";
import { CalendarNavButton } from "@/components/CalendarNavButton";
import { Card } from "@/components/Card";
import { GrupoSwitcher } from "@/components/competicion/GrupoSwitcher";
import { GuiaLiga } from "@/components/competicion/GuiaLiga";
import { EditableText } from "@/components/inline-editing/EditableText";
import { QuinielaViewToggle } from "@/components/QuinielaViewToggle";
import { StandingsLeagueTableCard } from "@/components/StandingsLeagueTableCard";
import { ExtraFixturesOnPageEditor } from "@/components/editor/ExtraFixturesOnPageEditor";
import { FixtureCrestMatchCard } from "@/components/FixtureCrestMatchCard";
import { MatchCard } from "@/components/MatchCard";
import { hasMultipleGrupos, zonesToLegacyConfig } from "@/lib/cms/competition-config-bundle";
import { resolveGroupTeams } from "@/lib/cms/group-teams";
import { getTeamsByGender } from "@/lib/fixtures";
import { useSeason } from "@/components/season/SeasonProvider";
import { useEditedMatchdays, useEditedMatches } from "@/hooks/useEditedMatchdays";
import { resolveClubTeamIds } from "@/lib/season/club-team-ids";
import {
  getAvilesMatchesFromSource,
  getCopaDelReyMatchesFromSource,
  getGrupo2Matchdays,
  getLeagueMatchdaysForGender,
} from "@/lib/season/aviles-matches";
import { primerEquipoBase, type PrimerEquipoGender } from "@/lib/primer-equipo";
import type { RfefGrupoId } from "@/lib/rfef-grupos";
import { getPlayedLeagueRounds } from "@/lib/standings";
import { isMatchPlayed } from "@/lib/match-result";
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
  const { getEnrichedFixtureSource, getCompetitionConfig, bundles } = useSeason();
  const fixtureSource = useMemo(() => getEnrichedFixtureSource(gender), [gender, getEnrichedFixtureSource]);
  const competitionConfig = useMemo(() => getCompetitionConfig(gender), [gender, getCompetitionConfig]);
  const standingsZones = useMemo(() => zonesToLegacyConfig(competitionConfig.zones), [competitionConfig.zones]);
  const leagueMatchdays = useMemo(
    () => getLeagueMatchdaysForGender(fixtureSource, gender),
    [fixtureSource, gender],
  );
  const baseMatchdaysGrupo2 = useMemo(() => getGrupo2Matchdays(fixtureSource), [fixtureSource]);
  const editedLeagueMatchdays = useEditedMatchdays(leagueMatchdays, gender);
  const editedMatchdaysGrupo2 = useEditedMatchdays(baseMatchdaysGrupo2, gender);
  const copaMatches = useMemo(
    () => getCopaDelReyMatchesFromSource(fixtureSource, gender),
    [fixtureSource, gender],
  );

  const [grupo, setGrupo] = useState<RfefGrupoId>(initialGrupo);
  const [panel, setPanel] = useState<CompeticionPanel>("liga");
  const isMasculino = gender === "masculino";
  const teams = useMemo(() => {
    if (isMasculino) {
      return resolveGroupTeams(bundles, gender, grupo);
    }
    return getTeamsByGender(gender);
  }, [bundles, gender, grupo, isMasculino]);
  const clubTeamIds = useMemo(() => resolveClubTeamIds(bundles, gender, grupo), [bundles, gender, grupo]);
  const baseAvilesMatches = useMemo(
    () => getAvilesMatchesFromSource(fixtureSource, gender, { clubTeamIds }),
    [fixtureSource, gender, clubTeamIds],
  );
  const avilesMatches = useEditedMatches(baseAvilesMatches, gender);
  const tableMatchdays = isMasculino
    ? grupo === "2"
      ? baseMatchdaysGrupo2
      : leagueMatchdays
    : leagueMatchdays;
  const editedStandingsMatchdays = isMasculino
    ? grupo === "2"
      ? editedMatchdaysGrupo2
      : editedLeagueMatchdays
    : editedLeagueMatchdays;
  const multiGrupo = hasMultipleGrupos(competitionConfig);
  const showAvilesSidebar = !isMasculino || !multiGrupo || grupo === "1";
  const finishedAviles = avilesMatches.filter((match) => isMatchPlayed(match));
  const scheduledAviles = avilesMatches.filter((match) => !isMatchPlayed(match));
  const latest = [...finishedAviles]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  const upcoming = [...scheduledAviles]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);
  const copaDelReyMatches = copaMatches;
  const calendarHref = `${primerEquipoBase(gender)}/calendario` as Route;
  const baseLigaLabel = competitionConfig.ligaLabel ?? "1ª RFEF";
  const competitionLabel =
    panel === "liga"
      ? multiGrupo
        ? grupo === "1"
          ? `${baseLigaLabel} - Grupo I (Real Avilés)`
          : `${baseLigaLabel} - Grupo II`
        : baseLigaLabel
      : "Copa del Rey 2025/26";

  const lastGrupoJornada = useMemo(() => {
    if (showAvilesSidebar) return null;
    const playedRounds = getPlayedLeagueRounds(editedStandingsMatchdays);
    const lastRound = playedRounds[playedRounds.length - 1];
    if (!lastRound) return null;
    const matchday = editedStandingsMatchdays.find((round) => round.round === lastRound);
    if (!matchday) return null;
    return { round: lastRound, matches: matchday.matches };
  }, [showAvilesSidebar, editedStandingsMatchdays]);

  return (
    <div className="space-y-6">
      {isMasculino && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            <QuinielaViewToggle
              value={panel}
              onChange={setPanel}
              options={COMPETICION_OPTIONS}
              layoutId="competicion-panel-toggle"
              className="w-full sm:w-80 sm:flex-none"
            />
            {panel === "liga" && multiGrupo && (
              <GrupoSwitcher value={grupo} onChange={setGrupo} className="w-fit shrink-0 self-start sm:self-auto" />
            )}
          </div>
          <p className="text-xs font-bold text-slate-600 sm:text-sm">
            <EditableText
              storageKey={`competition:${gender}:${panel}:${grupo}:label`}
              value={competitionLabel}
              aria-label="Editar etiqueta de competición"
              inputClassName="text-sm font-bold text-slate-700"
            />
          </p>
        </div>
      )}

      {!isMasculino && (
        <p className="text-sm font-bold text-slate-600">
          <EditableText
            storageKey={`competition:${gender}:liga:label`}
            value={competitionConfig.ligaLabel ?? "2ª RFEF Femenina"}
            aria-label="Editar etiqueta de competición"
            inputClassName="text-sm font-bold text-slate-700"
          />
        </p>
      )}

      {panel === "copa-rey" ? (
        <>
          {isMasculino ? <ExtraFixturesOnPageEditor /> : null}
          <CopaDelReyPanel
            matches={copaDelReyMatches}
            highlightTeamId={highlightTeamId}
            gender={gender}
            calendarHref={calendarHref}
          />
        </>
      ) : (
        <>
          {isMasculino && <GuiaLiga gender={gender} teams={teams} grupo={grupo} />}

          <section className="grid gap-6 xl:grid-cols-2">
            <StandingsLeagueTableCard
              key={`${gender}-${grupo}`}
              eyebrow="Liga"
              sourceTeams={teams}
              matchdays={tableMatchdays}
              highlightTeamId={showAvilesSidebar ? highlightTeamId : ""}
              centerOnHighlight={showAvilesSidebar}
              compact
              borderlessHeader
              gender={gender}
              zones={standingsZones}
              zoneRules={competitionConfig.zones}
              {...(isMasculino ? {} : { tiebreak: undefined })}
            />
            <div className="grid gap-6">
              {showAvilesSidebar && (
                <>
                  <Card eyebrow="Forma reciente" title="Ultimos resultados" borderlessHeader>
                    <div className="space-y-2">
                      {latest.length > 0 ? (
                        latest.map((match) => (
                          <FixtureCrestMatchCard key={match.id} match={match} accent="blue" gender={gender} />
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
                    <div className="space-y-2">
                      {upcoming.length > 0 ? (
                        upcoming.map((match) => (
                          <FixtureCrestMatchCard key={match.id} match={match} accent="granate" gender={gender} />
                        ))
                      ) : (
                        <p className="text-sm font-bold text-slate-500">Sin partidos programados.</p>
                      )}
                    </div>
                  </Card>
                </>
              )}
              {isMasculino && multiGrupo && !showAvilesSidebar && lastGrupoJornada && (
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
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <CupStat label="Partidos" value={matches.length.toString()} />
            <CupStat label="Victorias" value={wins.toString()} />
            <CupStat label="Estado" value={status} />
          </div>
          <div className="grid gap-2 sm:gap-3 lg:grid-cols-2">
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
    <div className="rounded-xl border border-[#214C9B]/15 bg-white p-2.5 shadow-[0_8px_24px_rgba(17,24,39,0.05)] sm:rounded-2xl sm:p-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-500 sm:text-[11px] sm:tracking-[0.1em]">{label}</p>
      <p className="mt-0.5 truncate text-sm font-extrabold text-[#214C9B] sm:mt-1 sm:text-lg">{value}</p>
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
