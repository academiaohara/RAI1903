import { CURRENT_QUINIELA_ROUND, matchdays, RAI_TEAM_ID, teams } from "@/data/mock";
import type { GoalsPick, Match, Matchday, Prediction, PredictionOutcome } from "@/types";

export { CURRENT_QUINIELA_ROUND };

export const QUINIELA_TABS = [
  { href: "/quiniela/quiniela", label: "Quiniela" },
  { href: "/quiniela/resultado", label: "Resultado" },
  { href: "/quiniela/ranking", label: "Ranking" },
] as const;

export function goalsPickToNumber(pick: GoalsPick): number {
  return pick === "M" ? 3 : pick;
}

export function formatGoalsPick(pick: GoalsPick): string {
  return pick === "M" ? "M" : String(pick);
}

export function getMatchdayByRound(round: number): Matchday {
  return matchdays.find((matchday) => matchday.round === round) ?? matchdays[0];
}

export function getFirstKickoff(matchday: Matchday): Date {
  const dates = matchday.matches.map((match) => new Date(match.date).getTime());
  return new Date(Math.min(...dates));
}

export function hasFirstMatchStarted(matchday: Matchday, now = new Date()): boolean {
  return now.getTime() >= getFirstKickoff(matchday).getTime();
}

export function isAvilesMatch(match: Match): boolean {
  return match.homeTeamId === RAI_TEAM_ID || match.awayTeamId === RAI_TEAM_ID;
}

export function getTeamById(teamId: string) {
  return teams.find((team) => team.id === teamId);
}

export function actualOutcome(match: Match): PredictionOutcome | null {
  if (match.status !== "finished" || match.homeScore === undefined || match.awayScore === undefined) {
    return null;
  }
  if (match.homeScore > match.awayScore) return "1";
  if (match.homeScore === match.awayScore) return "X";
  return "2";
}

export function scorePredictionPoints(match: Match, prediction?: Prediction): number {
  const outcome = actualOutcome(match);
  if (!outcome || !prediction?.outcome) return 0;

  let points = prediction.outcome === outcome ? 1 : 0;

  if (isAvilesMatch(match) && prediction.goalsHome !== undefined && prediction.goalsAway !== undefined && match.homeScore !== undefined && match.awayScore !== undefined) {
    const predictedHome = goalsPickToNumber(prediction.goalsHome);
    const predictedAway = goalsPickToNumber(prediction.goalsAway);
    const actualHome = match.homeScore >= 3 ? 3 : match.homeScore;
    const actualAway = match.awayScore >= 3 ? 3 : match.awayScore;
    if (predictedHome === actualHome && predictedAway === actualAway) {
      points += 2;
    }
  }

  return points;
}

export function isMatchdayComplete(matchday: Matchday, predictions: Record<string, Prediction>): boolean {
  return matchday.matches.every((match) => {
    const prediction = predictions[match.id];
    if (!prediction?.outcome) return false;
    if (!isAvilesMatch(match)) return true;
    return prediction.goalsHome !== undefined && prediction.goalsAway !== undefined && prediction.scorer !== undefined;
  });
}

export function migratePrediction(raw: Prediction & { exactScore?: { home: number; away: number }; scorers?: string[] }): Prediction {
  const goalsHome =
    raw.goalsHome ??
    (raw.exactScore ? (raw.exactScore.home >= 3 ? "M" : (raw.exactScore.home as GoalsPick)) : undefined);
  const goalsAway =
    raw.goalsAway ??
    (raw.exactScore ? (raw.exactScore.away >= 3 ? "M" : (raw.exactScore.away as GoalsPick)) : undefined);
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
