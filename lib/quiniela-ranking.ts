import type { SupabaseClient } from "@supabase/supabase-js";
import { getProfileAvatarUrl, getProfileHandle } from "@/lib/auth/user-display";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import {
  countOutcomeHits,
  getMatchdayByRound,
  migratePrediction,
  scorePredictionPoints,
  shouldCountQuinielaPoints,
} from "@/lib/quiniela";
import {
  buildQuinielaScoringContext,
  scoringOptionsForMatch,
  type QuinielaScoringContext,
} from "@/lib/quiniela/scoring-context";
import { DEFAULT_SUPPORTED_TEAM_ID } from "@/lib/quiniela-supported-team";
import type { CompetitionSeasonId } from "@/data/mock";
import type { Matchday, Prediction } from "@/types";

export type QuinielaRankingEntry = {
  userId: string;
  handle: string;
  avatarUrl: string | null;
  submittedAt: string;
  points: number;
  hits: number;
};

export type QuinielaSeasonRankingEntry = QuinielaRankingEntry & {
  roundsPlayed: number;
};

export type QuinielaUserRoundResult = {
  userId: string;
  handle: string;
  avatarUrl: string | null;
  supportedTeamId: string;
  round: number;
  savedRounds: number[];
  hasSavedRound: boolean;
  savedAt: string | null;
  predictions: Record<string, Prediction>;
  points: number;
  hits: number;
  countPoints: boolean;
};

function rowToPrediction(row: {
  match_id: string;
  matchday: number;
  outcome: string | null;
  goals_home: string | null;
  goals_away: string | null;
  scorer_id: string | null;
  scorer: string | null;
  updated_at: string;
}): Prediction {
  return migratePrediction({
    matchId: row.match_id,
    matchday: row.matchday,
    outcome: (row.outcome as Prediction["outcome"]) ?? undefined,
    goalsHome: row.goals_home,
    goalsAway: row.goals_away,
    scorerId: row.scorer_id ?? undefined,
    scorer: row.scorer ?? undefined,
    updatedAt: row.updated_at,
  });
}

export function scoreUserMatchday(
  matchday: Matchday,
  predictions: Record<string, Prediction>,
  countPoints: boolean,
  scoringContext?: QuinielaScoringContext,
): { points: number; hits: number } {
  if (!countPoints) {
    return { points: 0, hits: 0 };
  }
  let points = 0;
  for (const match of matchday.matches) {
    const prediction = predictions[match.id];
    if (prediction) {
      const options = scoringContext ? scoringOptionsForMatch(scoringContext, match) : undefined;
      points += scorePredictionPoints(match, prediction, options);
    }
  }
  return { points, hits: countOutcomeHits(matchday, predictions) };
}

export function sortRankingEntries<T extends { points: number; submittedAt: string }>(
  entries: T[],
  sortByPoints: boolean,
): T[] {
  const list = [...entries];
  if (sortByPoints) {
    list.sort((a, b) => b.points - a.points || a.submittedAt.localeCompare(b.submittedAt));
  } else {
    list.sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  }
  return list;
}

type SavedRoundRow = { user_id: string; round: number; saved_at: string };
type PredictionRow = {
  user_id: string;
  match_id: string;
  matchday: number;
  outcome: string | null;
  goals_home: string | null;
  goals_away: string | null;
  scorer_id: string | null;
  scorer: string | null;
  updated_at: string;
};
type ProfileRow = {
  id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  supported_team_id: string | null;
};

async function fetchSavedRounds(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  round?: number,
): Promise<SavedRoundRow[]> {
  return fetchAllSavedRounds(supabase, seasonId, round);
}

async function fetchPredictions(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  userIds: string[],
  matchday?: number,
): Promise<PredictionRow[]> {
  return fetchAllPredictions(supabase, seasonId, userIds, matchday);
}

