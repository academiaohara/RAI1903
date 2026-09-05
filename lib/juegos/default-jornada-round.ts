import {
  getFirstKickoff,
  getMatchdayByRound,
  hasFirstMatchStarted,
  isMatchdayFullyFinished,
} from "@/lib/quiniela";
import type { Matchday } from "@/types";

/** Tiempo tras el cierre de una jornada antes de pasar a la siguiente por defecto. */
export const GAME_JORNADA_AUTO_ADVANCE_MS = 48 * 60 * 60 * 1000;

/** Antelación con la que se muestra la siguiente jornada antes de su primer pitido. */
export const JORNADA_PREVIEW_BEFORE_MS = 24 * 60 * 60 * 1000;

function getMatchdayLastKickoff(matchday: Matchday): Date {
  const first = getFirstKickoff(matchday);
  if (first.getFullYear() >= 2099) return first;

  const dates = matchday.matches.map((match) => new Date(match.date).getTime());
  return new Date(Math.max(...dates));
}

function clampRound(round: number, totalRounds: number): number {
  return Math.min(Math.max(1, round), totalRounds);
}

function isSchedulableKickoff(date: Date): boolean {
  return date.getFullYear() < 2099;
}

function isWithinPreviewWindow(firstKickoff: Date, now: Date, previewBeforeMs: number): boolean {
  if (!isSchedulableKickoff(firstKickoff)) return false;
  return now.getTime() >= firstKickoff.getTime() - previewBeforeMs;
}

/**
 * Jornada activa según calendario: la última cuya primera fecha ya pasó o cuya
 * siguiente está a menos de `previewBeforeMs` del primer pitido.
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
 * - la activa por calendario (empezó o entra en ventana de previsualización),
 * - o la siguiente si la anterior terminó hace al menos 48 h (último pitido).
 */
export function computeDefaultGameRound(
  matchdays: Matchday[],
  totalRounds: number,
  currentRound: number,
  now = new Date(),
): number {
  const activeRound = getActiveJornadaRound(matchdays, totalRounds, now);
  let round = clampRound(Math.max(currentRound, activeRound), totalRounds);

  while (round < totalRounds) {
    const matchday = getMatchdayByRound(matchdays, round);
    if (matchday.matches.length === 0) break;
    if (!isMatchdayFullyFinished(matchday)) break;

    const lastKickoff = getMatchdayLastKickoff(matchday);
    if (!isSchedulableKickoff(lastKickoff)) break;

    const advanceAfter = lastKickoff.getTime() + GAME_JORNADA_AUTO_ADVANCE_MS;
    if (now.getTime() < advanceAfter) break;

    round += 1;
  }

  return clampRound(round, totalRounds);
}
