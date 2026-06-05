import type { SupabaseClient } from "@supabase/supabase-js";
import { getProfileAvatarUrl, getProfileHandle } from "@/lib/auth/user-display";
import {
  countOutcomeHits,
  getMatchdayByRound,
  migratePrediction,
  scorePredictionPoints,
  shouldCountQuinielaPoints,
} from "@/lib/quiniela";
import {
  scoringOptionsForMatch,
  type QuinielaScoringContext,
} from "@/lib/quiniela/scoring-context";
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
  round: number;
  savedRounds: number[];
  hasSavedRound: boolean;
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
  scorer: string | null;
  updated_at: string;
}): Prediction {
  return migratePrediction({
    matchId: row.match_id,
    matchday: row.matchday,
    outcome: (row.outcome as Prediction["outcome"]) ?? undefined,
    goalsHome: row.goals_home,
    goalsAway: row.goals_away,
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
  scorer: string | null;
  updated_at: string;
};
type ProfileRow = {
  id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

async function fetchSavedRounds(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  round?: number,
): Promise<SavedRoundRow[]> {
  let query = supabase
    .from("quiniela_saved_rounds")
    .select("user_id, round, saved_at")
    .eq("season_id", seasonId);

  if (round !== undefined) {
    query = query.eq("round", round);
  }

  const { data, error } = await query;
  if (error) {
    console.error("quiniela_saved_rounds select", error.message);
    return [];
  }
  return (data ?? []) as SavedRoundRow[];
}

async function fetchPredictions(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  userIds: string[],
  matchday?: number,
): Promise<PredictionRow[]> {
  if (userIds.length === 0) return [];

  let query = supabase
    .from("quiniela_predictions")
    .select("user_id, match_id, matchday, outcome, goals_home, goals_away, scorer, updated_at")
    .eq("season_id", seasonId)
    .in("user_id", userIds);

  if (matchday !== undefined) {
    query = query.eq("matchday", matchday);
  }

  const { data, error } = await query;
  if (error) {
    console.error("quiniela_predictions select", error.message);
    return [];
  }
  return (data ?? []) as PredictionRow[];
}

async function fetchProfiles(supabase: SupabaseClient, userIds: string[]): Promise<Map<string, ProfileRow>> {
  if (userIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, email, avatar_url")
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
  const savedByUser = new Map<string, SavedRoundRow[]>();
  for (const row of savedRows) {
    const list = savedByUser.get(row.user_id) ?? [];
    list.push(row);
    savedByUser.set(row.user_id, list);
  }

  const matchdayByRound = new Map(matchdays.map((md) => [md.round, md]));

  const entries = userIds.map((userId) => {
    const userSaved = savedByUser.get(userId) ?? [];
    const predictions = byUser.get(userId) ?? {};
    let points = 0;
    let hits = 0;
    let roundsPlayed = 0;

    for (const saved of userSaved) {
      const matchday = matchdayByRound.get(saved.round);
      if (!matchday) continue;
      roundsPlayed += 1;
      const countPoints = countPointsForRound(saved.round);
      const scored = scoreUserMatchday(matchday, predictions, countPoints, scoringContext);
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
): Promise<QuinielaUserRoundResult> {
  const savedRows = await fetchSavedRounds(supabase, seasonId);
  const userSaved = savedRows.filter((row) => row.user_id === userId);
  const savedRounds = [...new Set(userSaved.map((row) => row.round))].sort((a, b) => b - a);
  const round = requestedRound ?? savedRounds[0] ?? 1;

  const matchday = getMatchdayByRound(matchdays, round);
  const hasSavedRound = savedRounds.includes(round);

  const [predictionRows, profileMap] = await Promise.all([
    fetchPredictions(supabase, seasonId, [userId], round),
    fetchProfiles(supabase, [userId]),
  ]);

  const predictions = predictionsByUser(predictionRows).get(userId) ?? {};
  const countPoints = shouldCountQuinielaPoints(matchday);
  const { points, hits } = scoreUserMatchday(
    matchday,
    predictions,
    countPoints && hasSavedRound,
    scoringContext,
  );
  const profile = profileMap.get(userId);

  return {
    userId,
    handle: profile ? getProfileHandle(profile) : "@usuario",
    avatarUrl: profile ? getProfileAvatarUrl(profile) : null,
    round,
    savedRounds,
    hasSavedRound,
    predictions,
    points,
    hits,
    countPoints,
  };
}
