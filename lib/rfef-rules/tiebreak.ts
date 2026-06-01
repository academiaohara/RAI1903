import { computeMiniLeagueStats, headToHeadGoalDifference } from "@/lib/rfef-rules/mini-league";
import type {
  FairPlayScores,
  LeagueTiebreakContext,
  LeagueTiebreakRules,
  MultiTeamTiebreakCriterion,
  TiebreakResolutionStatus,
  TiebreakSortMeta,
  TwoTeamTiebreakCriterion,
  UnresolvedTiebreakAction,
} from "@/lib/rfef-rules/types";
import type { FinishedLeagueMatch, TeamStandingsAccumulator } from "@/lib/standings";

export type TiebreakSortResult = {
  orderedTeamIds: string[];
  metaByTeamId: Map<string, TiebreakSortMeta>;
};

type CriterionKey = TwoTeamTiebreakCriterion | MultiTeamTiebreakCriterion;

function criterionValue(
  teamId: string,
  criterion: CriterionKey,
  teamIds: readonly string[],
  accumulators: ReadonlyMap<string, TeamStandingsAccumulator>,
  matches: readonly FinishedLeagueMatch[],
  fairPlay?: FairPlayScores,
): number | null {
  const acc = accumulators.get(teamId);
  if (!acc) return null;

  switch (criterion) {
    case "head-to-head-goal-diff": {
      const other = teamIds.find((id) => id !== teamId);
      if (!other) return null;
      return headToHeadGoalDifference(teamId, other, matches);
    }
    case "mini-league-points":
    case "mini-league-goal-diff": {
      const mini = computeMiniLeagueStats(teamIds, matches);
      const row = mini.get(teamId);
      if (!row) return null;
      return criterion === "mini-league-points" ? row.points : row.goalDifference;
    }
    case "overall-goal-diff":
      return acc.goalsFor - acc.goalsAgainst;
    case "overall-goals-for":
      return acc.goalsFor;
    case "fair-play": {
      const score = fairPlay?.[teamId];
      return score === undefined ? null : -score;
    }
    default:
      return null;
  }
}

function partitionByCriterion(
  teamIds: readonly string[],
  criterion: CriterionKey,
  accumulators: ReadonlyMap<string, TeamStandingsAccumulator>,
  matches: readonly FinishedLeagueMatch[],
  fairPlay?: FairPlayScores,
): Array<{ value: number; teamIds: string[] }> {
  const buckets = new Map<number, string[]>();

  for (const teamId of teamIds) {
    const value = criterionValue(teamId, criterion, teamIds, accumulators, matches, fairPlay);
    const key = value ?? Number.NEGATIVE_INFINITY;
    const list = buckets.get(key) ?? [];
    list.push(teamId);
    buckets.set(key, list);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => b - a)
    .map(([value, ids]) => ({ value, teamIds: ids }));
}

function allValuesMissing(
  teamIds: readonly string[],
  criterion: CriterionKey,
  teamIdsContext: readonly string[],
  accumulators: ReadonlyMap<string, TeamStandingsAccumulator>,
  matches: readonly FinishedLeagueMatch[],
  fairPlay?: FairPlayScores,
): boolean {
  return teamIds.every(
    (id) =>
      criterionValue(id, criterion, teamIdsContext, accumulators, matches, fairPlay) === null,
  );
}

function resolveSubgroup(
  teamIds: readonly string[],
  accumulators: ReadonlyMap<string, TeamStandingsAccumulator>,
  matches: readonly FinishedLeagueMatch[],
  rules: LeagueTiebreakRules,
  fairPlay?: FairPlayScores,
): { ordered: string[]; pending: boolean } {
  if (teamIds.length <= 1) {
    return { ordered: [...teamIds], pending: false };
  }

  const criteria: readonly CriterionKey[] =
    teamIds.length === 2 ? rules.twoTeam : rules.threePlus;

  for (const criterion of criteria) {
    if (criterion === "fair-play" && allValuesMissing(teamIds, criterion, teamIds, accumulators, matches, fairPlay)) {
      continue;
    }

    const buckets = partitionByCriterion(teamIds, criterion, accumulators, matches, fairPlay);

    if (buckets.length === 1) continue;

    const ordered: string[] = [];
    let pending = false;
    for (const bucket of buckets) {
      if (bucket.teamIds.length === 1) {
        ordered.push(bucket.teamIds[0]!);
      } else {
        const sub = resolveSubgroup(bucket.teamIds, accumulators, matches, rules, fairPlay);
        ordered.push(...sub.ordered);
        if (sub.pending) {
          pending = true;
          const included = new Set(sub.ordered);
          const missing = bucket.teamIds.filter((id) => !included.has(id));
          ordered.push(...[...missing].sort((a, b) => a.localeCompare(b)));
        }
      }
    }
    return { ordered, pending };
  }

  const fallback = [...teamIds].sort((a, b) => a.localeCompare(b));
  return { ordered: fallback, pending: true };
}

function unresolvedStatus(action: UnresolvedTiebreakAction): TiebreakResolutionStatus {
  return action === "playoff-match" ? "playoff-match" : "pending-official";
}

function unresolvedNote(action: UnresolvedTiebreakAction): string {
  return action === "playoff-match"
    ? "Empate sin resolver: partido de desempate"
    : "Empate sin resolver: pendiente de resolución oficial";
}

/**
 * Ordena un grupo de equipos empatados en puntos según el reglamento RFEF configurable.
 * Los equipos separados por un criterio quedan colocados; el subgrupo restante reinicia el proceso.
 */
export function sortTiedTeams(
  teamIds: readonly string[],
  accumulators: ReadonlyMap<string, TeamStandingsAccumulator>,
  matches: readonly FinishedLeagueMatch[],
  context: LeagueTiebreakContext,
): TiebreakSortResult {
  const { ordered, pending } = resolveSubgroup(
    teamIds,
    accumulators,
    matches,
    context.rules,
    context.fairPlay,
  );

  const metaByTeamId = new Map<string, TiebreakSortMeta>();
  if (pending) {
    const status = unresolvedStatus(context.rules.unresolved);
    const note = unresolvedNote(context.rules.unresolved);
    for (const id of ordered) {
      metaByTeamId.set(id, { status, note });
    }
  }

  return { orderedTeamIds: ordered, metaByTeamId };
}

export type TeamWithPoints = { teamId: string; points: number };

/**
 * Ordena la clasificación completa: puntos y, dentro de cada bloque empatado, desempate RFEF.
 */
export function sortStandingsByRfefRules(
  rows: readonly TeamStandingsAccumulator[],
  matches: readonly FinishedLeagueMatch[],
  context: LeagueTiebreakContext,
): TiebreakSortResult {
  const accumulators = new Map(rows.map((row) => [row.teamId, row]));
  const byPoints = new Map<number, string[]>();

  for (const row of rows) {
    const list = byPoints.get(row.points) ?? [];
    list.push(row.teamId);
    byPoints.set(row.points, list);
  }

  const pointLevels = [...byPoints.keys()].sort((a, b) => b - a);
  const orderedTeamIds: string[] = [];
  const metaByTeamId = new Map<string, TiebreakSortMeta>();

  for (const points of pointLevels) {
    const tied = byPoints.get(points)!;
    if (tied.length === 1) {
      orderedTeamIds.push(tied[0]!);
      continue;
    }

    const result = sortTiedTeams(tied, accumulators, matches, context);
    orderedTeamIds.push(...result.orderedTeamIds);
    for (const [id, meta] of result.metaByTeamId) {
      metaByTeamId.set(id, meta);
    }
  }

  return { orderedTeamIds, metaByTeamId };
}
