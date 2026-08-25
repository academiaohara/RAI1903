import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import { getPlayerDisplayName, hasDisplayDorsal } from "@/lib/squad-utils";
import type { GoalsPick, Match, Matchday } from "@/types";
import type { MatchGoalEntry, MatchGoalsPayload } from "@/types/match-goals";
import type { SquadPlayer } from "@/types/squad";

const MATCH_GOALS_PREFIX = "match-goals:";

export const OWN_GOAL_PLAYER_KEY = "pp";

export function matchGoalsOverrideKey(gender: PrimerEquipoGender, matchId: string): string {
  return `${MATCH_GOALS_PREFIX}${gender}:${matchId}`;
}

export function readMatchGoalsOverride(
  getOverride: (key: string) => unknown,
  gender: PrimerEquipoGender,
  matchId: string,
): MatchGoalsPayload | undefined {
  const scoped = getOverride(matchGoalsOverrideKey(gender, matchId));
  if (!scoped || typeof scoped !== "object") return undefined;
  const goals = (scoped as MatchGoalsPayload).goals;
  if (!Array.isArray(goals)) return undefined;
  return { goals: goals.filter(isValidGoalEntry) };
}

function isValidGoalEntry(entry: unknown): entry is MatchGoalEntry {
  if (!entry || typeof entry !== "object") return false;
  const goal = entry as MatchGoalEntry;
  return (
    (goal.teamSide === "home" || goal.teamSide === "away") &&
    typeof goal.playerKey === "string" &&
    goal.playerKey.length > 0 &&
    Number.isFinite(goal.minute) &&
    goal.minute >= 0
  );
}

export function normalizeRivalFoot(
  pie?: RivalSquadFootLike,
): "Derecha" | "Izquierda" | "Ambidiestro" {
  if (!pie) return "Derecha";
  const normalized = pie.toLowerCase();
  if (normalized.startsWith("izq")) return "Izquierda";
  if (normalized.startsWith("amb")) return "Ambidiestro";
  return "Derecha";
}

type RivalSquadFootLike = "Derecha" | "Izquierda" | "Ambidiestro" | "Derecho" | "Izquierdo" | string;

export function countGoalsFromEntries(goals: MatchGoalEntry[]): { home: number; away: number } {
  return goals.reduce(
    (acc, goal) => {
      if (goal.teamSide === "home") acc.home += 1;
      else acc.away += 1;
      return acc;
    },
    { home: 0, away: 0 },
  );
}

export function squadPlayerFromGoalKey(squad: SquadPlayer[], playerKey: string): SquadPlayer | undefined {
  const byId = squad.find((player) => player.id === playerKey);
  if (byId) return byId;

  const dorsal = Number(playerKey);
  if (Number.isFinite(dorsal) && hasDisplayDorsal(dorsal)) {
    return squad.find((player) => player.dorsal === dorsal);
  }

  return undefined;
}

export function goalEntryLabel(
  goal: MatchGoalEntry,
  homeTeamName: string,
  awayTeamName: string,
  homeSquad: SquadPlayer[],
  awaySquad: SquadPlayer[],
): string {
  if (goal.playerKey === OWN_GOAL_PLAYER_KEY) {
    const conceding = goal.teamSide === "home" ? awayTeamName : homeTeamName;
    return `PP (${conceding})`;
  }

  const squad = goal.teamSide === "home" ? homeSquad : awaySquad;
  const player = squadPlayerFromGoalKey(squad, goal.playerKey);
  if (player) return getPlayerDisplayName(player);

  return `#${goal.playerKey}`;
}

export function formatGoalMinute(minute: number): string {
  return `${minute}'`;
}

export function formatMatchGoalsSummary(
  goals: MatchGoalEntry[],
  homeTeamName: string,
  awayTeamName: string,
  homeSquad: SquadPlayer[],
  awaySquad: SquadPlayer[],
): string {
  if (goals.length === 0) return "";
  const sorted = [...goals].sort((a, b) => a.minute - b.minute);
  return sorted
    .map((goal) => {
      const label = goalEntryLabel(goal, homeTeamName, awayTeamName, homeSquad, awaySquad);
      return `${label} ${formatGoalMinute(goal.minute)}`;
    })
    .join(", ");
}

