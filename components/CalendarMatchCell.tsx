import Link from "next/link";
import { Bus, Home } from "lucide-react";
import { OpponentCrest } from "@/components/OpponentCrest";
import { matchCompetitionShortLabel } from "@/lib/competition-labels";
import { getCompetitionAccentClass } from "@/lib/competition-styles";
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
  "rounded-md border border-[#214C9B]/20 bg-white p-1 text-[#214C9B] transition-colors group-hover:border-white/30 group-hover:bg-white/15 group-hover:text-white";

export function CalendarMatchCell({ match, day, className, isToday = false, todayDayClassName }: CalendarMatchCellProps) {
  const href = match.played ? match.chronicleUrl : match.previaUrl;
  const clickable = Boolean(href);
  const accent = getCompetitionAccentClass(match.competition);

  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "text-sm font-extrabold tabular-nums leading-none transition-colors",
            isToday && todayDayClassName
              ? cn(todayDayClassName, "group-hover:bg-white group-hover:text-[#214C9B]")
              : detailTextClass,
          )}
        >
          {day}
        </span>
        <span className={detailIconClass} aria-label={match.isHome ? "Partido en casa" : "Partido fuera"}>
          {match.isHome ? <Home size={13} strokeWidth={2.25} /> : <Bus size={13} strokeWidth={2.25} />}
        </span>
      </div>

      <div className="space-y-1">
        <p className={cn("text-[10px] font-bold uppercase tracking-[0.08em] leading-none", accent, "group-hover:text-white")}>
          {matchCompetitionShortLabel(match)}
        </p>
        <p className={cn("line-clamp-2 text-xs font-extrabold leading-snug", detailTextClass)}>{match.opponent}</p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className={cn("text-sm font-extrabold tabular-nums leading-none", detailTextClass)}>{bottomLabel(match)}</p>
        <OpponentCrest
          logo={match.opponentLogo}
          opponent={match.opponent}
          size="sm"
          className="shrink-0 text-[#214C9B] transition group-hover:text-white [&_img]:group-hover:brightness-0 [&_img]:group-hover:invert"
        />
      </div>

      <p className="sr-only">
        {match.opponent}, {matchCompetitionShortLabel(match)}, {match.isHome ? "local" : "visitante"}
      </p>
    </>
  );

  const cellClassName = cn(
    "group relative flex flex-col gap-2.5 rounded-xl border border-[#214C9B]/15 bg-white p-2.5 shadow-[0_4px_14px_rgba(17,24,39,0.05)] transition",
    clickable
      ? "cursor-pointer hover:-translate-y-0.5 hover:border-[#214C9B] hover:bg-[#214C9B] hover:shadow-[0_10px_24px_rgba(33,76,155,0.22)]"
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
