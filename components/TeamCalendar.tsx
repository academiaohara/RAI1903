"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarListView } from "@/components/CalendarListView";
import { CalendarMatchCell } from "@/components/CalendarMatchCell";
import { CalendarViewToggle } from "@/components/CalendarViewToggle";
import { buildSingleCalendarMonth, isUtcToday, WEEKDAY_LABELS } from "@/lib/calendar";
import { matchCompetitionShortLabel } from "@/lib/competition-labels";
import { getCompetitionAccentClass } from "@/lib/competition-styles";
import { cn } from "@/lib/utils";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { CalendarMatch, CalendarViewMode } from "@/types";

type TeamCalendarProps = {
  matches: CalendarMatch[];
  className?: string;
  gender?: PrimerEquipoGender;
  /** When true, only the list view is shown (no month toggle). */
  listOnly?: boolean;
  showCrests?: boolean;
};

const TODAY_DAY_CLASS = "inline-flex min-w-[1.75rem] items-center justify-center rounded-lg bg-[#214C9B] px-2 py-0.5 text-sm font-extrabold text-white";

const EMPTY_CELL_CLASS = "flex items-start rounded-xl px-2 py-2.5";

const PLACEHOLDER_CELL_CLASS = "px-2 py-2.5";

function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(Date.UTC(year, month + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
}

function initialViewDate(matches: CalendarMatch[]): { year: number; month: number } {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const hasMatchesThisMonth = matches.some((match) => {
    const date = new Date(match.date);
    return date.getUTCFullYear() === year && date.getUTCMonth() === month;
  });
  if (hasMatchesThisMonth || matches.length === 0) return { year, month };

  const first = new Date(matches[0].date);
  return { year: first.getUTCFullYear(), month: first.getUTCMonth() };
}

export function TeamCalendar({
  matches,
  className,
  gender = "masculino",
  listOnly = false,
  showCrests: showCrestsProp,
}: TeamCalendarProps) {
  const showCrests = showCrestsProp ?? gender !== "femenino";
  const initial = initialViewDate(matches);
  const [viewMode, setViewMode] = useState<CalendarViewMode>(listOnly ? "lista" : "mes");
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);

  const month = useMemo(() => buildSingleCalendarMonth(viewYear, viewMonth, matches), [viewYear, viewMonth, matches]);

  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(
      new Date(Date.UTC(month.year, month.month, 1)),
    );
  }, [month.month, month.year]);

  const goPrev = () => {
    const next = shiftMonth(viewYear, viewMonth, -1);
    setViewYear(next.year);
    setViewMonth(next.month);
  };

  const goNext = () => {
    const next = shiftMonth(viewYear, viewMonth, 1);
    setViewYear(next.year);
    setViewMonth(next.month);
  };

  if (matches.length === 0) {
    return <p className="text-sm font-bold text-slate-500">No hay partidos en el calendario de esta temporada.</p>;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", listOnly && "hidden")}>
        <CalendarViewToggle value={viewMode} onChange={setViewMode} />
        {viewMode === "mes" && (
          <div className="flex items-center justify-center gap-1 sm:gap-2 sm:justify-end" role="group" aria-label="Navegación del calendario">
            <button
              type="button"
              onClick={goPrev}
              className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-[#214C9B]/20 p-2 text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
              aria-label="Mes anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <h3
              id={`cal-month-${month.key}`}
              className="min-w-[9rem] flex-1 text-center text-base font-extrabold capitalize tracking-tight text-[#214C9B] sm:min-w-[11rem] sm:flex-none sm:text-lg"
            >
              {monthLabel}
            </h3>
            <button
              type="button"
              onClick={goNext}
              className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-[#214C9B]/20 p-2 text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50"
              aria-label="Mes siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {viewMode === "lista" ? (
        <CalendarListView key="lista" matches={matches} gender={gender} showCrests={showCrests} />
      ) : (
        <>
          <div className="hidden lg:block">
            <div className="mb-1.5 grid grid-cols-7 gap-1.5">
              {WEEKDAY_LABELS.map((label) => (
                <span key={label} className="text-center text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  {label}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 items-start gap-2">
              {month.weeks.flat().map((cell, index) => {
                if (!cell) {
                  return <div key={`${month.key}-empty-${index}`} className={PLACEHOLDER_CELL_CLASS} aria-hidden />;
                }
                const today = isUtcToday(month.year, month.month, cell.day);
                if (!cell.match) {
                  return (
                    <div key={`${month.key}-day-${cell.day}`} className={EMPTY_CELL_CLASS}>
                      <span
                        className={
                          today
                            ? TODAY_DAY_CLASS
                            : "inline-flex min-w-[1.75rem] items-center justify-center text-sm font-bold text-slate-400"
                        }
                      >
                        {cell.day}
                      </span>
                    </div>
                  );
                }
                return (
                  <CalendarMatchCell
                    key={cell.match.id}
                    match={cell.match}
                    day={cell.day}
                    isToday={today}
                    todayDayClassName={TODAY_DAY_CLASS}
                    gender={gender}
                  />
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
            {monthMatchesInOrder(month).map((match) => (
              <MobileCalendarCard key={match.id} match={match} gender={gender} />
            ))}
            {monthMatchesInOrder(month).length === 0 && (
              <p className="col-span-full text-center text-sm font-bold text-slate-500">Sin partidos este mes.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function monthMatchesInOrder(month: { weeks: Array<Array<{ day: number; match?: CalendarMatch } | null>> }): CalendarMatch[] {
  return month.weeks
    .flat()
    .filter((cell): cell is { day: number; match: CalendarMatch } => Boolean(cell?.match))
    .map((cell) => cell.match);
}

function MobileCalendarCard({ match, gender }: { match: CalendarMatch; gender: PrimerEquipoGender }) {
  const day = new Date(match.date).getUTCDate();
  const accent = getCompetitionAccentClass(match.competition);

  return (
    <div className="space-y-2">
      <p className={cn("text-[11px] font-bold uppercase tracking-[0.1em]", accent)}>
        {matchCompetitionShortLabel(match)}
      </p>
      <CalendarMatchCell match={match} day={day} className="w-full" gender={gender} />
    </div>
  );
}
