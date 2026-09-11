import { isPlaceholderMatch } from "@/lib/competition/normalize-fixtures";
import {
  addSpainCalendarDays,
  isMatchDateToday,
  isMatchDateTomorrow,
} from "@/lib/match-calendar-dates";
import { spainCalendarDayKey, spainTodayKey } from "@/lib/match-kickoff-time";
import { isMatchPlayed } from "@/lib/match-result";
import {
  getFirstKickoff,
  getMatchdayByRound,
  hasFirstMatchStarted,
} from "@/lib/quiniela";
import type { Match, Matchday } from "@/types";

/** Días de calendario (hora peninsular) tras el último partido jugado antes de pasar a la siguiente jornada. */
export const GAME_JORNADA_AUTO_ADVANCE_CALENDAR_DAYS = 2;

/** @deprecated Usar GAME_JORNADA_AUTO_ADVANCE_CALENDAR_DAYS (días de calendario). */
export const GAME_JORNADA_AUTO_ADVANCE_MS = GAME_JORNADA_AUTO_ADVANCE_CALENDAR_DAYS * 24 * 60 * 60 * 1000;

/** Antelación con la que se muestra la siguiente jornada antes de su primer pitido. */
export const JORNADA_PREVIEW_BEFORE_MS = 24 * 60 * 60 * 1000;

function getSchedulableMatches(matchday: Matchday): Match[] {
  return matchday.matches.filter((match) => !isPlaceholderMatch(match));
}

function clampRound(round: number, totalRounds: number): number {
  return Math.min(Math.max(1, round), totalRounds);
}

function isSchedulableKickoff(date: Date): boolean {
  return date.getFullYear() < 2099;
}

function isWithinPreviewWindow(firstKickoff: Date, now: Date, previewBeforeMs: number): boolean {
  if (!isSchedulableKickoff(firstKickoff)) return false;
  const iso = firstKickoff.toISOString();
  if (isMatchDateToday(iso, now) || isMatchDateTomorrow(iso, now)) return true;
  return now.getTime() >= firstKickoff.getTime() - previewBeforeMs;
}

/** Último día (hora peninsular) con al menos un partido ya jugado en la jornada. */
function getMatchdayLastPlayedDayKey(matchday: Matchday, now: Date): string | null {
  const playedElapsed = getSchedulableMatches(matchday).filter(
    (match) => isMatchPlayed(match) && new Date(match.date).getTime() <= now.getTime(),
  );
  if (playedElapsed.length === 0) return null;

  const lastPlayedMs = playedElapsed.reduce(
    (max, match) => Math.max(max, new Date(match.date).getTime()),
    0,
  );
  return spainCalendarDayKey(new Date(lastPlayedMs).toISOString());
}

/**
 * ¿Ya toca mostrar la jornada siguiente?
 * Ej.: último partido jugado el 7 → desde el 9 (2 días de calendario después).
 */
export function canAdvancePastMatchday(matchday: Matchday, now: Date): boolean {
  const lastPlayedDay = getMatchdayLastPlayedDayKey(matchday, now);
  if (!lastPlayedDay) return false;
  const advanceFromDay = addSpainCalendarDays(lastPlayedDay, GAME_JORNADA_AUTO_ADVANCE_CALENDAR_DAYS);
  return spainTodayKey(now) >= advanceFromDay;
}

/**
 * Jornada activa según calendario: la última cuya primera fecha ya pasó o cuya
 * siguiente es hoy/mañana (hora peninsular) o entra en la ventana de 24 h previa.
 */
export function getActiveJornadaRound(
  matchdays: Matchday[],
  totalRounds: number,
  now = new Date(),
  previewBeforeMs = JORNADA_PREVIEW_BEFORE_MS,
): number {
  let active = 1;

  for (let round = 1; round <= totalRounds; round += 1) {
    const matchday = getMatchdayByRound(matchdays, round);
    if (matchday.matches.length === 0) break;

    const firstKickoff = getFirstKickoff(matchday);
    if (!isSchedulableKickoff(firstKickoff)) break;

    const started = hasFirstMatchStarted(matchday, now);
    const inPreview = isWithinPreviewWindow(firstKickoff, now, previewBeforeMs);
    if (started || inPreview) {
      active = round;
    }
  }

  return clampRound(active, totalRounds);
}

/**
 * Jornada por defecto en Jornadas / RAIniela / RAIGol:
 * - avanza a la siguiente cuando pasaron 2 días de calendario desde el último partido jugado,
 * - o la activa por previsualización (hoy/mañana o 24 h antes del pitido).
 */
export function computeDefaultGameRound(
  matchdays: Matchday[],
  totalRounds: number,
  currentRound: number,
  now = new Date(),
): number {
  let advancedRound = 1;

  while (advancedRound < totalRounds) {
    const matchday = getMatchdayByRound(matchdays, advancedRound);
    if (matchday.matches.length === 0) break;
    if (!canAdvancePastMatchday(matchday, now)) break;
    advancedRound += 1;
  }

  const previewRound = getActiveJornadaRound(matchdays, totalRounds, now);
  return clampRound(Math.max(advancedRound, previewRound, currentRound), totalRounds);
}
