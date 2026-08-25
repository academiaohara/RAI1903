import { resolveSquadPlayerByName, scorerLabelForPlayer } from "@/lib/squad-player-resolve";
import type { Prediction } from "@/types";
import type { SquadPlayer } from "@/types/squad";

/** Valor fijo para pronosticar que el equipo no marcará. */
export const QUINIELA_SCORER_NONE = "nadie" as const;

export type QuinielaScorerSelection = typeof QUINIELA_SCORER_NONE | string;

export function isQuinielaScorerNone(value?: string | null): value is typeof QUINIELA_SCORER_NONE {
  return value === QUINIELA_SCORER_NONE;
}

export function resolveSquadPlayerById(squad: SquadPlayer[], playerId: string): SquadPlayer | undefined {
  if (isQuinielaScorerNone(playerId)) return undefined;
  return squad.find((player) => player.id === playerId);
}

export function scorerIdForPlayer(player: SquadPlayer): string {
  return player.id;
}

export function scorerSelectionForPlayer(player: SquadPlayer): {
  scorerId: string;
  scorer: string;
} {
  return {
    scorerId: scorerIdForPlayer(player),
    scorer: scorerLabelForPlayer(player),
  };
}

export function scorerSelectionForNone(): { scorerId: typeof QUINIELA_SCORER_NONE; scorer: typeof QUINIELA_SCORER_NONE } {
  return { scorerId: QUINIELA_SCORER_NONE, scorer: QUINIELA_SCORER_NONE };
}

export function scorerLabelFromId(
  squad: SquadPlayer[],
  scorerId?: string,
  fallbackLabel?: string,
): string | undefined {
  if (!scorerId) return fallbackLabel;
  if (isQuinielaScorerNone(scorerId)) return QUINIELA_SCORER_NONE;
  const player = resolveSquadPlayerById(squad, scorerId);
  return player ? scorerLabelForPlayer(player) : fallbackLabel;
}

export function resolveScorerIdFromPrediction(
  squad: SquadPlayer[],
  prediction: Pick<Prediction, "scorerId" | "scorer">,
): string | undefined {
  if (prediction.scorerId) return prediction.scorerId;
  if (!prediction.scorer) return undefined;
  if (isQuinielaScorerNone(prediction.scorer)) return QUINIELA_SCORER_NONE;
  const player = resolveSquadPlayerByName(squad, prediction.scorer);
  return player?.id;
}

export function withResolvedScorer(squad: SquadPlayer[], prediction: Prediction): Prediction {
  const scorerId = resolveScorerIdFromPrediction(squad, prediction);
  if (!scorerId) return prediction;

  const scorer = isQuinielaScorerNone(scorerId)
    ? QUINIELA_SCORER_NONE
    : scorerLabelFromId(squad, scorerId, prediction.scorer);

  return { ...prediction, scorerId, scorer };
}

export function isValidQuinielaScorerSelection(
  squad: SquadPlayer[],
  scorerId?: string,
  scorer?: string,
): boolean {
  const resolvedId = resolveScorerIdFromPrediction(squad, { scorerId, scorer });
  if (!resolvedId) return false;
  if (isQuinielaScorerNone(resolvedId)) return true;
  return Boolean(resolveSquadPlayerById(squad, resolvedId));
}
