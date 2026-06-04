import { RAI_TEAM_ID, teams as mockTeams } from "@/data/mock";
import { isPlaceholderMatch, isSchedulableMatchday } from "@/lib/competition/normalize-fixtures";
import { getAllAvilesScorerLabelsFromEvents } from "@/lib/aviles-match-events";
import type { MatchEvent } from "@/types";
import type { SquadPlayer } from "@/types/squad";
import {
  getHomeAwayRecordBeforeRound,
  getTeamsAtRound,
  type HomeAwayRecord,
} from "@/lib/standings";
import type { GoalsPick, Match, Matchday, Prediction, PredictionOutcome, Team } from "@/types";

export const QUINIELA_TABS = [
  { href: "/quiniela/quiniela", label: "Pronosticos" },
  { href: "/quiniela/resultado", label: "Resultado" },
  { href: "/quiniela/ranking", label: "Ranking" },
] as const;

export function normalizeGoalsPick(value: unknown): GoalsPick | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  if (value === "M" || value === "m") return "M";
  const n = Number(value);
  if (Number.isNaN(n)) return undefined;
  if (n >= 3) return "M";
  if (n === 0 || n === 1 || n === 2) return n;
  return undefined;
}

export function goalsPickToNumber(pick: GoalsPick): number {
  return pick === "M" ? 3 : Number(pick);
}

export function formatGoalsPick(pick: GoalsPick): string {
  return pick === "M" ? "M" : String(pick);
}

export function scoreToGoalsPick(score: number): GoalsPick {
  return score >= 3 ? "M" : (score as 0 | 1 | 2);
}

export function getActualGoalsPicks(match: Match): { home: GoalsPick | null; away: GoalsPick | null } {
  if (match.status !== "finished" || match.homeScore === undefined || match.awayScore === undefined) {
    return { home: null, away: null };
  }
  return {
    home: scoreToGoalsPick(match.homeScore),
    away: scoreToGoalsPick(match.awayScore),
  };
}

export function getMatchdayByRound(matchdays: Matchday[], round: number): Matchday {
  return matchdays.find((matchday) => matchday.round === round) ?? { round, matches: [] };
}

export function getFirstKickoff(matchday: Matchday): Date {
  const schedulable = matchday.matches.filter((match) => !isPlaceholderMatch(match));
  if (schedulable.length === 0) {
    return new Date("2099-12-31T23:59:59.000Z");
  }
  const dates = schedulable.map((match) => new Date(match.date).getTime());
  return new Date(Math.min(...dates));
}

/** Jornadas con al menos un partido real (no placeholder del calendario vacío). */
export function filterQuinielaMatchdays(matchdays: Matchday[]): Matchday[] {
  return matchdays
    .filter(isSchedulableMatchday)
    .map((matchday) => ({
      ...matchday,
      matches: matchday.matches.filter((match) => !isPlaceholderMatch(match)),
    }));
}

export function hasFirstMatchStarted(matchday: Matchday, now = new Date()): boolean {
  return now.getTime() >= getFirstKickoff(matchday).getTime();
}

/** Suma puntos si la jornada ya empezó o hay al menos un resultado oficial cargado. */
export function shouldCountQuinielaPoints(matchday: Matchday, now = new Date()): boolean {
  return hasFirstMatchStarted(matchday, now) || countFinishedMatches(matchday) > 0;
}

export function isAvilesMatch(match: Match): boolean {
  return match.homeTeamId === RAI_TEAM_ID || match.awayTeamId === RAI_TEAM_ID;
}

export function getAvilesGoalsPick(match: Match, prediction: Prediction): GoalsPick | undefined {
  return match.homeTeamId === RAI_TEAM_ID ? prediction.goalsHome : prediction.goalsAway;
}

