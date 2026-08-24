import { DEFAULT_COMPETITION_SEASON_ID, type CompetitionSeasonId } from "@/data/mock";
import { migratePrediction } from "@/lib/quiniela";
import {
  clearLocalGameStateIfCloudMode,
  loadPredictions as loadLocalPredictions,
  loadSavedRounds as loadLocalSavedRounds,
  savePredictions as saveLocalPredictions,
  saveRoundAsSaved as saveLocalRoundAsSaved,
} from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Prediction } from "@/types";

const MIGRATION_FLAG_PREFIX = "rai1903.quiniela.migrated.";

type QuinielaState = {
  predictions: Record<string, Prediction>;
  savedRounds: Record<number, string>;
};

function migrationKey(userId: string, seasonId: CompetitionSeasonId): string {
  return `${MIGRATION_FLAG_PREFIX}${userId}.${seasonId}`;
}

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

export async function loadQuinielaState(
  userId: string | null,
  seasonId: CompetitionSeasonId = DEFAULT_COMPETITION_SEASON_ID,
): Promise<QuinielaState> {
  if (isSupabaseConfigured()) {
    if (!userId) {
      clearLocalGameStateIfCloudMode();
      return { predictions: {}, savedRounds: {} };
    }

    const supabase = createClient();
    const [{ data: predictionRows, error: predError }, { data: roundRows, error: roundError }] =
      await Promise.all([
        supabase
          .from("quiniela_predictions")
          .select("match_id, matchday, outcome, goals_home, goals_away, scorer, updated_at")
          .eq("user_id", userId)
          .eq("season_id", seasonId),
        supabase
          .from("quiniela_saved_rounds")
          .select("round, saved_at")
          .eq("user_id", userId)
          .eq("season_id", seasonId),
      ]);

    if (predError || roundError) {
      console.error("quiniela load", predError?.message ?? roundError?.message);
      return { predictions: {}, savedRounds: {} };
    }

    const cloudPredictions = Object.fromEntries(
      (predictionRows ?? []).map((row) => [row.match_id, rowToPrediction(row)]),
    );
    const cloudSavedRounds = Object.fromEntries(
      (roundRows ?? []).map((row) => [row.round, row.saved_at as string]),
    );

    const hasCloudData =
      Object.keys(cloudPredictions).length > 0 || Object.keys(cloudSavedRounds).length > 0;
    const local: QuinielaState = {
      predictions: loadLocalPredictions(),
      savedRounds: loadLocalSavedRounds(),
    };
    const hasLocalData =
      Object.keys(local.predictions).length > 0 || Object.keys(local.savedRounds).length > 0;

    if (!hasCloudData && hasLocalData) {
      await migrateLocalQuinielaToCloud(userId, seasonId, local);
      return local;
    }

    return { predictions: cloudPredictions, savedRounds: cloudSavedRounds };
  }

  return {
    predictions: loadLocalPredictions(),
    savedRounds: loadLocalSavedRounds(),
  };
}

async function migrateLocalQuinielaToCloud(
  userId: string,
  seasonId: CompetitionSeasonId,
  local: QuinielaState,
): Promise<void> {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(migrationKey(userId, seasonId))) return;

  await saveQuinielaState(userId, seasonId, local.predictions, local.savedRounds);
  window.localStorage.setItem(migrationKey(userId, seasonId), new Date().toISOString());
}

export async function saveQuinielaPredictions(
  userId: string | null,
  predictions: Record<string, Prediction>,
  seasonId: CompetitionSeasonId = DEFAULT_COMPETITION_SEASON_ID,
): Promise<void> {
  saveLocalPredictions(predictions);

  if (!isSupabaseConfigured() || !userId) return;

  const supabase = createClient();
  const rows = Object.values(predictions).map((p) => ({
    user_id: userId,
    match_id: p.matchId,
    season_id: seasonId,
    matchday: p.matchday,
    outcome: p.outcome ?? null,
    goals_home: p.goalsHome != null ? String(p.goalsHome) : null,
    goals_away: p.goalsAway != null ? String(p.goalsAway) : null,
    scorer: p.scorer ?? null,
    updated_at: p.updatedAt,
  }));

  if (rows.length === 0) return;

  const { error } = await supabase.from("quiniela_predictions").upsert(rows, {
    onConflict: "user_id,match_id,season_id",
  });

  if (error) {
    console.error("quiniela_predictions upsert", error.message);
  }
}

export async function saveQuinielaRound(
  userId: string | null,
  round: number,
  seasonId: CompetitionSeasonId = DEFAULT_COMPETITION_SEASON_ID,
): Promise<void> {
  saveLocalRoundAsSaved(round);

  if (!isSupabaseConfigured() || !userId) return;

  const supabase = createClient();
  const { error } = await supabase.from("quiniela_saved_rounds").upsert(
    {
      user_id: userId,
      round,
      season_id: seasonId,
      saved_at: new Date().toISOString(),
    },
    { onConflict: "user_id,round,season_id" },
  );

  if (error) {
    console.error("quiniela_saved_rounds upsert", error.message);
  }
}

async function saveQuinielaState(
  userId: string,
  seasonId: CompetitionSeasonId,
  predictions: Record<string, Prediction>,
  savedRounds: Record<number, string>,
): Promise<void> {
  await saveQuinielaPredictions(userId, predictions, seasonId);
  for (const round of Object.keys(savedRounds).map(Number)) {
    if (!Number.isNaN(round)) {
      await saveQuinielaRound(userId, round, seasonId);
    }
  }
}

export function quinielaRequiresAuth(): boolean {
  return isSupabaseConfigured();
}
