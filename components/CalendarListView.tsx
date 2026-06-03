"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { CalendarMatchEditor, useEditedCalendarMatch } from "@/components/calendar/CalendarMatchEditor";
import { CompetitionLogo } from "@/components/CompetitionLogo";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
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

function formatListMatchDateShort(date: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
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
  const { canEdit } = useInlineEditing();
  const sortedMatches = useMemo(
    () => [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [matches],
  );
  const scrollTargetId = getListViewScrollTargetId(sortedMatches);

  useEffect(() => {
    if (!scrollTargetId) return;
    const element = document.getElementById(`cal-list-match-${scrollTargetId}`);
    element?.scrollIntoView({ block: "center", behavior: "instant" });
  }, [scrollTargetId]);

  return (
    <div className={cn("rounded-xl border border-[#214C9B]/15 bg-white md:overflow-x-auto", className)} role="table" aria-label="Calendario de partidos">
      <div className={showVenue ? "md:min-w-[44rem]" : "md:min-w-[38rem]"}>
        {sortedMatches.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm font-bold text-slate-500">
            {canEdit ? (
              <>
                Aún no hay partidos en esta temporada. Activa el modo edición para ajustar el calendario o añade amistosos y
                copa con el panel «Pretemporada y Copa del Rey» arriba del calendario.
              </>
            ) : (
              <>Aún no hay partidos en esta temporada.</>
            )}
          </p>
        ) : (
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
        )}
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
  const router = useRouter();
  const { editMode } = useInlineEditing();
  const displayMatch = useEditedCalendarMatch(match, gender);
  const href = editMode ? null : displayMatch.played ? displayMatch.chronicleUrl : displayMatch.previaUrl;
  const opponentTeamId = displayMatch.isHome ? displayMatch.awayTeamId : displayMatch.homeTeamId;
  const date = new Date(displayMatch.date);
  const today = isUtcToday(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const accent = getCompetitionAccentClass(displayMatch.competition);
  const jornada = matchJornadaLabel(displayMatch);
  const competitionLabel = jornada
    ? `${matchCompetitionShortLabel(displayMatch)} · ${jornada}`
    : matchCompetitionShortLabel(displayMatch);

  const rowSurface = cn(
    "relative border-b border-[#214C9B]/8 transition last:border-b-0",
    zebra ? "bg-slate-50/80" : "bg-white",
    scrollTarget && "bg-blue-50/90 ring-1 ring-inset ring-[#214C9B]/25",
    today && !scrollTarget && "bg-[#214C9B]/[0.06]",
    href && "cursor-pointer hover:bg-[#214C9B]/10",
  );

  const mobileRowClassName = cn(
    "flex w-full min-w-0 items-center gap-1.5 px-2 py-2 text-[10px] md:hidden",
    rowSurface,
  );

  const desktopRowClassName = cn(
    editMode ? "block" : showVenue ? LIST_ROW_GRID_WITH_VENUE : LIST_ROW_GRID_WITHOUT_VENUE,
    "hidden px-3 py-2.5 text-sm md:grid",
    rowSurface,
  );

  const openMatchArticle = () => {
    if (!href) return;
    router.push(href as Route);
  };

  const clickableCellClass = href ? "cursor-pointer" : undefined;

  if (editMode) {
    return (
      <article
        id={`cal-list-match-${match.id}`}
        className={cn("block px-2 py-2 sm:px-3", rowSurface)}
        aria-label="Editar partido del calendario"
      >
        <CalendarMatchEditor match={match} gender={gender} />
      </article>
    );
  }

  const mobileContent = (
    <>
      <time
        dateTime={displayMatch.date}
        className={cn(
          "w-[2.75rem] shrink-0 truncate font-bold capitalize tabular-nums",
          today ? "font-extrabold text-[#214C9B]" : "text-slate-700",
        )}
      >
        {formatListMatchDateShort(displayMatch.date)}
      </time>
      <span
        className={cn(
          "w-4 shrink-0 text-center font-bold",
          displayMatch.isHome ? "text-[#214C9B]" : "text-[#981915]",
        )}
        title={displayMatch.isHome ? "Local" : "Visitante"}
      >
        {displayMatch.isHome ? "L" : "V"}
      </span>
      <span
        className={cn(
          "w-8 shrink-0 text-center font-extrabold tabular-nums",
          displayMatch.played ? "text-slate-900" : "text-slate-400",
        )}
      >
        {resultLabel(displayMatch)}
      </span>
      <span className="flex min-w-0 flex-1 items-center gap-1">
        {showCrests ? (
          <OpponentCrest logo={displayMatch.opponentLogo} opponent={displayMatch.opponent} size="sm" className="shrink-0 text-[#214C9B]" />
        ) : null}
        <span className="min-w-0 truncate font-extrabold text-[#214C9B]">{displayMatch.opponent}</span>
      </span>
      <span className={cn("max-w-[4.5rem] shrink-0 truncate text-right font-bold", accent)} title={competitionLabel}>
        {matchCompetitionShortLabel(displayMatch)}
      </span>
    </>
  );

  const content = (
    <>
      <time
        dateTime={displayMatch.date}
        className={cn(
          "shrink-0 truncate text-xs font-bold capitalize tabular-nums sm:text-sm",
          today ? "font-extrabold text-[#214C9B]" : "text-slate-700",
          clickableCellClass,
        )}
        onClick={openMatchArticle}
      >
        {formatListMatchDate(displayMatch.date)}
      </time>

      <span
        className={cn("shrink-0 text-xs font-bold tabular-nums text-slate-600 sm:text-sm", clickableCellClass)}
        onClick={openMatchArticle}
      >
        {timeLabel(displayMatch)}
      </span>

      <span
        className={cn(
          "shrink-0 text-xs font-bold sm:text-sm",
          displayMatch.isHome ? "text-[#214C9B]" : "text-[#981915]",
          clickableCellClass,
        )}
        title={displayMatch.isHome ? "Partido en casa" : "Partido fuera"}
        onClick={openMatchArticle}
      >
        {homeAwayLabel(displayMatch.isHome)}
      </span>

      {showVenue ? (
        <span
          className={cn("min-w-0 truncate text-xs font-semibold text-slate-600", clickableCellClass)}
          title={displayMatch.venue}
          onClick={openMatchArticle}
        >
          {displayMatch.venue}
        </span>
      ) : null}

      <span
        className={cn(
          "text-right text-sm font-extrabold tabular-nums",
          displayMatch.played ? "text-slate-900" : "text-slate-400",
          clickableCellClass,
        )}
        onClick={openMatchArticle}
      >
        {resultLabel(displayMatch)}
      </span>

      <span className="flex min-w-0 items-center gap-2">
        {showCrests ? (
          <TeamLink gender={gender} teamId={opponentTeamId} teamName={displayMatch.opponent} className="shrink-0">
            <OpponentCrest logo={displayMatch.opponentLogo} opponent={displayMatch.opponent} size="sm" className="text-[#214C9B]" />
          </TeamLink>
        ) : null}
        {showCrests ? (
          <TeamLink
            gender={gender}
            teamId={opponentTeamId}
            teamName={displayMatch.opponent}
            className="min-w-0 truncate text-sm font-extrabold text-[#214C9B] hover:underline"
          >
            {displayMatch.opponent}
          </TeamLink>
        ) : (
          <span className={cn("min-w-0 truncate text-sm font-extrabold text-[#214C9B]", clickableCellClass)} onClick={openMatchArticle}>
            {displayMatch.opponent}
          </span>
        )}
      </span>

      <span className={cn("flex min-w-0 items-center justify-end gap-1.5", clickableCellClass)} onClick={openMatchArticle}>
        <CompetitionLogo competition={displayMatch.competition} alt="" size="xs" className="shrink-0" />
        <span className={cn("min-w-0 truncate text-xs font-bold", accent)} title={competitionLabel}>
          {competitionLabel}
        </span>
      </span>

      <span className="sr-only">
        {displayMatch.opponent}, {competitionLabel}, {homeAwayLabel(displayMatch.isHome)}
        {showVenue ? `, ${displayMatch.venue}` : ""}
        {displayMatch.played ? `, resultado ${resultLabel(displayMatch)}` : `, ${timeLabel(displayMatch)}`}
      </span>
    </>
  );

  const openRow = () => openMatchArticle();

  return (
    <>
      <article
        id={`cal-list-match-${match.id}`}
        className={mobileRowClassName}
        aria-label={href ? `${displayMatch.opponent}, ${displayMatch.played ? "crónica" : "previa"}` : undefined}
        onClick={href ? openRow : undefined}
        onKeyDown={
          href
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openRow();
                }
              }
            : undefined
        }
        role={href ? "button" : undefined}
        tabIndex={href ? 0 : undefined}
      >
        {mobileContent}
      </article>
      <article
        id={`cal-list-match-${match.id}-desktop`}
        className={desktopRowClassName}
        aria-label={href ? `${displayMatch.opponent}, ${displayMatch.played ? "crónica" : "previa"}` : undefined}
      >
        {content}
      </article>
    </>
  );
}
