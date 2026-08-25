import { RAI_TEAM_ID, teams as mockTeams } from "@/data/mock";
import { isPlaceholderMatch, isSchedulableMatchday } from "@/lib/competition/normalize-fixtures";
import { getAllAvilesScorerIdsFromEvents, getAllAvilesScorerLabelsFromEvents } from "@/lib/aviles-match-events";
import {
  getSupportedTeamGoalsPick,
  getSupportedTeamScorerIds,
  getSupportedTeamScorerLabels,
  isSupportedTeamMatch,
} from "@/lib/match-goals";
import type { MatchGoalEntry } from "@/types/match-goals";
import type { MatchEvent } from "@/types";
import type { SquadPlayer } from "@/types/squad";
import type { GoalsPick, Match, Matchday, Prediction, PredictionOutcome, Team } from "@/types";
import {
  getHomeAwayRecordBeforeRound,
  getTeamsAtRound,
  type HomeAwayRecord,
} from "@/lib/standings";
import {
  isQuinielaScorerNone,
  QUINIELA_SCORER_NONE,
  resolveScorerIdFromPrediction,
} from "@/lib/quiniela-scorer";

export const QUINIELA_TABS = [
  { href: "/juegos/quiniela/pronosticos", label: "Pronosticos" },
  { href: "/juegos/quiniela/resultado", label: "Resultado" },
  { href: "/juegos/quiniela/ranking", label: "Ranking" },
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
  return isSupportedTeamMatch(match, RAI_TEAM_ID);
}

export function isFeaturedTeamMatch(match: Match, supportedTeamId: string): boolean {
  return isSupportedTeamMatch(match, supportedTeamId);
}

export function getAvilesGoalsPick(match: Match, prediction: Prediction): GoalsPick | undefined {
  return getSupportedTeamGoalsPick(match, RAI_TEAM_ID, prediction);
}

