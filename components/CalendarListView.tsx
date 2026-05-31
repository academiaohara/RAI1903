"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CompetitionLogo } from "@/components/CompetitionLogo";
import { OpponentCrest } from "@/components/OpponentCrest";
import { TeamLink } from "@/components/TeamLink";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { getListViewScrollTargetId, isUtcToday } from "@/lib/calendar";
import { matchCompetitionShortLabel, matchJornadaLabel } from "@/lib/competition-labels";
import { getCompetitionAccentClass } from "@/lib/competition-styles";
import { cn } from "@/lib/utils";
import type { CalendarMatch } from "@/types";
import type { Route } from "next";

type CalendarListViewProps = {
  matches: CalendarMatch[];
  className?: string;
  gender?: PrimerEquipoGender;
  showCrests?: boolean;
  showVenue?: boolean;
};

const LIST_ROW_GRID_WITH_VENUE =
  "grid w-full min-w-[44rem] grid-cols-[7rem_2.75rem_5.5rem_minmax(6rem,1fr)_3.25rem_minmax(8rem,1.15fr)_minmax(5.5rem,0.95fr)] items-center gap-x-3";

const LIST_ROW_GRID_WITHOUT_VENUE =
  "grid w-full min-w-[38rem] grid-cols-[7rem_2.75rem_5.5rem_3.25rem_minmax(8rem,1.15fr)_minmax(5.5rem,0.95fr)] items-center gap-x-3";

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

export function CalendarListView({
  matches,
  className,
  gender = "masculino",
  showCrests = true,
  showVenue = true,
}: CalendarListViewProps) {
  const sortedMatches = useMemo(
    () => [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [matches],
  );
  const scrollTargetId = getListViewScrollTargetId(sortedMatches);

  return (
    <div className={cn("overflow-x-auto rounded-xl border border-[#214C9B]/15 bg-white", className)} role="table" aria-label="Calendario de partidos">
      <div className={showVenue ? "min-w-[44rem]" : "min-w-[38rem]"}>
        <ul role="rowgroup">
          {sortedMatches.map((match, index) => (
            <li key={match.id} role="row">
              <CalendarListRow
                match={match}
                scrollTarget={match.id === scrollTargetId}
                gender={gender}
                zebra={index % 2 === 1}
                showCrests={showCrests}
                showVenue={showVenue}
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
  showCrests,
  showVenue,
}: {
  match: CalendarMatch;
  scrollTarget: boolean;
  gender: PrimerEquipoGender;
  zebra: boolean;
  showCrests: boolean;
  showVenue: boolean;
}) {
  const href = match.played ? match.chronicleUrl : match.previaUrl;
  const opponentTeamId = match.isHome ? match.awayTeamId : match.homeTeamId;
  const date = new Date(match.date);
  const today = isUtcToday(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const accent = getCompetitionAccentClass(match.competition);
  const jornada = matchJornadaLabel(match);
  const competitionLabel = jornada
    ? `${matchCompetitionShortLabel(match)} · ${jornada}`
    : matchCompetitionShortLabel(match);

  const rowClassName = cn(
    showVenue ? LIST_ROW_GRID_WITH_VENUE : LIST_ROW_GRID_WITHOUT_VENUE,
    "relative border-b border-[#214C9B]/8 px-3 py-2.5 text-sm transition last:border-b-0",
    zebra ? "bg-slate-50/80" : "bg-white",
    scrollTarget && "bg-blue-50/90 ring-1 ring-inset ring-[#214C9B]/25",
    today && !scrollTarget && "bg-[#214C9B]/[0.06]",
    href && "has-[a.cal-list-overlay:hover]:bg-[#214C9B]/10",
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

      {showVenue ? (
        <span className="min-w-0 truncate text-xs font-semibold text-slate-600" title={match.venue}>
          {match.venue}
        </span>
      ) : null}

      <span
        className={cn(
          "text-right text-sm font-extrabold tabular-nums",
          match.played ? "text-slate-900" : "text-slate-400",
        )}
      >
        {resultLabel(match)}
      </span>

      <span className="flex min-w-0 items-center gap-2">
        {showCrests ? (
          <TeamLink gender={gender} teamId={opponentTeamId} teamName={match.opponent} className="relative z-10 shrink-0 pointer-events-auto">
            <OpponentCrest logo={match.opponentLogo} opponent={match.opponent} size="sm" className="text-[#214C9B]" />
          </TeamLink>
        ) : null}
        {showCrests ? (
          <TeamLink
            gender={gender}
            teamId={opponentTeamId}
            teamName={match.opponent}
            className="relative z-10 min-w-0 truncate text-sm font-extrabold text-[#214C9B] hover:underline pointer-events-auto"
          >
            {match.opponent}
          </TeamLink>
        ) : (
          <span className="min-w-0 truncate text-sm font-extrabold text-[#214C9B]">{match.opponent}</span>
        )}
      </span>

      <span className="flex min-w-0 items-center justify-end gap-1.5">
        <CompetitionLogo competition={match.competition} alt="" size="xs" className="shrink-0" />
        <span className={cn("min-w-0 truncate text-xs font-bold", accent)} title={competitionLabel}>
          {competitionLabel}
        </span>
      </span>

      <span className="sr-only">
        {match.opponent}, {competitionLabel}, {homeAwayLabel(match.isHome)}
        {showVenue ? `, ${match.venue}` : ""}
        {match.played ? `, resultado ${resultLabel(match)}` : `, ${timeLabel(match)}`}
      </span>
    </>
  );

  return (
    <article id={`cal-list-match-${match.id}`} className={rowClassName}>
      {href ? (
        <Link
          href={href as Route}
          className="cal-list-overlay absolute inset-0 z-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#214C9B]"
          aria-label={`${match.opponent}, ${match.played ? "crónica" : "previa"}`}
        />
      ) : null}
      <div className={cn("contents", href && "[&>*]:pointer-events-none [&_a]:pointer-events-auto")}>{content}</div>
    </article>
  );
}
