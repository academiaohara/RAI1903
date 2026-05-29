"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Check, Circle } from "lucide-react";
import { CompetitionLogo } from "@/components/CompetitionLogo";
import { OpponentCrest } from "@/components/OpponentCrest";
import { TeamLink } from "@/components/TeamLink";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { getListViewScrollTargetId, groupCalendarMatchesByMonth, isUtcToday } from "@/lib/calendar";
import { matchCompetitionShortLabel } from "@/lib/competition-labels";
import { getCompetitionAccentClass } from "@/lib/competition-styles";
import { cn } from "@/lib/utils";
import type { CalendarMatch } from "@/types";
import type { Route } from "next";

type CalendarListViewProps = {
  matches: CalendarMatch[];
  className?: string;
  gender?: PrimerEquipoGender;
};

const LIST_ROW_GRID =
  "grid w-full min-w-[44rem] grid-cols-[1.25rem_7rem_2.75rem_minmax(8rem,1.15fr)_1.5rem_minmax(6rem,1fr)_3.25rem_minmax(5.5rem,0.95fr)] items-center gap-x-3";

function formatListMatchDate(date: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function resultLabel(match: CalendarMatch): string {
  if (match.played && match.result) return match.result;
  if (match.played && match.homeScore !== undefined && match.awayScore !== undefined) {
    return `${match.homeScore}-${match.awayScore}`;
  }
  return "—";
}

function timeLabel(match: CalendarMatch): string {
  if (match.played) return "—";
  return match.time ?? "—";
}

export function CalendarListView({ matches, className, gender = "masculino" }: CalendarListViewProps) {
  const scrollTargetId = getListViewScrollTargetId(matches);
  const monthGroups = groupCalendarMatchesByMonth(matches);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    if (!scrollTargetId || hasScrolledRef.current) return;

    const frame = requestAnimationFrame(() => {
      const element = document.getElementById(`cal-list-match-${scrollTargetId}`);
      element?.scrollIntoView({ block: "center", behavior: "auto" });
      hasScrolledRef.current = true;
    });

    return () => cancelAnimationFrame(frame);
  }, [scrollTargetId]);

  return (
    <div className={cn("max-h-[min(70vh,42rem)] overflow-y-auto scroll-smooth pr-1", className)}>
      <div className="space-y-6">
        {monthGroups.map((group) => (
          <section key={group.key} aria-labelledby={`cal-list-month-${group.key}`}>
            <h3
              id={`cal-list-month-${group.key}`}
              className="mb-2 border-b-2 border-[#214C9B] pb-1 text-lg font-extrabold capitalize tracking-tight text-[#214C9B]"
            >
              {group.label}
            </h3>
            <div className="overflow-x-auto rounded-xl border border-[#214C9B]/15">
              <div className="min-w-[44rem]">
                <div
                  className={cn(
                    LIST_ROW_GRID,
                    "border-b border-[#214C9B]/10 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500",
                  )}
                  aria-hidden
                >
                  <span />
                  <span>Fecha</span>
                  <span>Hora</span>
                  <span>Rival</span>
                  <span className="text-center">L/V</span>
                  <span>Estadio</span>
                  <span className="text-center">Res.</span>
                  <span>Competición</span>
                </div>
                <ul>
                  {group.matches.map((match, index) => (
                    <li key={match.id}>
                      <CalendarListRow
                        match={match}
                        scrollTarget={match.id === scrollTargetId}
                        gender={gender}
                        zebra={index % 2 === 1}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function CalendarListRow({
  match,
  scrollTarget,
  gender,
  zebra,
}: {
  match: CalendarMatch;
  scrollTarget: boolean;
  gender: PrimerEquipoGender;
  zebra: boolean;
}) {
  const href = match.played ? match.chronicleUrl : match.previaUrl;
  const opponentTeamId = match.isHome ? match.awayTeamId : match.homeTeamId;
  const date = new Date(match.date);
  const today = isUtcToday(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const accent = getCompetitionAccentClass(match.competition);
  const competitionLabel = `${matchCompetitionShortLabel(match)}${match.matchday !== undefined ? ` · J${match.matchday}` : ""}`;

  const rowClassName = cn(
    LIST_ROW_GRID,
    "border-b border-[#214C9B]/8 px-3 py-2.5 text-sm transition last:border-b-0",
    zebra ? "bg-slate-50/80" : "bg-white",
    scrollTarget && "bg-blue-50/90 ring-1 ring-inset ring-[#214C9B]/25",
    today && !scrollTarget && "bg-[#214C9B]/[0.06]",
    href && "hover:bg-[#214C9B]/10",
  );

  const content = (
    <>
      <span className="flex justify-center" aria-hidden>
        {match.played ? (
          <Check size={14} className="text-emerald-600" strokeWidth={2.5} />
        ) : (
          <Circle size={14} className="text-slate-300" strokeWidth={2} />
        )}
      </span>

      <time
        dateTime={match.date}
        className={cn(
          "shrink-0 truncate text-xs font-bold capitalize tabular-nums sm:text-sm",
          today ? "font-extrabold text-[#214C9B]" : "text-slate-700",
        )}
      >
        {formatListMatchDate(match.date)}
      </time>

      <span className="shrink-0 text-xs font-bold tabular-nums text-slate-600 sm:text-sm">{timeLabel(match)}</span>

      <span className="flex min-w-0 items-center gap-2">
        <TeamLink gender={gender} teamId={opponentTeamId} teamName={match.opponent} className="shrink-0">
          <OpponentCrest logo={match.opponentLogo} opponent={match.opponent} size="sm" className="text-[#214C9B]" />
        </TeamLink>
        <TeamLink
          gender={gender}
          teamId={opponentTeamId}
          teamName={match.opponent}
          className="min-w-0 truncate text-sm font-extrabold text-[#214C9B] hover:underline"
        >
          {match.opponent}
        </TeamLink>
      </span>

      <span
        className="text-center text-xs font-extrabold uppercase tabular-nums text-[#214C9B]"
        aria-label={match.isHome ? "Partido en casa" : "Partido fuera"}
      >
        {match.isHome ? "L" : "V"}
      </span>

      <span className="min-w-0 truncate text-xs font-semibold text-slate-600" title={match.venue}>
        {match.venue}
      </span>

      <span
        className={cn(
          "text-center text-sm font-extrabold tabular-nums",
          match.played ? "text-slate-900" : "text-slate-400",
        )}
      >
        {resultLabel(match)}
      </span>

      <span className="flex min-w-0 items-center gap-1.5">
        <CompetitionLogo competition={match.competition} alt="" size="xs" className="shrink-0" />
        <span className={cn("min-w-0 truncate text-xs font-bold", accent)} title={competitionLabel}>
          {competitionLabel}
        </span>
      </span>

      <span className="sr-only">
        {match.opponent}, {competitionLabel}, {match.isHome ? "en casa" : "fuera"}, {match.venue}
        {match.played ? `, resultado ${resultLabel(match)}` : match.time ? `, ${match.time}` : ""}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        id={`cal-list-match-${match.id}`}
        href={href as Route}
        className={cn(rowClassName, "block no-underline")}
        aria-label={`${match.opponent}, ${match.played ? "cronica" : "previa"}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <article id={`cal-list-match-${match.id}`} className={rowClassName}>
      {content}
    </article>
  );
}
