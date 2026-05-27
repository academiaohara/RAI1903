import { DEFAULT_COMPETITION_SEASON_ID, type CompetitionSeasonId } from "@/data/mock";
import type { Prediction } from "@/types";

export const PREDICTIONS_STORAGE_KEY = "rai1903.predictions.v1";
export const SEASON_STORAGE_KEY = "rai1903.season.v1";

export const loadPredictions = (): Record<string, Prediction> => {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(PREDICTIONS_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Record<string, Prediction>) : {};
  } catch {
    return {};
  }
};

export const savePredictions = (predictions: Record<string, Prediction>) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREDICTIONS_STORAGE_KEY, JSON.stringify(predictions));
};

export const loadSeasonId = (): CompetitionSeasonId => {
  if (typeof window === "undefined") return DEFAULT_COMPETITION_SEASON_ID;

  try {
    const stored = window.localStorage.getItem(SEASON_STORAGE_KEY);
    return stored === "2024-25" || stored === "2025-26" || stored === "2026-27" ? stored : DEFAULT_COMPETITION_SEASON_ID;
  } catch {
    return DEFAULT_COMPETITION_SEASON_ID;
  }
};

export const saveSeasonId = (seasonId: CompetitionSeasonId) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SEASON_STORAGE_KEY, seasonId);
};
