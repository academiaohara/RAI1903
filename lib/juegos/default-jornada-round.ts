import {
  getFirstKickoff,
  getMatchdayByRound,
  isMatchdayFullyFinished,
} from "@/lib/quiniela";
import type { Matchday } from "@/types";

/** Tiempo tras el cierre de una jornada antes de pasar a la siguiente por defecto. */
export const GAME_JORNADA_AUTO_ADVANCE_MS = 48 * 60 * 60 * 1000;

function getMatchdayLastKickoff(matchday: Matchday): Date {
  const first = getFirstKickoff(matchday);
  if (first.getFullYear() >= 2099) return first;

  const dates = matchday.matches.map((match) => new Date(match.date).getTime());
  return new Date(Math.max(...dates));
}

function clampRound(round: number, totalRounds: number): number {
  return Math.min(Math.max(1, round), totalRounds);
}

/**
 * Jornada por defecto en RAIniela / RAIGol: la actual en curso, o la siguiente
 * cuando la jornada anterior terminó hace al menos 48 h (según el último pitido).
 */
export function computeDefaultGameRound(
  matchdays: Matchday[],
  totalRounds: number,
  currentRound: number,
  now = new Date(),
): number {
  let round = clampRound(currentRound, totalRounds);

  while (round < totalRounds) {
    const matchday = getMatchdayByRound(matchdays, round);
    if (matchday.matches.length === 0) break;
    if (!isMatchdayFullyFinished(matchday)) break;

    const lastKickoff = getMatchdayLastKickoff(matchday);
    if (lastKickoff.getFullYear() >= 2099) break;

    const advanceAfter = lastKickoff.getTime() + GAME_JORNADA_AUTO_ADVANCE_MS;
    if (now.getTime() < advanceAfter) break;

    round += 1;
  }

  return clampRound(round, totalRounds);
}
