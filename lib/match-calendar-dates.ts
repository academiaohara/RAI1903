import { PLACEHOLDER_MATCH_DATE } from "@/lib/competition/normalize-fixtures";
import { spainCalendarDayKey, spainTodayKey } from "@/lib/match-kickoff-time";
import { isMatchPlayed } from "@/lib/match-result";
import type { MatchStatus } from "@/types";

export function utcDayStartMs(dateIso: string): number {
  const date = new Date(dateIso);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function utcTodayStartMs(now: Date = new Date()): number {
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

/** Fecha válida para listados (no placeholder de calendario vacío). */
export function isSchedulableMatchDate(dateIso: string): boolean {
  if (dateIso === PLACEHOLDER_MATCH_DATE) return false;
  return !Number.isNaN(new Date(dateIso).getTime());
}

export function isMatchDateToday(dateIso: string, now: Date = new Date()): boolean {
  if (!isSchedulableMatchDate(dateIso)) return false;
  return spainCalendarDayKey(dateIso) === spainTodayKey(now);
}

/** Día del partido anterior al día de hoy (hora peninsular). */
export function isMatchDateBeforeToday(dateIso: string, now: Date = new Date()): boolean {
  if (!isSchedulableMatchDate(dateIso)) return false;
  return spainCalendarDayKey(dateIso) < spainTodayKey(now);
}

/** Día del partido posterior al día de hoy (hora peninsular). */
export function isMatchDateAfterToday(dateIso: string, now: Date = new Date()): boolean {
  if (!isSchedulableMatchDate(dateIso)) return false;
  return spainCalendarDayKey(dateIso) > spainTodayKey(now);
}

type MatchListEntry = {
  date: string;
  status?: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  played?: boolean;
};

function isLatestMatchCandidate(match: MatchListEntry, now: Date): boolean {
  if (isMatchDateBeforeToday(match.date, now)) return true;
  return isMatchDateToday(match.date, now) && isMatchPlayed(match);
}

function isUpcomingMatchCandidate(match: MatchListEntry, now: Date): boolean {
  if (isMatchPlayed(match)) return false;
  if (isMatchDateAfterToday(match.date, now)) return true;
  return isMatchDateToday(match.date, now);
}

export function latestMatchesBeforeToday<T extends MatchListEntry>(
  matches: readonly T[],
  limit = 5,
  now: Date = new Date(),
): T[] {
  return [...matches]
    .filter((match) => isLatestMatchCandidate(match, now))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function upcomingMatchesAfterToday<T extends MatchListEntry>(
  matches: readonly T[],
  limit = 5,
  now: Date = new Date(),
): T[] {
  return [...matches]
    .filter((match) => isUpcomingMatchCandidate(match, now))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);
}
