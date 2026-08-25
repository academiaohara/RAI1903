/** Gol registrado en jornada (Grupo I masculino). */
export type MatchGoalEntry = {
  /** Lado del equipo que marca. */
  teamSide: "home" | "away";
  /** Dorsal del jugador como string, o "pp" para propia puerta. */
  playerKey: string;
  minute: number;
};

export type MatchGoalsPayload = {
  goals: MatchGoalEntry[];
};