export function getFeaturedTeamGoalsPick(
  match: Match,
  supportedTeamId: string,
  prediction: Prediction,
): GoalsPick | undefined {
  return getSupportedTeamGoalsPick(match, supportedTeamId, prediction);
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

/** Signo efectivo del pronóstico (en el equipo seguido, prioriza el derivado de la porra). */
export function getEffectivePredictionOutcome(
  match: Match,
  prediction: Prediction,
  supportedTeamId: string = RAI_TEAM_ID,
): PredictionOutcome | undefined {
  if (isFeaturedTeamMatch(match, supportedTeamId)) {
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

export function actualFeaturedTeamScorerIds(
  match: Match,
  supportedTeamId: string,
  options?: {
    goals?: MatchGoalEntry[];
    squad?: SquadPlayer[];
    events?: MatchEvent[];
  },
): string[] {
  const teamScore =
    match.homeTeamId === supportedTeamId
      ? match.homeScore
      : match.awayTeamId === supportedTeamId
        ? match.awayScore
        : undefined;
  if (teamScore === undefined || teamScore === null) return [];
  if (teamScore === 0) return [QUINIELA_SCORER_NONE];

  if (options?.goals && options.squad) {
    const fromJornada = getSupportedTeamScorerIds(match, supportedTeamId, options.goals, options.squad);
    if (fromJornada.length > 0) return fromJornada;
  }

  if (supportedTeamId === RAI_TEAM_ID && options?.events && options.squad) {
    const fromChronicle = getAllAvilesScorerIdsFromEvents(match, options.events, options.squad);
    if (fromChronicle.length > 0) return fromChronicle;
  }

  return [];
}

export function actualFeaturedTeamScorers(
  match: Match,
  supportedTeamId: string,
  options?: {
    goals?: MatchGoalEntry[];
    squad?: SquadPlayer[];
    events?: MatchEvent[];
  },
): string[] {
  const teamScore =
    match.homeTeamId === supportedTeamId
      ? match.homeScore
      : match.awayTeamId === supportedTeamId
        ? match.awayScore
        : undefined;
  if (teamScore === undefined || teamScore === null) return [];
  if (teamScore === 0) return ["nadie"];

  if (options?.goals && options.squad) {
    const fromJornada = getSupportedTeamScorerLabels(match, supportedTeamId, options.goals, options.squad);
    if (fromJornada.length > 0) return fromJornada;
  }

  if (supportedTeamId === RAI_TEAM_ID && options?.events && options.squad) {
    const fromChronicle = getAllAvilesScorerLabelsFromEvents(match, options.events, options.squad);
    if (fromChronicle.length > 0) return fromChronicle;
  }

  return [];
}

export function actualAvilesScorers(
  match: Match,
  options?: { events?: MatchEvent[]; squad?: SquadPlayer[]; goals?: MatchGoalEntry[] },
): string[] {
  return actualFeaturedTeamScorers(match, RAI_TEAM_ID, options);
}

export function actualFeaturedTeamScorerId(
  match: Match,
  supportedTeamId: string,
  options?: {
    goals?: MatchGoalEntry[];
    squad?: SquadPlayer[];
    events?: MatchEvent[];
  },
): string | null {
  const all = actualFeaturedTeamScorerIds(match, supportedTeamId, options);
  return all.length > 0 ? all[0]! : null;
}

export function actualFeaturedTeamScorer(
  match: Match,
  supportedTeamId: string,
  options?: {
    goals?: MatchGoalEntry[];
    squad?: SquadPlayer[];
    events?: MatchEvent[];
  },
): string | null {
  const all = actualFeaturedTeamScorers(match, supportedTeamId, options);
  return all.length > 0 ? all[0]! : null;
}

export function actualAvilesScorer(
  match: Match,
  options?: { events?: MatchEvent[]; squad?: SquadPlayer[]; goals?: MatchGoalEntry[] },
): string | null {
  return actualFeaturedTeamScorer(match, RAI_TEAM_ID, options);
}

export function isScorerPredictionCorrect(
  match: Match,
  prediction: Prediction,
  options?: {
    goals?: MatchGoalEntry[];
    events?: MatchEvent[];
    squad?: SquadPlayer[];
    supportedTeamId?: string;
  },
): boolean {
  const supportedTeamId = options?.supportedTeamId ?? RAI_TEAM_ID;
  const predictedId = options?.squad
    ? resolveScorerIdFromPrediction(options.squad, prediction)
    : prediction.scorerId;
  const actualId = actualFeaturedTeamScorerId(match, supportedTeamId, options);

  if (predictedId && actualId) {
    return predictedId === actualId;
  }

  if (!prediction.scorer) return false;
  const actual = actualFeaturedTeamScorer(match, supportedTeamId, options);
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
  goals?: MatchGoalEntry[];
  events?: MatchEvent[];
  squad?: SquadPlayer[];
  supportedTeamId?: string;
};

export function scorePredictionPoints(
  match: Match,
  prediction?: Prediction,
  options?: ScorePredictionOptions,
): number {
  const outcome = actualOutcome(match);
  if (!outcome || !prediction) return 0;

  const supportedTeamId = options?.supportedTeamId ?? RAI_TEAM_ID;
  const predictedOutcome = getEffectivePredictionOutcome(match, prediction, supportedTeamId);
  if (!predictedOutcome) return 0;

  if (isFeaturedTeamMatch(match, supportedTeamId)) {
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

export function sortQuinielaMatches(matches: Match[], supportedTeamId: string = RAI_TEAM_ID): Match[] {
  return [...matches].sort(
    (a, b) =>
      Number(isFeaturedTeamMatch(a, supportedTeamId)) - Number(isFeaturedTeamMatch(b, supportedTeamId)),
  );
}

export function isMatchdayComplete(
  matchday: Matchday,
  predictions: Record<string, Prediction>,
  supportedTeamId: string = RAI_TEAM_ID,
): boolean {
  return matchday.matches.every((match) => {
    const prediction = predictions[match.id];
    if (!prediction?.outcome) return false;
    if (!isFeaturedTeamMatch(match, supportedTeamId)) return true;
    if (prediction.goalsHome === undefined || prediction.goalsAway === undefined) return false;
    if (!prediction.outcome) return false;
    const teamGoals = getFeaturedTeamGoalsPick(match, supportedTeamId, prediction);
    if (teamGoals === 0) {
      return isQuinielaScorerNone(prediction.scorerId) || prediction.scorer === QUINIELA_SCORER_NONE;
    }
    const predictedId = prediction.scorerId;
    if (predictedId) return !isQuinielaScorerNone(predictedId);
    return Boolean(prediction.scorer && !isQuinielaScorerNone(prediction.scorer));
  });
}

export function countFinishedMatches(matchday: Matchday): number {
  return matchday.matches.filter((match) => actualOutcome(match) !== null).length;
}

export function isMatchdayFullyFinished(matchday: Matchday): boolean {
  return countFinishedMatches(matchday) === matchday.matches.length;
}

export function countOutcomeHits(
  matchday: Matchday,
  predictions: Record<string, Prediction>,
  supportedTeamId: string = RAI_TEAM_ID,
): number {
  return matchday.matches.reduce((total, match) => {
    const outcome = actualOutcome(match);
    const prediction = predictions[match.id];
    if (!outcome || !prediction) return total;
    const predictedOutcome = getEffectivePredictionOutcome(match, prediction, supportedTeamId);
    if (!predictedOutcome) return total;
    return total + (predictedOutcome === outcome ? 1 : 0);
  }, 0);
}

export function migratePrediction(
  raw: Omit<Prediction, "goalsHome" | "goalsAway" | "scorerId"> & {
    goalsHome?: unknown;
    goalsAway?: unknown;
    scorerId?: unknown;
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
  const scorerId = typeof raw.scorerId === "string" && raw.scorerId.length > 0 ? raw.scorerId : undefined;

  return {
    matchId: raw.matchId,
    matchday: raw.matchday,
    outcome: raw.outcome,
    goalsHome,
    goalsAway,
    scorerId,
    scorer,
    updatedAt: raw.updatedAt,
  };
}
