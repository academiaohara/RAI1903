"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Bus, Home, MapPin } from "lucide-react";
import { CompetitionLogo } from "@/components/CompetitionLogo";
import { OpponentCrest } from "@/components/OpponentCrest";
import { getListViewScrollTargetId, groupCalendarMatchesByMonth, isUtcToday } from "@/lib/calendar";
import { matchCompetitionShortLabel } from "@/lib/competition-labels";
import { getCompetitionAccentClass } from "@/lib/competition-styles";
import { cn } from "@/lib/utils";
import type { CalendarMatch } from "@/types";
import type { Route } from "next";

type CalendarListViewProps = {
  matches: CalendarMatch[];
  className?: string;
};

function formatListMatchDate(date: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

function scoreLabel(match: CalendarMatch): string {
  if (match.played && match.homeScore !== undefined && match.awayScore !== undefined) {
    return `${match.homeScore} - ${match.awayScore}`;
  }
  if (!match.played && match.time) return match.time;
  if (!match.played) return "vs";
  return "—";
}

export function CalendarListView({ matches, className }: CalendarListViewProps) {
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
      <div className="space-y-8">
        {monthGroups.map((group) => (
          <section key={group.key} aria-labelledby={`cal-list-month-${group.key}`}>
            <h3
              id={`cal-list-month-${group.key}`}
              className="mb-4 border-b-2 border-[#214C9B] pb-1.5 text-lg font-extrabold capitalize tracking-tight text-[#214C9B]"
            >
              {group.label}
            </h3>
            <ul className="space-y-3">
              {group.matches.map((match) => (
                <li key={match.id}>
                  <CalendarListRow match={match} scrollTarget={match.id === scrollTargetId} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function CalendarListRow({ match, scrollTarget }: { match: CalendarMatch; scrollTarget: boolean }) {
  const href = match.played ? match.chronicleUrl : match.previaUrl;
  const clickable = Boolean(href);
  const accent = getCompetitionAccentClass(match.competition);
  const date = new Date(match.date);
  const today = isUtcToday(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

  const content = (
    <>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "text-sm font-extrabold capitalize tabular-nums",
              today ? "rounded-lg bg-[#214C9B] px-2 py-0.5 text-white" : "text-slate-700",
            )}
          >
            {formatListMatchDate(match.date)}
          </span>
          <span className={cn("text-[11px] font-bold uppercase tracking-[0.08em]", accent)}>
            {matchCompetitionShortLabel(match)}
            {match.matchday !== undefined ? ` · J${match.matchday}` : ""}
          </span>
        </div>
        <span
          className="inline-flex items-center gap-1 rounded-lg border border-[#214C9B]/20 bg-white px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-[#214C9B]"
          aria-label={match.isHome ? "Partido en casa" : "Partido fuera"}
        >
          {match.isHome ? <Home size={12} strokeWidth={2.25} aria-hidden /> : <Bus size={12} strokeWidth={2.25} aria-hidden />}
          {match.isHome ? "Casa" : "Fuera"}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        <p className="min-w-0 break-words text-sm font-extrabold leading-snug text-[#214C9B]">{match.homeTeam}</p>
        <span className="shrink-0 rounded-2xl bg-[#214C9B] px-3 py-1.5 text-sm font-extrabold tabular-nums text-white shadow-md shadow-blue-950/10">
          {scoreLabel(match)}
        </span>
        <p className="min-w-0 break-words text-right text-sm font-extrabold leading-snug text-slate-700">{match.awayTeam}</p>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-500">
        <span className="inline-flex min-w-0 items-center gap-1">
          <MapPin size={12} className="shrink-0 text-slate-400" aria-hidden />
          <span className="break-words">{match.venue}</span>
        </span>
        <OpponentCrest logo={match.opponentLogo} opponent={match.opponent} size="sm" className="shrink-0 text-[#214C9B]" />
      </div>

      {match.played && match.result && (
        <p className="mt-1 text-xs font-bold text-emerald-700">
          Resultado Avilés: <span className="tabular-nums">{match.result}</span>
        </p>
      )}
    </>
  );

  const rowClassName = cn(
    "block rounded-2xl border border-[#214C9B]/15 bg-white p-4 shadow-[0_4px_14px_rgba(17,24,39,0.05)] transition",
    scrollTarget && "ring-2 ring-[#214C9B]/30",
    clickable && "hover:-translate-y-0.5 hover:border-[#214C9B] hover:shadow-[0_10px_24px_rgba(33,76,155,0.12)]",
  );

  if (clickable && href) {
    return (
      <Link id={`cal-list-match-${match.id}`} href={href as Route} className={rowClassName}>
        <div className="mb-2 flex items-center gap-1.5">
          <CompetitionLogo competition={match.competition} alt="" size="xs" />
          <span className="sr-only">{matchCompetitionShortLabel(match)}</span>
        </div>
        {content}
      </Link>
    );
  }

  return (
    <article id={`cal-list-match-${match.id}`} className={rowClassName}>
      <div className="mb-2 flex items-center gap-1.5">
        <CompetitionLogo competition={match.competition} alt="" size="xs" />
      </div>
      {content}
    </article>
  );
}
