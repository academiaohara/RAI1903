import type { MatchEventType } from "@/types";

export const matchEventTypeLabels: Record<MatchEventType, string> = {
  goal: "Gol",
  goal_penalty: "Gol de penalti",
  goal_free_kick: "Gol de falta",
  goal_disallowed: "Gol anulado",
  post: "Tiro al palo",
  yellow: "Tarjeta amarilla",
  red: "Tarjeta roja",
  red_disallowed: "Roja anulada",
  substitution: "Cambio",
};

const GOAL_EVENT_TYPES = new Set<MatchEventType>(["goal", "goal_penalty", "goal_free_kick"]);

export function isGoalEventType(type: MatchEventType): boolean {
  return GOAL_EVENT_TYPES.has(type);
}

export function createMatchEventId(): string {
  return `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