export function aggregateTeamPlayerGoals(
  matchdays: Matchday[],
  teamId: string,
  getGoalsForMatch: (matchId: string) => MatchGoalEntry[],
): Map<string, number> {
  const totals = new Map<string, number>();

  for (const matchday of matchdays) {
    for (const match of matchday.matches) {
      if (match.status !== "finished") continue;
      if (match.homeTeamId !== teamId && match.awayTeamId !== teamId) continue;

      const goals = getGoalsForMatch(match.id);
      for (const goal of goals) {
        if (goal.playerKey === OWN_GOAL_PLAYER_KEY) continue;
        const scoresForTeam =
          (match.homeTeamId === teamId && goal.teamSide === "home") ||
          (match.awayTeamId === teamId && goal.teamSide === "away");
        if (!scoresForTeam) continue;
        totals.set(goal.playerKey, (totals.get(goal.playerKey) ?? 0) + 1);
      }
    }
  }

  return totals;
}

export function getSupportedTeamScorerLabels(
  match: Match,
  supportedTeamId: string,
  goals: MatchGoalEntry[],
  squad: SquadPlayer[],
): string[] {
  const isHome = match.homeTeamId === supportedTeamId;
  const isAway = match.awayTeamId === supportedTeamId;
  if (!isHome && !isAway) return [];

  const teamSide = isHome ? "home" : "away";
  const teamGoals = goals
    .filter((goal) => goal.teamSide === teamSide && goal.playerKey !== OWN_GOAL_PLAYER_KEY)
    .sort((a, b) => a.minute - b.minute);

  const labels: string[] = [];
  for (const goal of teamGoals) {
    const player = squadPlayerFromGoalKey(squad, goal.playerKey);
    if (!player) continue;
    const label = getPlayerDisplayName(player);
    if (!labels.includes(label)) labels.push(label);
  }
  return labels;
}

export function getSupportedTeamScorerIds(
  match: Match,
  supportedTeamId: string,
  goals: MatchGoalEntry[],
  squad: SquadPlayer[],
): string[] {
  const isHome = match.homeTeamId === supportedTeamId;
  const isAway = match.awayTeamId === supportedTeamId;
  if (!isHome && !isAway) return [];

  const teamSide = isHome ? "home" : "away";
  const teamGoals = goals
    .filter((goal) => goal.teamSide === teamSide && goal.playerKey !== OWN_GOAL_PLAYER_KEY)
    .sort((a, b) => a.minute - b.minute);

  const ids: string[] = [];
  for (const goal of teamGoals) {
    const player = squadPlayerFromGoalKey(squad, goal.playerKey);
    if (!player) continue;
    if (!ids.includes(player.id)) ids.push(player.id);
  }
  return ids;
}

export function isSupportedTeamMatch(match: Match, supportedTeamId: string): boolean {
  return match.homeTeamId === supportedTeamId || match.awayTeamId === supportedTeamId;
}

export function getSupportedTeamGoalsPick(
  match: Match,
  supportedTeamId: string,
  prediction: { goalsHome?: GoalsPick; goalsAway?: GoalsPick },
): GoalsPick | undefined {
  return match.homeTeamId === supportedTeamId ? prediction.goalsHome : prediction.goalsAway;
}

export function findLastFinishedMatchForTeam(
  matchdays: Matchday[],
  teamId: string,
): Match | null {
  let last: Match | null = null;
  let lastTime = -Infinity;

  for (const matchday of matchdays) {
    for (const match of matchday.matches) {
      if (match.status !== "finished") continue;
      if (match.homeTeamId !== teamId && match.awayTeamId !== teamId) continue;
      const time = new Date(match.date).getTime();
      if (time >= lastTime) {
        lastTime = time;
        last = match;
      }
    }
  }

  return last;
}
