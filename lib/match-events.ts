import type { MatchEventType } from "@/types";

export const matchEventTypeLabels: Record<MatchEventType, string> = {
  goal: "Gol",
  goal_disallowed: "Gol anulado",
  yellow: "Tarjeta amarilla",
  red: "Tarjeta roja",
  substitution: "Cambio",
};

export function createMatchEventId(): string {
  return `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
