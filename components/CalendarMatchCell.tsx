"use client";

import { useRouter } from "next/navigation";
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

const detailTextClass = "text-[#214C9B] transition-colors group-hover/card:text-white";
const detailIconClass = cn(
  "rounded-md border border-[#214C9B]/20 bg-white p-1 text-[#214C9B] transition-colors",
  "group-hover/card:border-white/30 group-hover/card:bg-white/15 group-hover/card:text-white",
);

const teamLinkClass = cn(
  detailTextClass,
  "underline decoration-transparent underline-offset-2 transition-[color,text-decoration-color]",
  "hover:!text-[#981915] hover:!decoration-[#981915]",
  "group-hover/card:hover:!text-[#981915] group-hover/card:hover:!decoration-[#981915]",
);

const clickableCellHoverClass = cn(
  "hover:-translate-y-0.5 hover:border-[#214C9B] hover:bg-[#214C9B] hover:shadow-[0_10px_24px_rgba(33,76,155,0.22)]",
);

export function CalendarMatchCell({
  match,
  day,
  className,
  isToday = false,
  todayDayClassName,
  gender = "masculino",
}: CalendarMatchCellProps) {
  const router = useRouter();
  const href = match.played ? match.chronicleUrl : match.previaUrl;
  const opponentTeamId = match.isHome ? match.awayTeamId : match.homeTeamId;
  const ariaLabel = match.played
    ? `Crónica: ${match.opponent}${match.result ? ` ${match.result}` : ""}`
    : `Previa: ${match.opponent}`;

  const handleActivate = (event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
    if (!href) return;
    if ("target" in event && (event.target as HTMLElement).closest("a")) return;
    router.push(href as Route);
  };

  const cellClassName = cn(
    "group/card relative flex flex-col gap-2.5 rounded-xl border border-[#214C9B]/15 bg-white p-2.5 shadow-[0_4px_14px_rgba(17,24,39,0.05)] transition",
    href ? cn("cursor-pointer", clickableCellHoverClass) : "opacity-95",
    className,
  );

  return (
    <article
      className={cellClassName}
      onClick={handleActivate}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        handleActivate(event);
      }}
      role={href ? "link" : undefined}
      tabIndex={href ? 0 : undefined}
      aria-label={href ? ariaLabel : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "text-sm font-extrabold tabular-nums leading-none transition-colors",
            isToday && todayDayClassName
              ? cn(todayDayClassName, "group-hover/card:bg-white group-hover/card:text-[#214C9B]")
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
            "group-hover/card:text-white",
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
            className="shrink-0 text-[#214C9B] transition group-hover/card:text-white [&_img]:group-hover/card:brightness-0 [&_img]:group-hover/card:invert"
          />
        </TeamLink>
      </div>

      {href ? (
        <p className="text-[10px] font-bold text-[#214C9B]/80 transition group-hover/card:text-white">
          {match.played ? "Leer la crónica" : "Ver la previa"}
        </p>
      ) : null}

      <p className="sr-only">
        {match.opponent}, {matchCompetitionShortLabel(match)}, {match.isHome ? "local" : "visitante"}
      </p>
    </article>
  );
}
