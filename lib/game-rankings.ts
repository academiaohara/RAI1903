import type { SupabaseClient } from "@supabase/supabase-js";
import { getProfileAvatarUrl, getProfileHandle } from "@/lib/auth/user-display";
import {
  buildActualStandingsByTeamId,
  canScoreClasificacionStandings,
  scoreClasificacionPrediction,
  type ClasificacionPrediction,
} from "@/lib/clasificacion-prediction";
import {
  countQuinigolHits,
  scoreQuinigolMatchday,
  type QuinigolPrediction,
} from "@/lib/quinigol";
import { getMatchdayByRound, shouldCountQuinielaPoints } from "@/lib/quiniela";
import { sortRankingEntries, type QuinielaRankingEntry } from "@/lib/quiniela-ranking";
import type { CompetitionSeasonId } from "@/data/mock";
import type { Matchday, Team } from "@/types";

export type GameRankingEntry = QuinielaRankingEntry;
export type GameSeasonRankingEntry = QuinielaRankingEntry & { roundsPlayed: number };

type SavedRoundRow = { user_id: string; round: number; saved_at: string };
type QuinigolPredictionRow = {
  user_id: string;
  match_id: string;
  matchday: number;
  goals_home: string;
  goals_away: string;
  updated_at: string;
};
type ClasificacionPredictionRow = {
  user_id: string;
  team_id: string;
  position: number;
  updated_at: string;
};
type SubmissionRow = { user_id: string; submitted_at: string };
type ProfileRow = {
  id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

function rowToQuinigolPrediction(row: QuinigolPredictionRow): QuinigolPrediction {
  return {
    matchId: row.match_id,
    matchday: row.matchday,
    goalsHome: row.goals_home === "M" ? "M" : (Number(row.goals_home) as 0 | 1 | 2),
    goalsAway: row.goals_away === "M" ? "M" : (Number(row.goals_away) as 0 | 1 | 2),
    updatedAt: row.updated_at,
  };
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

async function fetchQuinigolSavedRounds(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  round?: number,
): Promise<SavedRoundRow[]> {
  let query = supabase
    .from("quinigol_saved_rounds")
    .select("user_id, round, saved_at")
    .eq("season_id", seasonId);

  if (round !== undefined) {
    query = query.eq("round", round);
  }

  const { data, error } = await query;
  if (error) {
    console.error("quinigol_saved_rounds select", error.message);
    return [];
  }
  return (data ?? []) as SavedRoundRow[];
}

async function fetchQuinigolPredictions(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  userIds: string[],
  matchday?: number,
): Promise<QuinigolPredictionRow[]> {
  if (userIds.length === 0) return [];

  let query = supabase
    .from("quinigol_predictions")
    .select("user_id, match_id, matchday, goals_home, goals_away, updated_at")
    .eq("season_id", seasonId)
    .in("user_id", userIds);

  if (matchday !== undefined) {
    query = query.eq("matchday", matchday);
  }

  const { data, error } = await query;
  if (error) {
    console.error("quinigol_predictions select", error.message);
    return [];
  }
  return (data ?? []) as QuinigolPredictionRow[];
}

function quinigolPredictionsByUser(rows: QuinigolPredictionRow[]): Map<string, Record<string, QuinigolPrediction>> {
  const map = new Map<string, Record<string, QuinigolPrediction>>();
  for (const row of rows) {
    const current = map.get(row.user_id) ?? {};
    current[row.match_id] = rowToQuinigolPrediction(row);
    map.set(row.user_id, current);
  }
  return map;
}

function earliestSavedAt(rows: SavedRoundRow[]): string {
  return rows.reduce((min, row) => (row.saved_at < min ? row.saved_at : min), rows[0]?.saved_at ?? "");
}

export async function fetchQuinigolRoundRanking(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  matchday: Matchday,
  countPoints: boolean,
): Promise<GameRankingEntry[]> {
  const savedRows = await fetchQuinigolSavedRounds(supabase, seasonId, matchday.round);
  if (savedRows.length === 0) return [];

  const userIds = [...new Set(savedRows.map((row) => row.user_id))];
  const [predictionRows, profileMap] = await Promise.all([
    fetchQuinigolPredictions(supabase, seasonId, userIds, matchday.round),
    fetchProfiles(supabase, userIds),
  ]);

  const byUser = quinigolPredictionsByUser(predictionRows);
  const savedAtByUser = new Map(savedRows.map((row) => [row.user_id, row.saved_at]));

  const entries = userIds.map((userId) => {
    const predictions = byUser.get(userId) ?? {};
    const points = countPoints ? scoreQuinigolMatchday(matchday, predictions) : 0;
    const hits = countPoints ? countQuinigolHits(matchday, predictions) : 0;
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

export async function fetchQuinigolSeasonRanking(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  matchdays: Matchday[],
  countPointsForRound: (round: number) => boolean,
): Promise<GameSeasonRankingEntry[]> {
  const savedRows = await fetchQuinigolSavedRounds(supabase, seasonId);
  if (savedRows.length === 0) return [];

  const userIds = [...new Set(savedRows.map((row) => row.user_id))];
  const [predictionRows, profileMap] = await Promise.all([
    fetchQuinigolPredictions(supabase, seasonId, userIds),
    fetchProfiles(supabase, userIds),
  ]);

  const byUser = quinigolPredictionsByUser(predictionRows);
  const savedByUser = new Map<string, SavedRoundRow[]>();
  for (const row of savedRows) {
    const list = savedByUser.get(row.user_id) ?? [];
    list.push(row);
    savedByUser.set(row.user_id, list);
  }

  const matchdayByRound = new Map(matchdays.map((matchday) => [matchday.round, matchday]));

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
      if (!countPointsForRound(saved.round)) continue;
      points += scoreQuinigolMatchday(matchday, predictions);
      hits += countQuinigolHits(matchday, predictions);
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

async function fetchClasificacionSubmissions(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
): Promise<SubmissionRow[]> {
  const { data, error } = await supabase
    .from("clasificacion_submissions")
    .select("user_id, submitted_at")
    .eq("season_id", seasonId);

  if (error) {
    console.error("clasificacion_submissions select", error.message);
    return [];
  }
  return (data ?? []) as SubmissionRow[];
}

async function fetchClasificacionPredictions(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  userIds: string[],
): Promise<ClasificacionPredictionRow[]> {
  if (userIds.length === 0) return [];

  const { data, error } = await supabase
    .from("clasificacion_predictions")
    .select("user_id, team_id, position, updated_at")
    .eq("season_id", seasonId)
    .in("user_id", userIds);

  if (error) {
    console.error("clasificacion_predictions select", error.message);
    return [];
  }
  return (data ?? []) as ClasificacionPredictionRow[];
}

function clasificacionPredictionsByUser(
  rows: ClasificacionPredictionRow[],
): Map<string, Record<string, ClasificacionPrediction>> {
  const map = new Map<string, Record<string, ClasificacionPrediction>>();
  for (const row of rows) {
    const current = map.get(row.user_id) ?? {};
    current[row.team_id] = {
      teamId: row.team_id,
      position: row.position,
      updatedAt: row.updated_at,
    };
    map.set(row.user_id, current);
  }
  return map;
}

export async function fetchClasificacionRanking(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  teams: Team[],
  matchdays: Matchday[],
): Promise<GameRankingEntry[]> {
  const submissionRows = await fetchClasificacionSubmissions(supabase, seasonId);
  if (submissionRows.length === 0) return [];

  const userIds = submissionRows.map((row) => row.user_id);
  const [predictionRows, profileMap] = await Promise.all([
    fetchClasificacionPredictions(supabase, seasonId, userIds),
    fetchProfiles(supabase, userIds),
  ]);

  const byUser = clasificacionPredictionsByUser(predictionRows);
  const submittedAtByUser = new Map(submissionRows.map((row) => [row.user_id, row.submitted_at]));
  const actualPositions = buildActualStandingsByTeamId(teams, matchdays);
  const canScore = canScoreClasificacionStandings(teams, matchdays);

  const entries = userIds.map((userId) => {
    const predictions = byUser.get(userId) ?? {};
    const points = canScore ? scoreClasificacionPrediction(predictions, actualPositions) : 0;
    const profile = profileMap.get(userId);
    return {
      userId,
      handle: profile ? getProfileHandle(profile) : "@usuario",
      avatarUrl: profile ? getProfileAvatarUrl(profile) : null,
      submittedAt: submittedAtByUser.get(userId) ?? "",
      points,
      hits: 0,
    };
  });

  return sortRankingEntries(entries, canScore);
}

export function countPointsForQuinigolRound(matchdays: Matchday[], round: number, now = new Date()): boolean {
  const matchday = getMatchdayByRound(matchdays, round);
  return shouldCountQuinielaPoints(matchday, now);
}

export type QuinigolUserRoundResult = {
  userId: string;
  handle: string;
  avatarUrl: string | null;
  round: number;
  savedRounds: number[];
  hasSavedRound: boolean;
  predictions: Record<string, QuinigolPrediction>;
  points: number;
  hits: number;
  countPoints: boolean;
};

export async function fetchQuinigolUserRound(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  userId: string,
  matchdays: Matchday[],
  requestedRound?: number,
): Promise<QuinigolUserRoundResult> {
  const savedRows = await fetchQuinigolSavedRounds(supabase, seasonId);
  const userSaved = savedRows.filter((row) => row.user_id === userId);
  const savedRounds = [...new Set(userSaved.map((row) => row.round))].sort((a, b) => b - a);
  const round = requestedRound ?? savedRounds[0] ?? 1;

  const matchday = getMatchdayByRound(matchdays, round);
  const hasSavedRound = savedRounds.includes(round);

  const [predictionRows, profileMap] = await Promise.all([
    fetchQuinigolPredictions(supabase, seasonId, [userId], round),
    fetchProfiles(supabase, [userId]),
  ]);

  const predictions = quinigolPredictionsByUser(predictionRows).get(userId) ?? {};
  const countPoints = countPointsForQuinigolRound(matchdays, round);
  const points = countPoints && hasSavedRound ? scoreQuinigolMatchday(matchday, predictions) : 0;
  const hits = countPoints && hasSavedRound ? countQuinigolHits(matchday, predictions) : 0;
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

export type ClasificacionUserSubmissionResult = {
  userId: string;
  handle: string;
  avatarUrl: string | null;
  hasSubmission: boolean;
  predictions: Record<string, ClasificacionPrediction>;
  points: number;
  countPoints: boolean;
  submittedAt: string | null;
};

export async function fetchClasificacionUserSubmission(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  userId: string,
  teams: Team[],
  matchdays: Matchday[],
): Promise<ClasificacionUserSubmissionResult> {
  const submissionRows = await fetchClasificacionSubmissions(supabase, seasonId);
  const submission = submissionRows.find((row) => row.user_id === userId) ?? null;
  const hasSubmission = submission !== null;

  const [predictionRows, profileMap] = await Promise.all([
    fetchClasificacionPredictions(supabase, seasonId, [userId]),
    fetchProfiles(supabase, [userId]),
  ]);

  const predictions = clasificacionPredictionsByUser(predictionRows).get(userId) ?? {};
  const actualPositions = buildActualStandingsByTeamId(teams, matchdays);
  const canScore = canScoreClasificacionStandings(teams, matchdays);
  const points = canScore && hasSubmission ? scoreClasificacionPrediction(predictions, actualPositions) : 0;
  const profile = profileMap.get(userId);

  return {
    userId,
    handle: profile ? getProfileHandle(profile) : "@usuario",
    avatarUrl: profile ? getProfileAvatarUrl(profile) : null,
    hasSubmission,
    predictions,
    points,
    countPoints: canScore,
    submittedAt: submission?.submitted_at ?? null,
  };
}