/** 1/X/2 derivado de los goles elegidos; null si faltan datos o ambos son M. */
export function outcomeFromGoalsPicks(
  goalsHome: GoalsPick | undefined,
  goalsAway: GoalsPick | undefined,
): PredictionOutcome | null {
  if (goalsHome === undefined || goalsAway === undefined) return null;
  if (goalsHome === "M" && goalsAway === "M") return null;

  const home = goalsPickToNumber(goalsHome);
  const away = goalsPickToNumber(goalsAway);
  if (home > away) return "1";
  if (home < away) return "2";
  return "X";
}

export function isOutcomeLockedByGoals(
  goalsHome: GoalsPick | undefined,
  goalsAway: GoalsPick | undefined,
): boolean {
  return outcomeFromGoalsPicks(goalsHome, goalsAway) !== null;
}

/** Signo efectivo del pronóstico (en el Avilés, prioriza el derivado de la porra). */
export function getEffectivePredictionOutcome(
  match: Match,
  prediction: Prediction,
): PredictionOutcome | undefined {
  if (isAvilesMatch(match)) {
    const fromGoals = outcomeFromGoalsPicks(prediction.goalsHome, prediction.goalsAway);
    if (fromGoals !== null) return fromGoals;
  }
  return prediction.outcome;
}

export function getAvilesScore(match: Match): number | null {
  if (!isAvilesMatch(match) || match.homeScore === undefined || match.awayScore === undefined) {
    return null;
  }
  return match.homeTeamId === RAI_TEAM_ID ? match.homeScore : match.awayScore;
}

export function actualAvilesScorers(
  match: Match,
  options?: { events?: MatchEvent[]; squad?: SquadPlayer[] },
): string[] {
  const goals = getAvilesScore(match);
  if (goals === null) return [];
  if (goals === 0) return ["nadie"];

  if (options?.events && options.squad) {
    const fromChronicle = getAllAvilesScorerLabelsFromEvents(match, options.events, options.squad);
    if (fromChronicle.length > 0) return fromChronicle;
  }

  return [];
}

export function actualAvilesScorer(
  match: Match,
  options?: { events?: MatchEvent[]; squad?: SquadPlayer[] },
): string | null {
  const all = actualAvilesScorers(match, options);
  return all.length > 0 ? all[0]! : null;
}

export function isScorerPredictionCorrect(
  match: Match,
  prediction: Prediction,
  options?: { events?: MatchEvent[]; squad?: SquadPlayer[] },
): boolean {
  if (!prediction.scorer) return false;
  const actual = actualAvilesScorer(match, options);
  return actual !== null && prediction.scorer === actual;
}

export function getTeamById(teamId: string, teams: Team[] = mockTeams) {
  return teams.find((team) => team.id === teamId);
}

export function getTeamsBeforeRound(matchdays: Matchday[], teams: Team[], round: number): Team[] {
  return getTeamsAtRound(teams, matchdays, round);
}

export function getTeamByIdBeforeRound(
  teamId: string,
  round: number,
  matchdays: Matchday[],
  teams: Team[],
): Team | undefined {
  return getTeamsBeforeRound(matchdays, teams, round).find((team) => team.id === teamId);
}

export function getTeamHomeAwayRecordBeforeRound(
  teamId: string,
  side: "home" | "away",
  round: number,
  matchdays: Matchday[],
): HomeAwayRecord {
  return getHomeAwayRecordBeforeRound(teamId, side, matchdays, round);
}

export function actualOutcome(match: Match): PredictionOutcome | null {
  if (match.status !== "finished" || match.homeScore === undefined || match.awayScore === undefined) {
    return null;
  }
  if (match.homeScore > match.awayScore) return "1";
  if (match.homeScore === match.awayScore) return "X";
  return "2";
}

export function areGoalsPredictionCorrect(match: Match, prediction: Prediction): boolean {
  if (prediction.goalsHome === undefined || prediction.goalsAway === undefined) return false;
  if (match.homeScore === undefined || match.awayScore === undefined) return false;

  const predictedHome = goalsPickToNumber(prediction.goalsHome);
  const predictedAway = goalsPickToNumber(prediction.goalsAway);
  const actualHome = match.homeScore >= 3 ? 3 : match.homeScore;
  const actualAway = match.awayScore >= 3 ? 3 : match.awayScore;
  return predictedHome === actualHome && predictedAway === actualAway;
}

