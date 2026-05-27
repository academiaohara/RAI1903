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

export function TeamCalendar({ months, className }: TeamCalendarProps) {
  if (months.length === 0) {
    return <p className="text-sm font-bold text-slate-500">No hay partidos en el calendario de esta temporada.</p>;
  }

  return (
    <div className={cn("space-y-10", className)}>
      {months.map((month) => (
        <section key={month.key} aria-labelledby={`cal-month-${month.key}`}>
          <h3 id={`cal-month-${month.key}`} className="mb-4 text-lg font-extrabold uppercase tracking-tight text-[#214C9B]">
            {month.label}
          </h3>

          {/* Desktop: month grid */}
          <div className="hidden lg:block">
            <div className="mb-2 grid grid-cols-7 gap-2">
              {WEEKDAY_LABELS.map((label) => (
                <span key={label} className="text-center text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  {label}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {month.weeks.flat().map((cell, index) => {
                if (!cell) {
                  return <div key={`${month.key}-empty-${index}`} className="min-h-[9.5rem] rounded-2xl bg-slate-50/60" aria-hidden />;
                }
                if (!cell.match) {
                  return (
                    <div
                      key={`${month.key}-day-${cell.day}`}
                      className="flex min-h-[9.5rem] items-start rounded-2xl border border-dashed border-[#214C9B]/10 bg-slate-50/40 p-3"
                    >
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
          </div>
        </section>
      ))}
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
      <CalendarMatchCell match={match} day={day} className="min-h-[9rem] w-full sm:aspect-auto" />
    </div>
  );
}
