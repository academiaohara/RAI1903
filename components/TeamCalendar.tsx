"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarMatchCell } from "@/components/CalendarMatchCell";
import { WEEKDAY_LABELS, type CalendarMonth } from "@/lib/calendar";
import { matchCompetitionShortLabel } from "@/lib/competition-labels";
import { getCompetitionAccentClass } from "@/lib/competition-styles";
import { cn } from "@/lib/utils";
import type { CalendarMatch } from "@/types";

type TeamCalendarProps = {
  months: CalendarMonth[];
  className?: string;
};

const EMPTY_CELL_CLASS =
  "flex min-h-[6.5rem] items-start rounded-2xl border border-dashed border-[#214C9B]/10 bg-slate-50/40 p-2.5 sm:aspect-square sm:min-h-0";

const PLACEHOLDER_CELL_CLASS = "min-h-[6.5rem] rounded-2xl bg-slate-50/60 sm:aspect-square sm:min-h-0";

function findInitialMonthIndex(months: CalendarMonth[]): number {
  if (months.length === 0) return 0;
  const now = new Date();
  const key = `${now.getUTCFullYear()}-${now.getUTCMonth()}`;
  const index = months.findIndex((month) => month.key === key);
  return index >= 0 ? index : 0;
}

export function TeamCalendar({ months, className }: TeamCalendarProps) {
  const [monthIndex, setMonthIndex] = useState(() => findInitialMonthIndex(months));

  const safeIndex = Math.min(Math.max(monthIndex, 0), Math.max(months.length - 1, 0));
  const month = months[safeIndex];

  const monthLabel = useMemo(() => {
    if (!month) return "";
    return new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(
      new Date(Date.UTC(month.year, month.month, 1)),
    );
  }, [month]);

  if (months.length === 0) {
    return <p className="text-sm font-bold text-slate-500">No hay partidos en el calendario de esta temporada.</p>;
  }

  if (!month) return null;

  const atFirst = safeIndex === 0;
  const atLast = safeIndex === months.length - 1;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-center gap-1 sm:gap-2" role="group" aria-label="Navegación del calendario">
        <button
          type="button"
          onClick={() => setMonthIndex((index) => Math.max(0, index - 1))}
          disabled={atFirst}
          className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-[#214C9B]/20 p-2 text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Mes anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <h3
          id={`cal-month-${month.key}`}
          className="min-w-[9rem] flex-1 text-center text-base font-extrabold capitalize tracking-tight text-[#214C9B] sm:min-w-[11rem] sm:text-lg"
        >
          {monthLabel}
        </h3>
        <button
          type="button"
          onClick={() => setMonthIndex((index) => Math.min(months.length - 1, index + 1))}
          disabled={atLast}
          className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-[#214C9B]/20 p-2 text-[#214C9B] transition hover:border-[#214C9B] hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Mes siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Desktop: month grid */}
      <div className="hidden lg:block">
        <div className="mb-1.5 grid grid-cols-7 gap-1.5">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label} className="text-center text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
              {label}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {month.weeks.flat().map((cell, index) => {
            if (!cell) {
              return <div key={`${month.key}-empty-${index}`} className={PLACEHOLDER_CELL_CLASS} aria-hidden />;
            }
            if (!cell.match) {
              return (
                <div key={`${month.key}-day-${cell.day}`} className={EMPTY_CELL_CLASS}>
                  <span className="text-sm font-bold text-slate-400">{cell.day}</span>
                </div>
              );
            }
            return <CalendarMatchCell key={cell.match.id} match={cell.match} day={cell.day} />;
          })}
        </div>
      </div>

      {/* Mobile / tablet: match cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
        {monthMatchesInOrder(month).map((match) => (
          <MobileCalendarCard key={match.id} match={match} />
        ))}
        {monthMatchesInOrder(month).length === 0 && (
          <p className="col-span-full text-center text-sm font-bold text-slate-500">Sin partidos este mes.</p>
        )}
      </div>
    </div>
  );
}

function monthMatchesInOrder(month: CalendarMonth): CalendarMatch[] {
  return month.weeks
    .flat()
    .filter((cell): cell is { day: number; match: CalendarMatch } => Boolean(cell?.match))
    .map((cell) => cell.match);
}

function MobileCalendarCard({ match }: { match: CalendarMatch }) {
  const day = new Date(match.date).getUTCDate();
  const accent = getCompetitionAccentClass(match.competition);

  return (
    <div className="space-y-2">
      <p className={cn("text-[11px] font-bold uppercase tracking-[0.1em]", accent)}>
        {matchCompetitionShortLabel(match)}
      </p>
      <CalendarMatchCell match={match} day={day} className="min-h-[7rem] w-full sm:aspect-auto" />
    </div>
  );
}
