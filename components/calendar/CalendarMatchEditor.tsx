"use client";

import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useSeason } from "@/components/season/SeasonProvider";
import { SplitDateInput } from "@/components/calendar/SplitDateInput";
import {
  applyCalendarMatchOverride,
  applyMatchResultOverride,
  calendarMatchToMatch,
  mergeUtcDateAndTime,
  teamDisplayName,
  utcTimeInputValue,
  type MatchResultOverride,
} from "@/lib/calendar-match-overrides";
import { getTeamsBundle, resolveFixtureTeamDisplayName } from "@/lib/cms/teams-bundle";
import { matchResultOverrideKey, readMatchResultOverride } from "@/lib/fixture-inline-keys";
import { resolveClubTeamIds } from "@/lib/season/club-team-ids";
import { fixtureEditorTeamOptions } from "@/lib/fixtures/editor-team-options";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { DEFAULT_KICKOFF_LOCAL, spainDateInputValue } from "@/lib/match-kickoff-time";
import { cn } from "@/lib/utils";
import type { CalendarMatch, Match } from "@/types";
import { useMemo } from "react";

type CalendarMatchEditorProps = {
  match: CalendarMatch;
  gender?: PrimerEquipoGender;
  compact?: boolean;
  className?: string;
};

function useResolveTeamName(gender: PrimerEquipoGender) {
  const { bundles } = useSeason();
  const cmsTeams = useMemo(() => getTeamsBundle(bundles, gender)?.teams ?? [], [bundles, gender]);
  return useMemo(
    () => (teamId: string, fallback: string) =>
      resolveFixtureTeamDisplayName(teamId, fallback, cmsTeams, bundles, gender),
    [bundles, cmsTeams, gender],
  );
}

function useClubTeamIds(gender: PrimerEquipoGender) {
  const { bundles, getEnrichedFixtureSource } = useSeason();
  const fixtureSource = useMemo(() => getEnrichedFixtureSource(gender), [gender, getEnrichedFixtureSource]);
  return useMemo(() => {
    if (gender === "femenino") {
      return resolveClubTeamIds(bundles, gender, "1", fixtureSource.matchdaysFemenino);
    }
    return [
      ...new Set([
        ...resolveClubTeamIds(bundles, gender, "1", fixtureSource.matchdays),
        ...resolveClubTeamIds(bundles, gender, "2", fixtureSource.matchdaysGrupo2),
      ]),
    ];
  }, [bundles, fixtureSource, gender]);
}

export function useEditedCalendarMatch(match: CalendarMatch, gender: PrimerEquipoGender = "masculino"): CalendarMatch {
  const { getOverride } = useInlineEditing();
  const resolveTeamName = useResolveTeamName(gender);
  const clubTeamIds = useClubTeamIds(gender);
  const override = readMatchResultOverride<MatchResultOverride>(getOverride, gender, match.id);
  return applyCalendarMatchOverride(match, override, gender, resolveTeamName, clubTeamIds);
}

