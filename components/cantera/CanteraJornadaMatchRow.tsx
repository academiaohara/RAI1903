"use client";

import { OpponentCrest } from "@/components/OpponentCrest";
import { SplitDateInput } from "@/components/calendar/SplitDateInput";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { shortNameFromFull } from "@/lib/cantera-data";
import type { CanteraCmsScope } from "@/lib/cantera/cantera-cms";
import {
  mergeUtcDateAndTime,
  utcDateInputValue,
  utcTimeInputValue,
} from "@/lib/calendar-match-overrides";
import { applyJornadaFixtureOverride } from "@/lib/jornada-fixture-overrides";
import { canteraMatchResultOverrideKey, readCanteraMatchResultOverride } from "@/lib/fixture-inline-keys";
import { DEFAULT_KICKOFF_UTC } from "@/lib/match-kickoff-time";
import { formatMatchScore, isMatchPlayed } from "@/lib/match-result";
import { getTeamCrestById } from "@/lib/team-crests";
import { formatMatchDate, cn } from "@/lib/utils";
import type { JornadaFixture } from "@/types/jornadas";

type CanteraJornadaMatchRowProps = {
  fixture: JornadaFixture;
  highlighted?: boolean;
  highlightTeamId?: string;
  scope: CanteraCmsScope;
};

function scoreOrTime(fixture: JornadaFixture): string {
  if (isMatchPlayed(fixture) && fixture.homeScore !== undefined && fixture.awayScore !== undefined) {
    return formatMatchScore(fixture.homeScore, fixture.awayScore);
  }
  if (!isMatchPlayed(fixture) && fixture.kickoffTime) return fixture.kickoffTime;
  return formatMatchDate(fixture.date).split(",").pop()?.trim() ?? "—";
}

function crestInitialsFromName(name: string): string {
  return name.replace(/\s+U19$/i, "").slice(0, 3).toUpperCase() || "EQP";
}

function crestForTeam(teamId: string, teamName: string) {
  const crestClassName = "h-3.5 w-3.5 shrink-0 sm:h-7 sm:w-7";
  return (
    <OpponentCrest
      logo={getTeamCrestById(teamId, crestInitialsFromName(teamName))}
      opponent={teamName}
      size="sm"
      className={crestClassName}
    />
  );
}

export function CanteraJornadaMatchRow({
  fixture,
  highlighted = false,
  highlightTeamId,
  scope,
}: CanteraJornadaMatchRowProps) {
  const { editMode, getOverride, mergeSaveValue } = useInlineEditing();
  const override =
    readCanteraMatchResultOverride<Partial<JornadaFixture>>(getOverride, scope, fixture.id) ?? {};
  const editedFixture = applyJornadaFixtureOverride(fixture, override);
  const highlightHome = Boolean(highlightTeamId && editedFixture.homeTeamId === highlightTeamId);
  const highlightAway = Boolean(highlightTeamId && editedFixture.awayTeamId === highlightTeamId);

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
    mergeSaveValue(canteraMatchResultOverrideKey(scope, fixture.id), next);
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

  return (
    <article
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 rounded-2xl border p-2.5 sm:gap-3 sm:p-4",
        highlighted
          ? "border-[#981915]/40 bg-gradient-to-br from-[#981915]/6 via-white to-[#214C9B]/5 shadow-[0_10px_28px_rgba(152,25,21,0.12)]"
          : "border-[#214C9B]/12 bg-slate-50/80",
      )}
    >
      <div className="flex min-w-0 items-center gap-0.5 sm:gap-2">
        {crestForTeam(editedFixture.homeTeamId, editedFixture.homeTeamName)}
        {editMode ? (
          <input
            type="text"
            value={editedFixture.homeTeamName}
            onChange={(event) => savePatch({ homeTeamName: event.target.value })}
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-1 py-0.5 text-[10px] font-bold text-slate-700 outline-none"
            aria-label="Equipo local"
          />
        ) : (
          <p className={cn(nameClass(highlightHome), "min-w-0 text-left")}>
            <span className="sm:hidden">{shortNameFromFull(editedFixture.homeTeamName)}</span>
            <span className="hidden sm:inline">{editedFixture.homeTeamName}</span>
          </p>
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
        {editMode ? (
          <input
            type="text"
            value={editedFixture.awayTeamName}
            onChange={(event) => savePatch({ awayTeamName: event.target.value })}
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-1 py-0.5 text-[10px] font-bold text-slate-700 outline-none text-right"
            aria-label="Equipo visitante"
          />
        ) : (
          <p className={cn(nameClass(highlightAway), "min-w-0 text-right")}>
            <span className="sm:hidden">{shortNameFromFull(editedFixture.awayTeamName)}</span>
            <span className="hidden sm:inline">{editedFixture.awayTeamName}</span>
          </p>
        )}
        {crestForTeam(editedFixture.awayTeamId, editedFixture.awayTeamName)}
      </div>
    </article>
  );
}
