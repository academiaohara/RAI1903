import type { CompetitionId, PlayerRoleCode, PlayerStatus } from "@/types";

export type SquadPosition = "Portero" | "Defensa" | "Centrocampista" | "Delantero";

export type SquadRoleCode = PlayerRoleCode;

export type SquadViewMode = "lista" | "fichas";

export type PlayerMatchRecord = {
  fecha: string;
  rival: string;
  competicion: string;
  competitionId?: CompetitionId;
  minutos: number;
  /** En banquillo sin entrar al juego (0 minutos). */
  onBench?: boolean;
  goles: number;
  asistencias: number;
  amarillas: number;
  rojas: number;
};

export type PlayerCareerRecord = {
  temporada: string;
  club: string;
  partidos: number;
  goles: number;
  asistencias: number;
};

export type SquadPlayer = {
  id: string;
  nombre: string;
  apellido: string;
  dorsal: number;
  posicion: SquadPosition;
  rol: SquadRoleCode;
  estado: PlayerStatus;
  edad: number;
  fechaNacimiento: string;
  lugarNacimiento: string;
  nacionalidad: string;
  altura: string;
  peso: string;
  piernaBuena: "Derecha" | "Izquierda" | "Ambidiestro";
  contratoHasta: string;
  /** Valor de mercado (Transfermarkt u origen importado). */
  valorMercado: string | null;
  /** Texto descriptivo del jugador (web oficial / ficha). */
  descripcion: string;
  foto: string | null;
  partidos: number;
  minutos: number;
  goles: number;
  asistencias: number;
  amarillas: number;
  rojas: number;
  historialPartidos: PlayerMatchRecord[];
  trayectoria: PlayerCareerRecord[];
};

export type SquadClubStats = {
  partidos: number;
  victorias: number;
  empates: number;
  derrotas: number;
  golesFavor: number;
  golesContra: number;
  porteriasImbatidas: number;
};

export type StadiumInfo = {
  nombre: string;
  imagen: string;
  capacidad: number;
  direccion: string;
  ciudad: string;
  inaugurado: number;
  superficie: string;
};

export type SquadClubInfo = {
  nombre: string;
  temporada: string;
  estadio: string;
  estadioInfo: StadiumInfo;
  escudo: string;
  entrenador: string;
  jugadores: number;
  stats: SquadClubStats;
};

export type SquadModalTab = "actualidad" | "resumen" | "partidos" | "estadisticas" | "trayectoria";

export const SQUAD_POSITIONS: SquadPosition[] = ["Portero", "Defensa", "Centrocampista", "Delantero"];

export const SQUAD_ROLE_CODES: SquadRoleCode[] = [
  "POR", "LD", "LI", "DFC", "MC", "MCO", "MCD", "SD", "ED", "DC", "MP", "EI",
];

export const SQUAD_POSITION_LABELS: Record<SquadPosition, string> = {
  Portero: "Porteros",
  Defensa: "Defensas",
  Centrocampista: "Centrocampistas",
  Delantero: "Delanteros",
};

/** Bloques de visualización en plantilla (agrupados por rol). */
export type SquadSection =
  | "porteros"
  | "laterales"
  | "centrales"
  | "centrocampistas"
  | "extremos"
  | "delanteros";

export const SQUAD_SECTIONS: SquadSection[] = [
  "porteros",
  "laterales",
  "centrales",
  "centrocampistas",
  "extremos",
  "delanteros",
];

export const SQUAD_SECTION_LABELS: Record<SquadSection, string> = {
  porteros: "Porteros",
  laterales: "Laterales",
  centrales: "Centrales",
  centrocampistas: "Centrocampistas",
  extremos: "Extremos",
  delanteros: "Delanteros",
};

const ROLE_TO_SQUAD_SECTION: Record<SquadRoleCode, SquadSection> = {
  POR: "porteros",
  LI: "laterales",
  LD: "laterales",
  DFC: "centrales",
  MC: "centrocampistas",
  MCO: "centrocampistas",
  MCD: "centrocampistas",
  EI: "extremos",
  ED: "extremos",
  SD: "delanteros",
  DC: "delanteros",
  MP: "delanteros",
};

const POSITION_TO_SQUAD_SECTION: Record<SquadPosition, SquadSection> = {
  Portero: "porteros",
  Defensa: "centrales",
  Centrocampista: "centrocampistas",
  Delantero: "delanteros",
};

export function getSquadSection(player: Pick<SquadPlayer, "rol" | "posicion">): SquadSection {
  return ROLE_TO_SQUAD_SECTION[player.rol] ?? POSITION_TO_SQUAD_SECTION[player.posicion];
}