export function useEditedCalendarMatches(
  matches: CalendarMatch[],
  gender: PrimerEquipoGender = "masculino",
): CalendarMatch[] {
  const { getOverride } = useInlineEditing();
  const resolveTeamName = useResolveTeamName(gender);
  const clubTeamIds = useClubTeamIds(gender);
  return matches
    .map((match) => {
      const override = readMatchResultOverride<MatchResultOverride>(getOverride, gender, match.id);
      return applyCalendarMatchOverride(match, override, gender, resolveTeamName, clubTeamIds);
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function CalendarMatchEditor({
  match,
  gender = "masculino",
  compact = false,
  className,
}: CalendarMatchEditorProps) {
  const { bundles } = useSeason();
  const { getOverride, mergeSaveValue } = useInlineEditing();
  const resolveTeamName = useResolveTeamName(gender);
  const override = readMatchResultOverride<MatchResultOverride>(getOverride, gender, match.id) ?? {};
  const editedMatch = applyMatchResultOverride(calendarMatchToMatch(match), override, gender, resolveTeamName);
  const status = editedMatch.status;

  const teams = useMemo(() => fixtureEditorTeamOptions(bundles, gender), [bundles, gender]);

  const savePatch = (patch: MatchResultOverride) => {
    const next: MatchResultOverride = { ...patch };
    if (next.homeScore !== undefined && next.awayScore !== undefined) {
      next.status = "finished";
    }
    mergeSaveValue(matchResultOverrideKey(gender, match.id), next);
  };

  const onHomeTeamChange = (teamId: string) => {
    savePatch({
      homeTeamId: teamId,
      homeTeam: teamDisplayName(teamId, gender, resolveTeamName, editedMatch.homeTeam),
    });
  };

  const onAwayTeamChange = (teamId: string) => {
    savePatch({
      awayTeamId: teamId,
      awayTeam: teamDisplayName(teamId, gender, resolveTeamName, editedMatch.awayTeam),
    });
  };

  const onDateChange = (iso: string) => {
    savePatch({ date: iso });
  };

  const onTimeChange = (timeValue: string) => {
    savePatch({
      date: mergeUtcDateAndTime(
        editedMatch.date,
        spainDateInputValue(editedMatch.date),
        timeValue || DEFAULT_KICKOFF_LOCAL,
      ),
    });
  };

  const stopNav = (event: React.SyntheticEvent) => {
    event.stopPropagation();
  };

  const fieldClass = cn(
    "rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700 outline-none focus:border-[#214C9B]",
    compact && "min-w-0",
  );

  const teamSelectOptions = (side: "home" | "away") => {
    const teamId = side === "home" ? editedMatch.homeTeamId : editedMatch.awayTeamId;
    const teamName = side === "home" ? editedMatch.homeTeam : editedMatch.awayTeam;
    const inList = teams.some((team) => team.id === teamId);
    const options = teams.map((team) => (
      <option key={team.id} value={team.id}>
        {team.shortName ?? team.name}
      </option>
    ));
    if (!inList && teamId) {
      options.unshift(
        <option key={teamId} value={teamId}>
          {teamName || teamId}
        </option>,
      );
    }
    return options;
  };

  return (
    <div
      className={cn(
        "space-y-2 rounded-xl border border-[#214C9B]/25 bg-blue-50/80 p-2 shadow-sm",
        compact ? "text-[10px]" : "text-xs",
        className,
      )}
      onClick={stopNav}
      onKeyDown={stopNav}
    >
      <div className={cn("grid gap-1.5", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
        <label className="grid gap-0.5">
          <span className="font-extrabold uppercase tracking-wide text-slate-500">Local</span>
          <select
            value={editedMatch.homeTeamId}
            onChange={(event) => onHomeTeamChange(event.target.value)}
            className={fieldClass}
            aria-label="Equipo local"
          >
            {teamSelectOptions("home")}
          </select>
          <input
            type="text"
            value={editedMatch.homeTeam}
            onChange={(event) => savePatch({ homeTeam: event.target.value, homeTeamName: event.target.value })}
            className={fieldClass}
            placeholder="Nombre visible"
            aria-label="Nombre equipo local"
          />
        </label>
        <label className="grid gap-0.5">
          <span className="font-extrabold uppercase tracking-wide text-slate-500">Visitante</span>
          <select
            value={editedMatch.awayTeamId}
            onChange={(event) => onAwayTeamChange(event.target.value)}
            className={fieldClass}
            aria-label="Equipo visitante"
          >
            {teamSelectOptions("away")}
          </select>
          <input
            type="text"
            value={editedMatch.awayTeam}
            onChange={(event) => savePatch({ awayTeam: event.target.value, awayTeamName: event.target.value })}
            className={fieldClass}
            placeholder="Nombre visible"
            aria-label="Nombre equipo visitante"
          />
        </label>
      </div>

      <div className="space-y-1.5">
        <SplitDateInput
          key={editedMatch.date.slice(0, 10)}
          iso={editedMatch.date}
          onChange={onDateChange}
          fieldClassName={fieldClass}
          disabled={status === "finished"}
        />
        <label className="grid gap-0.5">
          <span className="font-extrabold uppercase tracking-wide text-slate-500">Hora (España)</span>
          <input
            type="time"
            value={utcTimeInputValue(editedMatch.date)}
            onChange={(event) => onTimeChange(event.target.value)}
            className={fieldClass}
            aria-label="Hora del partido"
            disabled={status === "finished"}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(event) => savePatch({ status: event.target.value as Match["status"] })}
          className={fieldClass}
          aria-label="Estado del partido"
        >
          <option value="scheduled">Programado</option>
          <option value="finished">Finalizado</option>
        </select>
        {status === "finished" ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={editedMatch.homeScore ?? 0}
              onChange={(event) => savePatch({ homeScore: Number(event.target.value) })}
              className={cn(fieldClass, "w-12 text-center")}
              aria-label="Goles local"
            />
            <span className="font-extrabold text-slate-400">-</span>
            <input
              type="number"
              value={editedMatch.awayScore ?? 0}
              onChange={(event) => savePatch({ awayScore: Number(event.target.value) })}
              className={cn(fieldClass, "w-12 text-center")}
              aria-label="Goles visitante"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
