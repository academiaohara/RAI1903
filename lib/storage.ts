import { DEFAULT_COMPETITION_SEASON_ID, type CompetitionSeasonId } from "@/data/mock";
import type { ClasificacionPrediction } from "@/lib/clasificacion-prediction";
import { migratePrediction, normalizeGoalsPick } from "@/lib/quiniela";
import type { QuinigolPrediction } from "@/lib/quinigol";
import type { GoalsPick, Prediction } from "@/types";

export const PREDICTIONS_STORAGE_KEY = "rai1903.predictions.v2";
export const QUINIELA_SAVED_ROUNDS_KEY = "rai1903.quiniela.saved-rounds.v1";
export const QUINIGOL_PREDICTIONS_STORAGE_KEY = "rai1903.quinigol.predictions.v1";
export const QUINIGOL_SAVED_ROUNDS_KEY = "rai1903.quinigol.saved-rounds.v1";
export const CLASIFICACION_PREDICTIONS_STORAGE_KEY = "rai1903.clasificacion.predictions.v1";
export const CLASIFICACION_SUBMITTED_KEY = "rai1903.clasificacion.submitted.v1";
export const SEASON_STORAGE_KEY = "rai1903.season.v1";

export const loadPredictions = (): Record<string, Prediction> => {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(PREDICTIONS_STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored) as Record<string, Prediction & { scorers?: string[]; exactScore?: { home: number; away: number } }>;
    return Object.fromEntries(Object.entries(parsed).map(([id, prediction]) => [id, migratePrediction(prediction)]));
  } catch {
    return {};
  }
};

export const loadSavedRounds = (): Record<number, string> => {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(QUINIELA_SAVED_ROUNDS_KEY);
    return stored ? (JSON.parse(stored) as Record<number, string>) : {};
  } catch {
    return {};
  }
};

export const saveRoundAsSaved = (round: number) => {
  if (typeof window === "undefined") return;
  const saved = loadSavedRounds();
  saved[round] = new Date().toISOString();
  window.localStorage.setItem(QUINIELA_SAVED_ROUNDS_KEY, JSON.stringify(saved));
};

export const isRoundSaved = (round: number): boolean => {
  return Boolean(loadSavedRounds()[round]);
};

export const savePredictions = (predictions: Record<string, Prediction>) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREDICTIONS_STORAGE_KEY, JSON.stringify(predictions));
};

export const loadSeasonId = (): CompetitionSeasonId => {
  if (typeof window === "undefined") return DEFAULT_COMPETITION_SEASON_ID;

  try {
    const stored = window.localStorage.getItem(SEASON_STORAGE_KEY);
    if (!stored || stored === "2024-25") return DEFAULT_COMPETITION_SEASON_ID;
    return stored;
  } catch {
    return DEFAULT_COMPETITION_SEASON_ID;
  }
};

export const saveSeasonId = (seasonId: CompetitionSeasonId) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SEASON_STORAGE_KEY, seasonId);
};

export const loadQuinigolPredictions = (): Record<string, QuinigolPrediction> => {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(QUINIGOL_PREDICTIONS_STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored) as Record<
      string,
      QuinigolPrediction & { goalsHome?: unknown; goalsAway?: unknown }
    >;
    return Object.fromEntries(
      Object.entries(parsed)
        .map(([id, prediction]) => {
          const goalsHome = normalizeGoalsPick(prediction.goalsHome);
          const goalsAway = normalizeGoalsPick(prediction.goalsAway);
          if (goalsHome === undefined || goalsAway === undefined) return null;
          return [
            id,
            {
              matchId: prediction.matchId,
              matchday: prediction.matchday,
              goalsHome,
              goalsAway,
              updatedAt: prediction.updatedAt,
            } satisfies QuinigolPrediction,
          ] as const;
        })
        .filter((entry): entry is [string, QuinigolPrediction & { goalsHome: GoalsPick; goalsAway: GoalsPick }] => entry !== null),
    );
  } catch {
    return {};
  }
};

export const loadQuinigolSavedRounds = (): Record<number, string> => {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(QUINIGOL_SAVED_ROUNDS_KEY);
    return stored ? (JSON.parse(stored) as Record<number, string>) : {};
  } catch {
    return {};
  }
};

export const saveQuinigolPredictions = (predictions: Record<string, QuinigolPrediction>) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(QUINIGOL_PREDICTIONS_STORAGE_KEY, JSON.stringify(predictions));
};

export const saveQuinigolRoundAsSaved = (round: number) => {
  if (typeof window === "undefined") return;
  const saved = loadQuinigolSavedRounds();
  saved[round] = new Date().toISOString();
  window.localStorage.setItem(QUINIGOL_SAVED_ROUNDS_KEY, JSON.stringify(saved));
};

export const loadClasificacionPredictions = (): Record<string, ClasificacionPrediction> => {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(CLASIFICACION_PREDICTIONS_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Record<string, ClasificacionPrediction>) : {};
  } catch {
    return {};
  }
};

export const loadClasificacionSubmittedAt = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CLASIFICACION_SUBMITTED_KEY);
};

export const saveClasificacionPredictions = (predictions: Record<string, ClasificacionPrediction>) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLASIFICACION_PREDICTIONS_STORAGE_KEY, JSON.stringify(predictions));
};

export const saveClasificacionSubmittedAt = (submittedAt: string | null) => {
  if (typeof window === "undefined") return;
  if (!submittedAt) {
    window.localStorage.removeItem(CLASIFICACION_SUBMITTED_KEY);
    return;
  }
  window.localStorage.setItem(CLASIFICACION_SUBMITTED_KEY, submittedAt);
};
