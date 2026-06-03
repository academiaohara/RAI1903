import type { MatchStatus } from "@/types";

export type JornadaPhaseKind = "league";

export type JornadaGrupo = "1" | "2";

/** Identificador estable de jornada (p. ej. j12). */
export type JornadaRoundId = string;

export type JornadaFixture = {
  id: string;
  jornadaId: JornadaRoundId;
  /** Número de jornada de liga (1–38). */
  roundNumber?: number;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  date: string;
  grupo: JornadaGrupo;
  involvesRai: boolean;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  /** Hora en formato HH:mm cuando el partido está pendiente. */
  kickoffTime?: string;
};

export type JornadaRoundSummary = {
  id: JornadaRoundId;
  label: string;
  kind: JornadaPhaseKind;
  roundNumber?: number;
  /** Fecha representativa para la tarjeta del carrusel (ISO). */
  date: string;
  /** Fecha corta ya formateada (p. ej. 31 ago). */
  shortDate: string;
  opponentTeamId?: string;
  opponentName?: string;
  isCurrent: boolean;
};

export type JornadaRoundData = {
  summary: JornadaRoundSummary;
  matchesByGrupo: Record<JornadaGrupo, JornadaFixture[]>;
};

export type JornadasDataset = {
  rounds: JornadaRoundSummary[];
  currentRoundId: JornadaRoundId;
  getRound: (roundId: JornadaRoundId) => JornadaRoundData;
};
