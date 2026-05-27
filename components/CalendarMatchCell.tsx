import Link from "next/link";
import { Bus, Home } from "lucide-react";
import { OpponentCrest } from "@/components/OpponentCrest";
import { matchCompetitionShortLabel } from "@/lib/competition-labels";
import { getCompetitionAccentClass, getCompetitionBorderClass } from "@/lib/competition-styles";
import { cn } from "@/lib/utils";
import type { CalendarMatch } from "@/types";
import type { Route } from "next";

type CalendarMatchCellProps = {
  match: CalendarMatch;
  day: number;
  className?: string;
};

function bottomLabel(match: CalendarMatch) {
  if (match.played && match.result) return match.result;
  if (!match.played && match.time) return match.time;
  if (!match.played) return "Sin horario";
  return "—";
}

export function CalendarMatchCell({ match, day, className }: CalendarMatchCellProps) {
  const clickable = Boolean(match.chronicleUrl);
  const borderHover = getCompetitionBorderClass(match.competition);
  const accent = getCompetitionAccentClass(match.competition);

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-extrabold tabular-nums text-slate-700">{day}</span>
        <span className={cn("rounded-lg bg-slate-100 p-1.5", accent)} aria-label={match.isHome ? "Partido en casa" : "Partido fuera"}>
          {match.isHome ? <Home size={14} strokeWidth={2.25} /> : <Bus size={14} strokeWidth={2.25} />}
        </span>
      </div>

      <div className="mt-auto flex items-end justify-between gap-2">
        <p className={cn("text-sm font-extrabold tabular-nums", match.played ? "text-slate-900" : "text-[#214C9B]")}>
          {bottomLabel(match)}
        </p>
        <OpponentCrest logo={match.opponentLogo} opponent={match.opponent} className="shrink-0" />
      </div>

      <p className="sr-only">
        {match.opponent}, {matchCompetitionShortLabel(match)}, {match.isHome ? "local" : "visitante"}
      </p>
    </>
  );

  const cellClassName = cn(
    "relative flex min-h-[8.5rem] flex-col rounded-2xl border border-[#214C9B]/15 bg-white p-3 shadow-[0_8px_20px_rgba(17,24,39,0.05)] transition sm:min-h-[9.5rem] sm:aspect-square sm:p-3.5",
    clickable
      ? cn("cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(17,24,39,0.1)]", borderHover)
      : "cursor-default opacity-95",
    className,
  );

  if (clickable && match.chronicleUrl) {
    return (
      <Link href={match.chronicleUrl as Route} className={cellClassName}>
        {content}
      </Link>
    );
  }

  return <article className={cellClassName}>{content}</article>;
}
