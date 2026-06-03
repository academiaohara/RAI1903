"use client";

import { OpponentCrest } from "@/components/OpponentCrest";
import { TeamCrest } from "@/components/TeamCrest";
import { TeamLink } from "@/components/TeamLink";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useSeason } from "@/components/season/SeasonProvider";
import {
  mergeUtcDateAndTime,
  utcDateInputValue,
  utcTimeInputValue,
} from "@/lib/calendar-match-overrides";
import { resolveGroupTeams } from "@/lib/cms/group-teams";
import { getJornadaTeam } from "@/lib/jornadas-data";
import { getTeamCrestById } from "@/lib/team-crests";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { RfefGrupoId } from "@/lib/rfef-grupos";
import { formatMatchScore, isMatchPlayed } from "@/lib/match-result";
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
  const { editMode, getOverride, saveValue } = useInlineEditing();
  const { bundles } = useSeason();
  const override = getOverride<Partial<JornadaFixture>>(`match-result:${fixture.id}`) ?? {};
  const editedFixture = { ...fixture, ...override };
  const showCrests = showCrestsProp ?? gender !== "femenino";
  const home = getJornadaTeam(editedFixture.homeTeamId);
  const away = getJornadaTeam(editedFixture.awayTeamId);
  const highlightHome = Boolean(highlightTeamId && editedFixture.homeTeamId === highlightTeamId);
  const highlightAway = Boolean(highlightTeamId && editedFixture.awayTeamId === highlightTeamId);

  const groupTeams = useMemo(() => {
    if (gender === "masculino") {
      return resolveGroupTeams(bundles, gender, grupo);
    }
    return [];
  }, [bundles, gender, grupo]);

  const savePatch = (patch: Partial<JornadaFixture>) => {
    const next: Partial<JornadaFixture> = { ...patch };
    if (next.homeScore !== undefined && next.awayScore !== undefined) {
      next.status = "finished";
      next.kickoffTime = undefined;
    }
    if (next.status === "finished") {
      next.kickoffTime = undefined;
    }
    if (next.status === "scheduled") {
      next.homeScore = undefined;
      next.awayScore = undefined;
    }
    saveValue(`match-result:${fixture.id}`, { ...override, ...next });
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

  const onDateChange = (dateValue: string) => {
    if (!dateValue) return;
    const timeValue = editedFixture.kickoffTime ?? (utcTimeInputValue(editedFixture.date) || "12:00");
    savePatch({ date: mergeUtcDateAndTime(fixture.date, dateValue, timeValue) });
  };

  const onTimeChange = (timeValue: string) => {
    savePatch({
      date: mergeUtcDateAndTime(
        editedFixture.date,
        utcDateInputValue(editedFixture.date),
        timeValue || "12:00",
      ),
      kickoffTime: timeValue || undefined,
    });
  };

  const nameClass = (isHighlight: boolean) =>
    cn(
      "min-w-0 truncate text-sm font-extrabold",
      isHighlight ? (highlighted ? "text-[#981915]" : "text-[#214C9B]") : "text-slate-800",
    );

  const crestForTeam = (teamId: string, teamName: string, team?: ReturnType<typeof getJornadaTeam>) => {
    if (team) return <TeamCrest team={team} size="sm" className="shrink-0" />;
    return (
      <OpponentCrest
        logo={getTeamCrestById(teamId, teamName.slice(0, 3).toUpperCase())}
        opponent={teamName}
        size="sm"
        className="shrink-0"
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
        "grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 rounded-2xl border p-3 sm:gap-3 sm:p-4",
        highlighted
          ? "border-[#981915]/40 bg-gradient-to-br from-[#981915]/6 via-white to-[#214C9B]/5 shadow-[0_10px_28px_rgba(152,25,21,0.12)]"
          : "border-[#214C9B]/12 bg-slate-50/80",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
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
            {editedFixture.homeTeamName}
          </TeamLink>
        )}
      </div>

      {editMode ? (
        <div className="min-w-[8rem] rounded-xl border border-[#214C9B]/20 bg-white p-2 text-center shadow-sm">
          <select
            value={editedFixture.status}
            onChange={(event) => savePatch({ status: event.target.value as JornadaFixture["status"] })}
            className="mb-1 w-full rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-700 outline-none"
            aria-label="Editar estado del partido"
          >
            <option value="scheduled">Programado</option>
            <option value="finished">Finalizado</option>
          </select>
          <label className="mb-1 grid gap-0.5 text-left">
            <span className="text-[9px] font-extrabold uppercase tracking-wide text-slate-500">Día</span>
            <input
              type="date"
              value={utcDateInputValue(editedFixture.date)}
              onChange={(event) => onDateChange(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-1 py-0.5 text-[10px] font-bold text-slate-700"
              aria-label="Fecha del partido"
            />
          </label>
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
            "min-w-[4.5rem] rounded-xl px-3 py-2 text-center text-sm font-extrabold tabular-nums",
            highlighted ? "bg-[#981915] text-white shadow-sm" : "bg-[#214C9B] text-white",
          )}
        >
          {scoreOrTime(editedFixture)}
        </div>
      )}

      <div className="flex min-w-0 items-center justify-end gap-2">
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
            {editedFixture.awayTeamName}
          </TeamLink>
        )}
        {showCrests ? (
          <TeamLink gender={gender} teamId={editedFixture.awayTeamId} teamName={editedFixture.awayTeamName} className="shrink-0">
            {crestForTeam(editedFixture.awayTeamId, editedFixture.awayTeamName, away)}
          </TeamLink>
        ) : null}
      </div>
    </article>
  );
}
