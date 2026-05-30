"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CompetitionLogo } from "@/components/CompetitionLogo";
import { OpponentCrest } from "@/components/OpponentCrest";
import { TeamLink } from "@/components/TeamLink";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { getListViewScrollTargetId, isUtcToday } from "@/lib/calendar";
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
  "grid w-full min-w-[44rem] grid-cols-[7rem_2.75rem_5.5rem_minmax(6rem,1fr)_3.25rem_minmax(8rem,1.15fr)_minmax(5.5rem,0.95fr)] items-center gap-x-3";

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
  if (match.time) return match.time;
  const parsed = new Date(match.date);
  if (Number.isNaN(parsed.getTime())) return "—";
  if (parsed.getUTCHours() === 0 && parsed.getUTCMinutes() === 0) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsed);
}

function homeAwayLabel(isHome: boolean): string {
  return isHome ? "Local" : "Visitante";
}

export function CalendarListView({ matches, className, gender = "masculino" }: CalendarListViewProps) {
  const sortedMatches = useMemo(
    () => [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [matches],
  );
  const scrollTargetId = getListViewScrollTargetId(sortedMatches);

  return (
    <div className={cn("overflow-x-auto rounded-xl border border-[#214C9B]/15 bg-white", className)} role="table" aria-label="Calendario de partidos">
      <div className="min-w-[44rem]">
        <ul role="rowgroup">
          {sortedMatches.map((match, index) => (
            <li key={match.id} role="row">
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

      <span
        className={cn("shrink-0 text-xs font-bold sm:text-sm", match.isHome ? "text-[#214C9B]" : "text-[#981915]")}
        title={match.isHome ? "Partido en casa" : "Partido fuera"}
      >
        {homeAwayLabel(match.isHome)}
      </span>

      <span className="min-w-0 truncate text-xs font-semibold text-slate-600" title={match.venue}>
        {match.venue}
      </span>

      <span
        className={cn(
          "text-right text-sm font-extrabold tabular-nums",
          match.played ? "text-slate-900" : "text-slate-400",
        )}
      >
        {resultLabel(match)}
      </span>

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

      <span className="flex min-w-0 items-center justify-end gap-1.5">
        <CompetitionLogo competition={match.competition} alt="" size="xs" className="shrink-0" />
        <span className={cn("min-w-0 truncate text-xs font-bold", accent)} title={competitionLabel}>
          {competitionLabel}
        </span>
      </span>

      <span className="sr-only">
        {match.opponent}, {competitionLabel}, {homeAwayLabel(match.isHome)}, {match.venue}
        {match.played ? `, resultado ${resultLabel(match)}` : `, ${timeLabel(match)}`}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        id={`cal-list-match-${match.id}`}
        href={href as Route}
        className={cn(rowClassName, "no-underline")}
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