export type ScorePredictionOptions = {
  events?: MatchEvent[];
  squad?: SquadPlayer[];
};

export function scorePredictionPoints(
  match: Match,
  prediction?: Prediction,
  options?: ScorePredictionOptions,
): number {
  const outcome = actualOutcome(match);
  if (!outcome || !prediction) return 0;

  const predictedOutcome = getEffectivePredictionOutcome(match, prediction);
  if (!predictedOutcome) return 0;

  if (isAvilesMatch(match)) {
    let points = 0;
    if (predictedOutcome === outcome) points += 1;
    if (areGoalsPredictionCorrect(match, prediction)) points += 1;
    if (isScorerPredictionCorrect(match, prediction, options)) points += 1;
    return points;
  }

  return predictedOutcome === outcome ? 1 : 0;
}

export function scoreMatchdayPoints(
  matchday: Matchday,
  predictions: Record<string, Prediction>,
  options?: ScorePredictionOptions | ((match: Match) => ScorePredictionOptions | undefined),
): number {
  const resolveOptions = typeof options === "function" ? options : () => options;
  return matchday.matches.reduce((total, match) => {
    const prediction = predictions[match.id];
    return total + scorePredictionPoints(match, prediction, resolveOptions(match));
  }, 0);
}

export function sortQuinielaMatches(matches: Match[]): Match[] {
  return [...matches].sort((a, b) => Number(isAvilesMatch(a)) - Number(isAvilesMatch(b)));
}

export function isMatchdayComplete(matchday: Matchday, predictions: Record<string, Prediction>): boolean {
  return matchday.matches.every((match) => {
    const prediction = predictions[match.id];
    if (!prediction?.outcome) return false;
    if (!isAvilesMatch(match)) return true;
    if (prediction.goalsHome === undefined || prediction.goalsAway === undefined) return false;
    if (!prediction.outcome) return false;
    const avilesGoals = getAvilesGoalsPick(match, prediction);
    if (avilesGoals === 0) return prediction.scorer === "nadie";
    return Boolean(prediction.scorer && prediction.scorer !== "nadie");
  });
}

export function countFinishedMatches(matchday: Matchday): number {
  return matchday.matches.filter((match) => actualOutcome(match) !== null).length;
}

export function isMatchdayFullyFinished(matchday: Matchday): boolean {
  return countFinishedMatches(matchday) === matchday.matches.length;
}

export function countOutcomeHits(matchday: Matchday, predictions: Record<string, Prediction>): number {
  return matchday.matches.reduce((total, match) => {
    const outcome = actualOutcome(match);
    const prediction = predictions[match.id];
    if (!outcome || !prediction) return total;
    const predictedOutcome = getEffectivePredictionOutcome(match, prediction);
    if (!predictedOutcome) return total;
    return total + (predictedOutcome === outcome ? 1 : 0);
  }, 0);
}

export function migratePrediction(
  raw: Omit<Prediction, "goalsHome" | "goalsAway"> & {
    goalsHome?: unknown;
    goalsAway?: unknown;
    exactScore?: { home: number; away: number };
    scorers?: string[];
  },
): Prediction {
  const goalsHome =
    normalizeGoalsPick(raw.goalsHome) ??
    (raw.exactScore ? normalizeGoalsPick(raw.exactScore.home >= 3 ? "M" : raw.exactScore.home) : undefined);
  const goalsAway =
    normalizeGoalsPick(raw.goalsAway) ??
    (raw.exactScore ? normalizeGoalsPick(raw.exactScore.away >= 3 ? "M" : raw.exactScore.away) : undefined);
  const scorer = raw.scorer ?? (raw.scorers && raw.scorers.length > 0 ? raw.scorers[0] : undefined);

  return {
    matchId: raw.matchId,
    matchday: raw.matchday,
    outcome: raw.outcome,
    goalsHome,
    goalsAway,
    scorer,
    updatedAt: raw.updatedAt,
  };
}
