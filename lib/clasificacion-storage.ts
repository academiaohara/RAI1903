import { DEFAULT_COMPETITION_SEASON_ID, type CompetitionSeasonId } from "@/data/mock";
import type { ClasificacionPrediction } from "@/lib/clasificacion-prediction";
import {
  clearLocalGameStateIfCloudMode,
  loadClasificacionPredictions as loadLocalClasificacionPredictions,
  loadClasificacionSubmittedAt,
  saveClasificacionPredictions as saveLocalClasificacionPredictions,
  saveClasificacionSubmittedAt,
} from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const MIGRATION_FLAG_PREFIX = "rai1903.clasificacion.migrated.";

type ClasificacionState = {
  predictions: Record<string, ClasificacionPrediction>;
  submittedAt: string | null;
};

function migrationKey(userId: string, seasonId: CompetitionSeasonId): string {
  return `${MIGRATION_FLAG_PREFIX}${userId}.${seasonId}`;
}

export async function loadClasificacionState(
  userId: string | null,
  seasonId: CompetitionSeasonId = DEFAULT_COMPETITION_SEASON_ID,
): Promise<ClasificacionState> {
  if (isSupabaseConfigured()) {
    if (!userId) {
      clearLocalGameStateIfCloudMode();
      return { predictions: {}, submittedAt: null };
    }

    const supabase = createClient();
    const [{ data: predictionRows, error: predError }, { data: submissionRow, error: subError }] =
      await Promise.all([
        supabase
          .from("clasificacion_predictions")
          .select("team_id, position, updated_at")
          .eq("user_id", userId)
          .eq("season_id", seasonId),
        supabase
          .from("clasificacion_submissions")
          .select("submitted_at")
          .eq("user_id", userId)
          .eq("season_id", seasonId)
          .maybeSingle(),
      ]);

    if (predError || subError) {
      console.error("clasificacion load", predError?.message ?? subError?.message);
      return { predictions: {}, submittedAt: null };
    }

    const cloudPredictions = Object.fromEntries(
      (predictionRows ?? []).map((row) => [
        row.team_id,
        {
          teamId: row.team_id,
          position: row.position,
          updatedAt: row.updated_at as string,
        } satisfies ClasificacionPrediction,
      ]),
    );
    const cloudSubmittedAt = (submissionRow?.submitted_at as string | undefined) ?? null;

    const hasCloudData = Object.keys(cloudPredictions).length > 0 || cloudSubmittedAt !== null;
    const local: ClasificacionState = {
      predictions: loadLocalClasificacionPredictions(),
      submittedAt: loadClasificacionSubmittedAt(),
    };
    const hasLocalData =
      Object.keys(local.predictions).length > 0 || local.submittedAt !== null;

    if (!hasCloudData && hasLocalData) {
      await migrateLocalClasificacionToCloud(userId, seasonId, local);
      return local;
    }

    return { predictions: cloudPredictions, submittedAt: cloudSubmittedAt };
  }

  return {
    predictions: loadLocalClasificacionPredictions(),
    submittedAt: loadClasificacionSubmittedAt(),
  };
}

async function migrateLocalClasificacionToCloud(
  userId: string,
  seasonId: CompetitionSeasonId,
  local: ClasificacionState,
): Promise<void> {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(migrationKey(userId, seasonId))) return;

  await saveClasificacionState(userId, seasonId, local.predictions, local.submittedAt);
  window.localStorage.setItem(migrationKey(userId, seasonId), new Date().toISOString());
}

export async function saveClasificacionPredictions(
  userId: string | null,
  predictions: Record<string, ClasificacionPrediction>,
  seasonId: CompetitionSeasonId = DEFAULT_COMPETITION_SEASON_ID,
): Promise<void> {
  saveLocalClasificacionPredictions(predictions);

  if (!isSupabaseConfigured() || !userId) return;

  const supabase = createClient();
  const rows = Object.values(predictions).map((prediction) => ({
    user_id: userId,
    season_id: seasonId,
    team_id: prediction.teamId,
    position: prediction.position,
    updated_at: prediction.updatedAt,
  }));

  if (rows.length === 0) return;

  const { error } = await supabase.from("clasificacion_predictions").upsert(rows, {
    onConflict: "user_id,season_id,team_id",
  });

  if (error) {
    console.error("clasificacion_predictions upsert", error.message);
  }
}

export async function saveClasificacionSubmission(
  userId: string | null,
  seasonId: CompetitionSeasonId = DEFAULT_COMPETITION_SEASON_ID,
): Promise<void> {
  const submittedAt = new Date().toISOString();
  saveClasificacionSubmittedAt(submittedAt);

  if (!isSupabaseConfigured() || !userId) return;

  const supabase = createClient();
  const { error } = await supabase.from("clasificacion_submissions").upsert(
    {
      user_id: userId,
      season_id: seasonId,
      submitted_at: submittedAt,
    },
    { onConflict: "user_id,season_id" },
  );

  if (error) {
    console.error("clasificacion_submissions upsert", error.message);
  }
}

async function saveClasificacionState(
  userId: string,
  seasonId: CompetitionSeasonId,
  predictions: Record<string, ClasificacionPrediction>,
  submittedAt: string | null,
): Promise<void> {
  await saveClasificacionPredictions(userId, predictions, seasonId);
  if (submittedAt) {
    await saveClasificacionSubmission(userId, seasonId);
  }
}

export function clasificacionRequiresAuth(): boolean {
  return isSupabaseConfigured();
}
