import type { PlayerPosition } from "@/types";

export type CanteraSquadPlayerStats = {
  /** Partidos convocados (PC). */
  convocados: number;
  /** Partidos jugados (PJ). */
  partidos: number;
  /** Partidos como titular (PT). */
  titular: number;
  minutos: number;
  goles: number;
  /** Goles encajados; solo porteros. */
  golesEncajados?: number;
  amarillas: number;
  rojas: number;
};

export type CanteraRosterPlayer = {
  id: string;
  displayName: string;
  fullName: string;
  number: number | null;
  position: PlayerPosition;
  /** Demarcación detallada (p. ej. Lateral izquierdo). */
  role: string;
  age: number | null;
  stats: CanteraSquadPlayerStats;
};
