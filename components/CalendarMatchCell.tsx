import Link from "next/link";
import { Bus, Home } from "lucide-react";
import { OpponentCrest } from "@/components/OpponentCrest";
import { TeamLink } from "@/components/TeamLink";
import { matchCompetitionShortLabel } from "@/lib/competition-labels";
import { getCompetitionAccentClass } from "@/lib/competition-styles";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { cn } from "@/lib/utils";
import type { CalendarMatch } from "@/types";
import type { Route } from "next";

type CalendarMatchCellProps = {
  match: CalendarMatch;
  day: number;
  className?: string;
  isToday?: boolean;
  todayDayClassName?: string;
  gender?: PrimerEquipoGender;
};

function bottomLabel(match: CalendarMatch) {
  if (match.played && match.result) return match.result;
  if (!match.played && match.time) return match.time;
  if (!match.played) return "Sin horario";
  return "—";
}

const detailTextClass =
  "text-[#214C9B] transition-colors group-has-[a.cal-match-overlay:hover]/card:text-white";
const detailIconClass = cn(
  "rounded-md border border-[#214C9B]/20 bg-white p-1 text-[#214C9B] transition-colors",
  "group-has-[a.cal-match-overlay:hover]/card:border-white/30 group-has-[a.cal-match-overlay:hover]/card:bg-white/15 group-has-[a.cal-match-overlay:hover]/card:text-white",
);

const teamLinkClass = cn(
  detailTextClass,
  "pointer-events-auto relative z-10 underline decoration-transparent underline-offset-2 transition-[color,text-decoration-color]",
  "hover:!text-[#981915] hover:!decoration-[#981915]",
  "group-has-[a.cal-match-overlay:hover]/card:hover:!text-[#981915] group-has-[a.cal-match-overlay:hover]/card:hover:!decoration-[#981915]",
);

const clickableCellHoverClass = cn(
  "has-[a.cal-match-overlay:hover]:-translate-y-0.5",
  "has-[a.cal-match-overlay:hover]:border-[#214C9B]",
  "has-[a.cal-match-overlay:hover]:bg-[#214C9B]",
  "has-[a.cal-match-overlay:hover]:shadow-[0_10px_24px_rgba(33,76,155,0.22)]",
);

export function CalendarMatchCell({
  match,
  day,
  className,
  isToday = false,
  todayDayClassName,
  gender = "masculino",
}: CalendarMatchCellProps) {
  const href = match.played ? match.chronicleUrl : match.previaUrl;
  const opponentTeamId = match.isHome ? match.awayTeamId : match.homeTeamId;
  const overlayLabel = match.played
    ? `Crónica: ${match.opponent}${match.result ? ` ${match.result}` : ""}`
    : `Previa: ${match.opponent}`;

  const cellClassName = cn(
    "group/card relative flex flex-col gap-2.5 rounded-xl border border-[#214C9B]/15 bg-white p-2.5 shadow-[0_4px_14px_rgba(17,24,39,0.05)] transition",
    href ? clickableCellHoverClass : "opacity-95",
    className,
  );

  return (
    <article className={cellClassName}>
      {href ? (
        <Link
          href={href as Route}
          className="cal-match-overlay absolute inset-0 z-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#214C9B]"
          aria-label={overlayLabel}
        />
      ) : null}

      <div className={cn("relative z-[1] flex flex-col gap-2.5", href && "pointer-events-none")}>
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-sm font-extrabold tabular-nums leading-none transition-colors",
              isToday && todayDayClassName
                ? cn(
                    todayDayClassName,
                    "group-has-[a.cal-match-overlay:hover]/card:bg-white group-has-[a.cal-match-overlay:hover]/card:text-[#214C9B]",
                  )
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
          <p
            className={cn(
              "text-[10px] font-bold uppercase tracking-[0.08em] leading-none",
              getCompetitionAccentClass(match.competition),
              "group-has-[a.cal-match-overlay:hover]/card:text-white",
            )}
          >
            {matchCompetitionShortLabel(match)}
          </p>
          <TeamLink gender={gender} teamId={opponentTeamId} teamName={match.opponent} className={cn("line-clamp-2 text-xs font-extrabold leading-snug", teamLinkClass)}>
            {match.opponent}
          </TeamLink>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className={cn("text-sm font-extrabold tabular-nums leading-none", detailTextClass)}>{bottomLabel(match)}</p>
          <TeamLink gender={gender} teamId={opponentTeamId} teamName={match.opponent} className={cn("shrink-0", teamLinkClass)}>
            <OpponentCrest
              logo={match.opponentLogo}
              opponent={match.opponent}
              size="sm"
              className="shrink-0 text-[#214C9B] transition group-has-[a.cal-match-overlay:hover]/card:text-white [&_img]:group-has-[a.cal-match-overlay:hover]/card:brightness-0 [&_img]:group-has-[a.cal-match-overlay:hover]/card:invert"
            />
          </TeamLink>
        </div>

        {href ? (
          <p className="text-[10px] font-bold text-[#214C9B]/80 transition group-has-[a.cal-match-overlay:hover]/card:text-white">
            {match.played ? "Leer la crónica" : "Ver la previa"}
          </p>
        ) : null}

        <p className="sr-only">
          {match.opponent}, {matchCompetitionShortLabel(match)}, {match.isHome ? "local" : "visitante"}
        </p>
      </div>
    </article>
  );
}
