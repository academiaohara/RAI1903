"use client";

import { OpponentCrest } from "@/components/OpponentCrest";
import { TeamCrest } from "@/components/TeamCrest";
import { TeamLink } from "@/components/TeamLink";
import { SplitDateInput } from "@/components/calendar/SplitDateInput";
import { MatchGoalsInCard } from "@/components/jornadas/MatchGoalsSide";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useSeason } from "@/components/season/SeasonProvider";
import { getCompeticionSquadData } from "@/lib/competicion-squad";
import { DEFAULT_KICKOFF_UTC } from "@/lib/match-kickoff-time";
import {
  mergeUtcDateAndTime,
  utcDateInputValue,
  utcTimeInputValue,
} from "@/lib/calendar-match-overrides";
import { applyJornadaFixtureOverride } from "@/lib/jornada-fixture-overrides";
import { resolveGroupTeams } from "@/lib/cms/group-teams";
import { getJornadaTeam } from "@/lib/jornadas-data";
import { getTeamCrestById } from "@/lib/team-crests";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { RfefGrupoId } from "@/lib/rfef-grupos";
import { formatMatchScore, isMatchPlayed } from "@/lib/match-result";
import { matchResultOverrideKey, readMatchResultOverride } from "@/lib/fixture-inline-keys";
import { formatMatchDate } from "@/lib/utils";
import type { JornadaFixture } from "@/types/jornadas";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

type JornadaMatchRowProps = {
  fixture: JornadaFixture;
  highlighted?: boolean;
  highlightTeamId?: string;
  gender?: PrimerEquipoGender;
  showCrests?: boolean;
  grupo?: RfefGrupoId;
};

function scoreOrTime(fixture: JornadaFixture): string {
  if (isMatchPlayed(fixture) && fixture.homeScore !== undefined && fixture.awayScore !== undefined) {
    return formatMatchScore(fixture.homeScore, fixture.awayScore);
  }
  if (!isMatchPlayed(fixture) && fixture.kickoffTime) return fixture.kickoffTime;
  return formatMatchDate(fixture.date).split(",").pop()?.trim() ?? "—";
}

