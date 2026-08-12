import { areGoalsPredictionCorrect, getMatchdayByRound, hasFirstMatchStarted } from "@/lib/quiniela";
import type { GoalsPick, Match, Matchday, Prediction } from "@/types";

export type QuinigolPrediction = {
  matchId: string;
  matchday: number;
  goalsHome?: GoalsPick;
  goalsAway?: GoalsPick;
  updatedAt: string;
};

export function quinigolToPrediction(prediction: QuinigolPrediction): Prediction {
  return {
    matchId: prediction.matchId,
    matchday: prediction.matchday,
    goalsHome: prediction.goalsHome,
    goalsAway: prediction.goalsAway,
    updatedAt: prediction.updatedAt,
  };
}

export function isQuinigolMatchComplete(
  match: Match,
  predictions: Record<string, QuinigolPrediction>,
): boolean {
  const prediction = predictions[match.id];
  return prediction?.goalsHome !== undefined && prediction?.goalsAway !== undefined;
}

export function isQuinigolMatchdayComplete(
  matchday: Matchday,
  predictions: Record<string, QuinigolPrediction>,
): boolean {
  return matchday.matches.every((match) => isQuinigolMatchComplete(match, predictions));
}

export function scoreQuinigolMatch(match: Match, prediction?: QuinigolPrediction): number {
  if (!prediction) return 0;
  return areGoalsPredictionCorrect(match, quinigolToPrediction(prediction)) ? 1 : 0;
}

export function scoreQuinigolMatchday(
  matchday: Matchday,
  predictions: Record<string, QuinigolPrediction>,
): number {
  return matchday.matches.reduce(
    (total, match) => total + scoreQuinigolMatch(match, predictions[match.id]),
    0,
  );
}

export function countQuinigolHits(
  matchday: Matchday,
  predictions: Record<string, QuinigolPrediction>,
): number {
  return matchday.matches.reduce((total, match) => {
    return total + (scoreQuinigolMatch(match, predictions[match.id]) > 0 ? 1 : 0);
  }, 0);
}

export function getFirstSeasonMatchday(matchdays: Matchday[]): Matchday | null {
  if (matchdays.length === 0) return null;
  const firstRound = Math.min(...matchdays.map((matchday) => matchday.round));
  return getMatchdayByRound(matchdays, firstRound);
}

export function hasSeasonStarted(matchdays: Matchday[], now = new Date()): boolean {
  const firstMatchday = getFirstSeasonMatchday(matchdays);
  if (!firstMatchday) return false;
  return hasFirstMatchStarted(firstMatchday, now);
}
