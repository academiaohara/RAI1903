import Link from "next/link";
import { Bus, Home } from "lucide-react";
import { OpponentCrest } from "@/components/OpponentCrest";
import { matchCompetitionShortLabel } from "@/lib/competition-labels";
import { cn } from "@/lib/utils";
import type { CalendarMatch } from "@/types";
import type { Route } from "next";

type CalendarMatchCellProps = {
  match: CalendarMatch;
  day: number;
  className?: string;
  isToday?: boolean;
  todayDayClassName?: string;
};

function bottomLabel(match: CalendarMatch) {
  if (match.played && match.result) return match.result;
  if (!match.played && match.time) return match.time;
  if (!match.played) return "Sin horario";
  return "—";
}

const detailTextClass = "text-[#214C9B] transition-colors group-hover:text-white";
const detailIconClass =
  "rounded-lg border border-[#214C9B]/20 bg-white p-1.5 text-[#214C9B] transition-colors group-hover:border-white/30 group-hover:bg-white/15 group-hover:text-white";

export function CalendarMatchCell({ match, day, className, isToday = false, todayDayClassName }: CalendarMatchCellProps) {
  const href = match.played ? match.chronicleUrl : match.previaUrl;
  const clickable = Boolean(href);

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "text-sm font-extrabold tabular-nums transition-colors",
            isToday && todayDayClassName
              ? cn(todayDayClassName, "group-hover:bg-white group-hover:text-[#214C9B]")
              : detailTextClass,
          )}
        >
          {day}
        </span>
        <span className={detailIconClass} aria-label={match.isHome ? "Partido en casa" : "Partido fuera"}>
          {match.isHome ? <Home size={14} strokeWidth={2.25} /> : <Bus size={14} strokeWidth={2.25} />}
        </span>
      </div>

      <div className="flex items-end justify-between gap-2">
        <p className={cn("text-sm font-extrabold tabular-nums", detailTextClass)}>{bottomLabel(match)}</p>
        <OpponentCrest
          logo={match.opponentLogo}
          opponent={match.opponent}
          className="shrink-0 text-[#214C9B] transition group-hover:text-white [&_img]:group-hover:brightness-0 [&_img]:group-hover:invert"
        />
      </div>

      <p className="sr-only">
        {match.opponent}, {matchCompetitionShortLabel(match)}, {match.isHome ? "local" : "visitante"}
      </p>
    </>
  );

  const cellClassName = cn(
    "group relative flex min-h-[6.5rem] flex-col justify-start gap-0.5 rounded-2xl border border-[#214C9B]/15 bg-white p-2.5 shadow-[0_8px_20px_rgba(17,24,39,0.05)] transition sm:aspect-square sm:min-h-0 sm:p-3",
    clickable
      ? "cursor-pointer hover:-translate-y-0.5 hover:border-[#214C9B] hover:bg-[#214C9B] hover:shadow-[0_14px_28px_rgba(33,76,155,0.25)]"
      : "cursor-default opacity-95",
    className,
  );

  if (clickable && href) {
    return (
      <Link href={href as Route} className={cellClassName}>
        {content}
      </Link>
    );
  }

  return <article className={cellClassName}>{content}</article>;
}
