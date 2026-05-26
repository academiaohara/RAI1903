import type { Prediction } from "@/types";

export const PREDICTIONS_STORAGE_KEY = "rai1903.predictions.v1";

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