async function fetchProfiles(supabase: SupabaseClient, userIds: string[]): Promise<Map<string, ProfileRow>> {
  if (userIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, email, avatar_url, supported_team_id")
    .in("id", userIds);

  if (error) {
    console.error("profiles select", error.message);
    return new Map();
  }

  return new Map((data ?? []).map((row) => [row.id as string, row as ProfileRow]));
}

function predictionsByUser(rows: PredictionRow[]): Map<string, Record<string, Prediction>> {
  const map = new Map<string, Record<string, Prediction>>();
  for (const row of rows) {
    const current = map.get(row.user_id) ?? {};
    current[row.match_id] = rowToPrediction(row);
    map.set(row.user_id, current);
  }
  return map;
}

/** Mismas predicciones que usa el ranking por jornada (filtro por matchday). */
export function predictionsForRound(
  predictions: Record<string, Prediction>,
  round: number,
): Record<string, Prediction> {
  return Object.fromEntries(
    Object.entries(predictions).filter(([, prediction]) => prediction.matchday === round),
  );
}

const SUPABASE_PAGE_SIZE = 1000;

async function fetchAllSavedRounds(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  round?: number,
): Promise<SavedRoundRow[]> {
  const rows: SavedRoundRow[] = [];
  let from = 0;

  while (true) {
    let query = supabase
      .from("quiniela_saved_rounds")
      .select("user_id, round, saved_at")
      .eq("season_id", seasonId)
      .order("saved_at", { ascending: true })
      .range(from, from + SUPABASE_PAGE_SIZE - 1);

    if (round !== undefined) {
      query = query.eq("round", round);
    }

    const { data, error } = await query;
    if (error) {
      console.error("quiniela_saved_rounds select", error.message);
      return rows;
    }

    const batch = (data ?? []) as SavedRoundRow[];
    rows.push(...batch);
    if (batch.length < SUPABASE_PAGE_SIZE) break;
    from += SUPABASE_PAGE_SIZE;
  }

  return rows;
}

async function fetchAllPredictions(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  userIds: string[],
  matchday?: number,
): Promise<PredictionRow[]> {
  if (userIds.length === 0) return [];

  const rows: PredictionRow[] = [];
  let from = 0;

  while (true) {
    let query = supabase
      .from("quiniela_predictions")
      .select("user_id, match_id, matchday, outcome, goals_home, goals_away, scorer_id, scorer, updated_at")
      .eq("season_id", seasonId)
      .in("user_id", userIds)
      .order("matchday", { ascending: true })
      .order("match_id", { ascending: true })
      .range(from, from + SUPABASE_PAGE_SIZE - 1);

    if (matchday !== undefined) {
      query = query.eq("matchday", matchday);
    }

    const { data, error } = await query;
    if (error) {
      console.error("quiniela_predictions select", error.message);
      return rows;
    }

    const batch = (data ?? []) as PredictionRow[];
    rows.push(...batch);
    if (batch.length < SUPABASE_PAGE_SIZE) break;
    from += SUPABASE_PAGE_SIZE;
  }

  return rows;
}

function earliestSavedAt(rows: SavedRoundRow[]): string {
  return rows.reduce((min, row) => (row.saved_at < min ? row.saved_at : min), rows[0]?.saved_at ?? "");
}

export async function fetchQuinielaRoundRanking(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  matchday: Matchday,
  countPoints: boolean,
  scoringContext?: QuinielaScoringContext,
): Promise<QuinielaRankingEntry[]> {
  const savedRows = await fetchSavedRounds(supabase, seasonId, matchday.round);
  if (savedRows.length === 0) return [];

  const userIds = [...new Set(savedRows.map((row) => row.user_id))];
  const [predictionRows, profileMap] = await Promise.all([
    fetchPredictions(supabase, seasonId, userIds, matchday.round),
    fetchProfiles(supabase, userIds),
  ]);

  const byUser = predictionsByUser(predictionRows);
  const savedAtByUser = new Map(savedRows.map((row) => [row.user_id, row.saved_at]));

  const entries = userIds.map((userId) => {
    const predictions = byUser.get(userId) ?? {};
    const { points, hits } = scoreUserMatchday(matchday, predictions, countPoints, scoringContext);
    const profile = profileMap.get(userId);
    return {
      userId,
      handle: profile ? getProfileHandle(profile) : "@usuario",
      avatarUrl: profile ? getProfileAvatarUrl(profile) : null,
      submittedAt: savedAtByUser.get(userId) ?? "",
      points,
      hits,
    };
  });

  return sortRankingEntries(entries, countPoints);
}

export async function fetchQuinielaSeasonRanking(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  matchdays: Matchday[],
  countPointsForRound: (round: number) => boolean,
  scoringContext?: QuinielaScoringContext,
): Promise<QuinielaSeasonRankingEntry[]> {
  const savedRows = await fetchSavedRounds(supabase, seasonId);
  if (savedRows.length === 0) return [];

  const userIds = [...new Set(savedRows.map((row) => row.user_id))];
  const [predictionRows, profileMap] = await Promise.all([
    fetchPredictions(supabase, seasonId, userIds),
    fetchProfiles(supabase, userIds),
  ]);

  const byUser = predictionsByUser(predictionRows);
  const savedRoundsByUser = new Map<string, Set<number>>();
  const savedRowsByUser = new Map<string, SavedRoundRow[]>();
  for (const row of savedRows) {
    const round = Number(row.round);
    if (!Number.isFinite(round)) continue;

    const rounds = savedRoundsByUser.get(row.user_id) ?? new Set<number>();
    rounds.add(round);
    savedRoundsByUser.set(row.user_id, rounds);

    const list = savedRowsByUser.get(row.user_id) ?? [];
    list.push({ ...row, round });
    savedRowsByUser.set(row.user_id, list);
  }

  const entries = userIds.map((userId) => {
    const userSavedRounds = savedRoundsByUser.get(userId) ?? new Set<number>();
    const userSaved = savedRowsByUser.get(userId) ?? [];
    const allPredictions = byUser.get(userId) ?? {};
    let points = 0;
    let hits = 0;
    let roundsPlayed = 0;

    for (const matchday of matchdays) {
      if (!userSavedRounds.has(matchday.round)) continue;
      roundsPlayed += 1;
      const countPoints = countPointsForRound(matchday.round);
      const roundPredictions = predictionsForRound(allPredictions, matchday.round);
      const scored = scoreUserMatchday(matchday, roundPredictions, countPoints, scoringContext);
      points += scored.points;
      hits += scored.hits;
    }

    const profile = profileMap.get(userId);
    return {
      userId,
      handle: profile ? getProfileHandle(profile) : "@usuario",
      avatarUrl: profile ? getProfileAvatarUrl(profile) : null,
      submittedAt: earliestSavedAt(userSaved),
      points,
      hits,
      roundsPlayed,
    };
  });

  return sortRankingEntries(entries, true);
}

export async function fetchQuinielaUserRound(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  userId: string,
  matchdays: Matchday[],
  requestedRound?: number,
  scoringContext?: QuinielaScoringContext,
  bundles?: SeasonBundlesMap,
): Promise<QuinielaUserRoundResult> {
  const savedRows = await fetchSavedRounds(supabase, seasonId);
  const userSaved = savedRows.filter((row) => row.user_id === userId);
  const savedRounds = [...new Set(userSaved.map((row) => row.round))].sort((a, b) => b - a);
  const round = requestedRound ?? savedRounds[0] ?? 1;

  const matchday = getMatchdayByRound(matchdays, round);
  const hasSavedRound = savedRounds.includes(round);
  const savedAt = userSaved.find((row) => row.round === round)?.saved_at ?? null;

  const [predictionRows, profileMap] = await Promise.all([
    fetchPredictions(supabase, seasonId, [userId], round),
    fetchProfiles(supabase, [userId]),
  ]);

  const predictions = predictionsByUser(predictionRows).get(userId) ?? {};
  const countPoints = shouldCountQuinielaPoints(matchday);
  const profile = profileMap.get(userId);
  const supportedTeamId = profile?.supported_team_id?.trim() || DEFAULT_SUPPORTED_TEAM_ID;
  const resolvedScoringContext =
    scoringContext ??
    (bundles ? buildQuinielaScoringContext(bundles, matchdays, supportedTeamId) : undefined);
  const { points, hits } = scoreUserMatchday(
    matchday,
    predictions,
    countPoints && hasSavedRound,
    resolvedScoringContext,
  );

  return {
    userId,
    handle: profile ? getProfileHandle(profile) : "@usuario",
    avatarUrl: profile ? getProfileAvatarUrl(profile) : null,
    supportedTeamId,
    round,
    savedRounds,
    hasSavedRound,
    savedAt,
    predictions,
    points,
    hits,
    countPoints,
  };
}