export function JornadaMatchRow({
  fixture,
  highlighted = false,
  highlightTeamId,
  gender = "masculino",
  showCrests: showCrestsProp,
  grupo = "1",
}: JornadaMatchRowProps) {
  const { editMode, getOverride, mergeSaveValue } = useInlineEditing();
  const { bundles, viewedSeason } = useSeason();
  const override = readMatchResultOverride<Partial<JornadaFixture>>(getOverride, gender, fixture.id) ?? {};
  const editedFixture = applyJornadaFixtureOverride(fixture, override);
  const showCrests = showCrestsProp ?? true;
  const home = getJornadaTeam(editedFixture.homeTeamId);
  const away = getJornadaTeam(editedFixture.awayTeamId);
  const highlightHome = Boolean(highlightTeamId && editedFixture.homeTeamId === highlightTeamId);
  const highlightAway = Boolean(highlightTeamId && editedFixture.awayTeamId === highlightTeamId);

  const groupTeams = useMemo(() => {
    if (gender === "masculino") {
      return resolveGroupTeams(bundles, gender, grupo);
    }
    return resolveGroupTeams(bundles, gender, "1");
  }, [bundles, gender, grupo]);

  const homeTeam = groupTeams.find((team) => team.id === editedFixture.homeTeamId);
  const awayTeam = groupTeams.find((team) => team.id === editedFixture.awayTeamId);
  const homeSquad = useMemo(
    () =>
      homeTeam
        ? getCompeticionSquadData(gender, homeTeam, bundles, viewedSeason.label).squad
        : [],
    [bundles, gender, homeTeam, viewedSeason.label],
  );
  const awaySquad = useMemo(
    () =>
      awayTeam
        ? getCompeticionSquadData(gender, awayTeam, bundles, viewedSeason.label).squad
        : [],
    [bundles, gender, awayTeam, viewedSeason.label],
  );
  const showGoalsEditor = gender === "masculino" && grupo === "1";

  const savePatch = (patch: Partial<JornadaFixture>) => {
    const next: Partial<JornadaFixture> = { ...patch };
    if (next.homeScore !== undefined && next.awayScore !== undefined) {
      next.status = "finished";
      next.kickoffTime = undefined;
    }
    if (next.status === "finished") {
      next.kickoffTime = undefined;
      if (next.homeScore === undefined) next.homeScore = editedFixture.homeScore ?? 0;
      if (next.awayScore === undefined) next.awayScore = editedFixture.awayScore ?? 0;
    }
    if (next.status === "scheduled") {
      next.homeScore = undefined;
      next.awayScore = undefined;
    }
    mergeSaveValue(matchResultOverrideKey(gender, fixture.id), next);
  };

  const onTeamChange = (side: "home" | "away", teamId: string) => {
    const team = groupTeams.find((entry) => entry.id === teamId);
    if (!team) return;
    if (side === "home") {
      savePatch({ homeTeamId: teamId, homeTeamName: team.name });
    } else {
      savePatch({ awayTeamId: teamId, awayTeamName: team.name });
    }
  };

  const onDateChange = (iso: string) => {
    savePatch({ date: iso });
  };

  const onTimeChange = (timeValue: string) => {
    savePatch({
      date: mergeUtcDateAndTime(
        editedFixture.date,
        utcDateInputValue(editedFixture.date),
        timeValue || DEFAULT_KICKOFF_UTC,
      ),
      kickoffTime: timeValue || undefined,
    });
  };

  const kickoffTimeForDate =
    (editedFixture.kickoffTime ?? utcTimeInputValue(editedFixture.date)) || DEFAULT_KICKOFF_UTC;

  const nameClass = (isHighlight: boolean) =>
    cn(
      "min-w-0 truncate text-[9px] font-extrabold leading-tight sm:text-sm",
      isHighlight ? (highlighted ? "text-[#981915]" : "text-[#214C9B]") : "text-slate-800",
    );

  const teamShortName = (teamId: string, fallbackName: string, team?: ReturnType<typeof getJornadaTeam>) =>
    groupTeams.find((entry) => entry.id === teamId)?.shortName ?? team?.shortName ?? fallbackName;

  const teamNameContent = (
    teamId: string,
    teamName: string,
    team: ReturnType<typeof getJornadaTeam> | undefined,
    align: "left" | "right",
  ) => {
    const shortName = teamShortName(teamId, teamName, team);
    return (
      <>
        <span className={cn("sm:hidden", align === "right" && "block text-right")}>{shortName}</span>
        <span className={cn("hidden sm:inline", align === "right" && "text-right")}>{teamName}</span>
      </>
    );
  };

  const crestForTeam = (teamId: string, teamName: string, team?: ReturnType<typeof getJornadaTeam>) => {
    const crestClassName = "h-3.5 w-3.5 shrink-0 sm:h-7 sm:w-7";
    if (team) return <TeamCrest team={team} size="sm" className={crestClassName} />;
    return (
      <OpponentCrest
        logo={getTeamCrestById(teamId, teamName.slice(0, 3).toUpperCase())}
        opponent={teamName}
        size="sm"
        className={crestClassName}
      />
    );
  };

  const teamSelect = (side: "home" | "away", teamId: string, teamName: string, label: string) => {
    const inList = groupTeams.some((team) => team.id === teamId);
    return (
      <div className="space-y-1">
        <select
          value={teamId}
          onChange={(event) => onTeamChange(side, event.target.value)}
          className="w-full rounded-lg border border-slate-200 px-1 py-0.5 text-[10px] font-bold text-slate-700 outline-none"
          aria-label={label}
        >
          {!inList && teamId ? (
            <option value={teamId}>{teamName || teamId}</option>
          ) : null}
          {groupTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.shortName ?? team.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={teamName}
          onChange={(event) =>
            savePatch(side === "home" ? { homeTeamName: event.target.value } : { awayTeamName: event.target.value })
          }
          className="w-full rounded-lg border border-slate-200 px-1 py-0.5 text-[10px] font-bold text-slate-700 outline-none"
          placeholder="Nombre visible"
          aria-label={`${label} (nombre)`}
        />
      </div>
    );
  };

  return (
    <article
      className={cn(
        "flex flex-col gap-1 rounded-2xl border p-2.5 sm:gap-1.5 sm:p-4",
        highlighted
          ? "border-[#981915]/40 bg-gradient-to-br from-[#981915]/6 via-white to-[#214C9B]/5 shadow-[0_10px_28px_rgba(152,25,21,0.12)]"
          : "border-[#214C9B]/12 bg-slate-50/80",
      )}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 sm:gap-3">
      <div className="flex min-w-0 items-center gap-0.5 sm:gap-2">
        {showCrests ? (
          <TeamLink gender={gender} teamId={editedFixture.homeTeamId} teamName={editedFixture.homeTeamName} className="shrink-0">
            {crestForTeam(editedFixture.homeTeamId, editedFixture.homeTeamName, home)}
          </TeamLink>
        ) : null}
        {editMode && groupTeams.length > 0 ? (
          <div className="min-w-0 flex-1">
            {teamSelect("home", editedFixture.homeTeamId, editedFixture.homeTeamName, "Equipo local")}
          </div>
        ) : (
          <TeamLink gender={gender} teamId={editedFixture.homeTeamId} teamName={editedFixture.homeTeamName} className={nameClass(highlightHome)}>
            {teamNameContent(editedFixture.homeTeamId, editedFixture.homeTeamName, home, "left")}
          </TeamLink>
        )}
      </div>

      {editMode ? (
        <div className="relative z-[1] min-w-[11rem] rounded-xl border border-[#214C9B]/20 bg-white p-2 text-center shadow-sm sm:min-w-[12rem]">
          <select
            value={editedFixture.status}
            onChange={(event) => {
              const status = event.target.value as JornadaFixture["status"];
              if (status === "finished") {
                savePatch({
                  status,
                  homeScore: editedFixture.homeScore ?? 0,
                  awayScore: editedFixture.awayScore ?? 0,
                });
                return;
              }
              savePatch({ status });
            }}
            className="mb-1 w-full rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-700 outline-none"
            aria-label="Editar estado del partido"
          >
            <option value="scheduled">Programado</option>
            <option value="finished">Finalizado</option>
          </select>
          <SplitDateInput
            key={editedFixture.date.slice(0, 10)}
            iso={editedFixture.date}
            timeValue={kickoffTimeForDate}
            onChange={onDateChange}
            className="mb-1"
            labelClassName="text-[9px]"
            fieldClassName="rounded-lg border border-slate-200 px-1 py-0.5 text-[10px] font-bold text-slate-700"
            disabled={editedFixture.status === "finished"}
          />
          {editedFixture.status === "finished" ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={editedFixture.homeScore ?? 0}
                onChange={(event) => savePatch({ homeScore: Number(event.target.value) })}
                className="w-12 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm font-extrabold text-[#214C9B]"
                aria-label="Goles local"
              />
              <span className="text-xs font-extrabold text-slate-400">-</span>
              <input
                type="number"
                value={editedFixture.awayScore ?? 0}
                onChange={(event) => savePatch({ awayScore: Number(event.target.value) })}
                className="w-12 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm font-extrabold text-[#214C9B]"
                aria-label="Goles visitante"
              />
            </div>
          ) : (
            <input
              type="time"
              value={editedFixture.kickoffTime ?? utcTimeInputValue(editedFixture.date)}
              onChange={(event) => onTimeChange(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-2 py-1 text-center text-sm font-extrabold text-[#214C9B]"
              aria-label="Hora del partido"
            />
          )}
        </div>
      ) : (
        <div
          className={cn(
            "min-w-[2.35rem] rounded-md px-1 py-0.5 text-center text-[9px] font-extrabold tabular-nums sm:min-w-[4.5rem] sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm",
            highlighted ? "bg-[#981915] text-white shadow-sm" : "bg-[#214C9B] text-white",
          )}
        >
          {scoreOrTime(editedFixture)}
        </div>
      )}

      <div className="flex min-w-0 items-center justify-end gap-0.5 sm:gap-2">
        {editMode && groupTeams.length > 0 ? (
          <div className="min-w-0 flex-1">
            {teamSelect("away", editedFixture.awayTeamId, editedFixture.awayTeamName, "Equipo visitante")}
          </div>
        ) : (
          <TeamLink
            gender={gender}
            teamId={editedFixture.awayTeamId}
            teamName={editedFixture.awayTeamName}
            className={cn(nameClass(highlightAway), "text-right")}
          >
            {teamNameContent(editedFixture.awayTeamId, editedFixture.awayTeamName, away, "right")}
          </TeamLink>
        )}
        {showCrests ? (
          <TeamLink gender={gender} teamId={editedFixture.awayTeamId} teamName={editedFixture.awayTeamName} className="shrink-0">
            {crestForTeam(editedFixture.awayTeamId, editedFixture.awayTeamName, away)}
          </TeamLink>
        ) : null}
      </div>
      </div>

      <MatchGoalsInCard
        fixture={editedFixture}
        gender={gender}
        homeSquad={homeSquad}
        awaySquad={awaySquad}
        editMode={editMode}
        showGoalsEditor={showGoalsEditor}
        getOverride={getOverride}
        mergeSaveValue={mergeSaveValue}
      />
    </article>
  );
}
