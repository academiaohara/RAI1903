import { PLACEHOLDER_MATCH_DATE } from "@/lib/competition/normalize-fixtures";

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

/** Día del partido anterior al día de hoy (UTC, como el calendario en lista). */
export function isMatchDateBeforeToday(dateIso: string, now: Date = new Date()): boolean {
  if (!isSchedulableMatchDate(dateIso)) return false;
  return utcDayStartMs(dateIso) < utcTodayStartMs(now);
}

/** Día del partido posterior al día de hoy (UTC). */
export function isMatchDateAfterToday(dateIso: string, now: Date = new Date()): boolean {
  if (!isSchedulableMatchDate(dateIso)) return false;
  return utcDayStartMs(dateIso) > utcTodayStartMs(now);
}

export function latestMatchesBeforeToday<T extends { date: string }>(
  matches: readonly T[],
  limit = 5,
  now: Date = new Date(),
): T[] {
  return [...matches]
    .filter((match) => isMatchDateBeforeToday(match.date, now))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function upcomingMatchesAfterToday<T extends { date: string }>(
  matches: readonly T[],
  limit = 5,
  now: Date = new Date(),
): T[] {
  return [...matches]
    .filter((match) => isMatchDateAfterToday(match.date, now))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);
}
