import { DEFAULT_COMPETITION_SEASON_ID, type CompetitionSeasonId } from "@/data/mock";
import { normalizeGoalsPick } from "@/lib/quiniela";
import type { QuinigolPrediction } from "@/lib/quinigol";
import {
  loadQuinigolPredictions as loadLocalQuinigolPredictions,
  loadQuinigolSavedRounds as loadLocalQuinigolSavedRounds,
  QUINIGOL_SAVED_ROUNDS_KEY,
  saveQuinigolPredictions as saveLocalQuinigolPredictions,
  saveQuinigolRoundAsSaved as saveLocalQuinigolRoundAsSaved,
} from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const MIGRATION_FLAG_PREFIX = "rai1903.quinigol.migrated.";

type QuinigolState = {
  predictions: Record<string, QuinigolPrediction>;
  savedRounds: Record<number, string>;
};

function migrationKey(userId: string, seasonId: CompetitionSeasonId): string {
  return `${MIGRATION_FLAG_PREFIX}${userId}.${seasonId}`;
}

function rowToPrediction(row: {
  match_id: string;
  matchday: number;
  goals_home: string;
  goals_away: string;
  updated_at: string;
}): QuinigolPrediction | null {
  const goalsHome = normalizeGoalsPick(row.goals_home);
  const goalsAway = normalizeGoalsPick(row.goals_away);
  if (goalsHome === undefined || goalsAway === undefined) return null;
  return {
    matchId: row.match_id,
    matchday: row.matchday,
    goalsHome,
    goalsAway,
    updatedAt: row.updated_at,
  };
}

export async function loadQuinigolState(
  userId: string | null,
  seasonId: CompetitionSeasonId = DEFAULT_COMPETITION_SEASON_ID,
): Promise<QuinigolState> {
  if (isSupabaseConfigured()) {
    if (!userId) {
      return { predictions: {}, savedRounds: {} };
    }

    const supabase = createClient();
    const [{ data: predictionRows, error: predError }, { data: roundRows, error: roundError }] =
      await Promise.all([
        supabase
          .from("quinigol_predictions")
          .select("match_id, matchday, goals_home, goals_away, updated_at")
          .eq("user_id", userId)
          .eq("season_id", seasonId),
        supabase
          .from("quinigol_saved_rounds")
          .select("round, saved_at")
          .eq("user_id", userId)
          .eq("season_id", seasonId),
      ]);

    if (predError || roundError) {
      console.error("quinigol load", predError?.message ?? roundError?.message);
      return { predictions: {}, savedRounds: {} };
    }

    const cloudPredictions = Object.fromEntries(
      (predictionRows ?? [])
        .map((row) => {
          const prediction = rowToPrediction(row);
          return prediction ? ([prediction.matchId, prediction] as const) : null;
        })
        .filter((entry): entry is [string, QuinigolPrediction] => entry !== null),
    );
    const cloudSavedRounds = Object.fromEntries(
      (roundRows ?? []).map((row) => [row.round, row.saved_at as string]),
    );

    const hasCloudData =
      Object.keys(cloudPredictions).length > 0 || Object.keys(cloudSavedRounds).length > 0;
    const local: QuinigolState = {
      predictions: loadLocalQuinigolPredictions(),
      savedRounds: loadLocalQuinigolSavedRounds(),
    };
    const hasLocalData =
      Object.keys(local.predictions).length > 0 || Object.keys(local.savedRounds).length > 0;

    if (!hasCloudData && hasLocalData) {
      await migrateLocalQuinigolToCloud(userId, seasonId, local);
      return local;
    }

    saveLocalQuinigolPredictions(cloudPredictions);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(QUINIGOL_SAVED_ROUNDS_KEY, JSON.stringify(cloudSavedRounds));
    }
    return { predictions: cloudPredictions, savedRounds: cloudSavedRounds };
  }

  return {
    predictions: loadLocalQuinigolPredictions(),
    savedRounds: loadLocalQuinigolSavedRounds(),
  };
}

async function migrateLocalQuinigolToCloud(
  userId: string,
  seasonId: CompetitionSeasonId,
  local: QuinigolState,
): Promise<void> {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(migrationKey(userId, seasonId))) return;

  await saveQuinigolState(userId, seasonId, local.predictions, local.savedRounds);
  window.localStorage.setItem(migrationKey(userId, seasonId), new Date().toISOString());
}

export async function saveQuinigolPredictions(
  userId: string | null,
  predictions: Record<string, QuinigolPrediction>,
  seasonId: CompetitionSeasonId = DEFAULT_COMPETITION_SEASON_ID,
): Promise<void> {
  saveLocalQuinigolPredictions(predictions);

  if (!isSupabaseConfigured() || !userId) return;

  const supabase = createClient();
  const rows = Object.values(predictions)
    .filter((prediction) => prediction.goalsHome !== undefined && prediction.goalsAway !== undefined)
    .map((prediction) => ({
      user_id: userId,
      match_id: prediction.matchId,
      season_id: seasonId,
      matchday: prediction.matchday,
      goals_home: String(prediction.goalsHome),
      goals_away: String(prediction.goalsAway),
      updated_at: prediction.updatedAt,
    }));

  if (rows.length === 0) return;

  const { error } = await supabase.from("quinigol_predictions").upsert(rows, {
    onConflict: "user_id,match_id,season_id",
  });

  if (error) {
    console.error("quinigol_predictions upsert", error.message);
  }
}

export async function saveQuinigolRound(
  userId: string | null,
  round: number,
  seasonId: CompetitionSeasonId = DEFAULT_COMPETITION_SEASON_ID,
): Promise<void> {
  saveLocalQuinigolRoundAsSaved(round);

  if (!isSupabaseConfigured() || !userId) return;

  const supabase = createClient();
  const { error } = await supabase.from("quinigol_saved_rounds").upsert(
    {
      user_id: userId,
      round,
      season_id: seasonId,
      saved_at: new Date().toISOString(),
    },
    { onConflict: "user_id,round,season_id" },
  );

  if (error) {
    console.error("quinigol_saved_rounds upsert", error.message);
  }
}

async function saveQuinigolState(
  userId: string,
  seasonId: CompetitionSeasonId,
  predictions: Record<string, QuinigolPrediction>,
  savedRounds: Record<number, string>,
): Promise<void> {
  await saveQuinigolPredictions(userId, predictions, seasonId);
  for (const round of Object.keys(savedRounds).map(Number)) {
    if (!Number.isNaN(round)) {
      await saveQuinigolRound(userId, round, seasonId);
    }
  }
}

export function quinigolRequiresAuth(): boolean {
  return isSupabaseConfigured();
}

export function createQuinigolPrediction(
  matchId: string,
  matchday: number,
  patch: Partial<Pick<QuinigolPrediction, "goalsHome" | "goalsAway">>,
  current?: QuinigolPrediction,
): QuinigolPrediction {
  return {
    matchId,
    matchday,
    goalsHome: patch.goalsHome ?? current?.goalsHome,
    goalsAway: patch.goalsAway ?? current?.goalsAway,
    updatedAt: new Date().toISOString(),
  };
}
