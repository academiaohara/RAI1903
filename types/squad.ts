export type SquadPosition = "Portero" | "Defensa" | "Centrocampista" | "Delantero";

export type SquadViewMode = "lista" | "fichas";

export type PlayerMatchRecord = {
  fecha: string;
  rival: string;
  competicion: string;
  minutos: number;
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
  edad: number;
  fechaNacimiento: string;
  lugarNacimiento: string;
  nacionalidad: string;
  altura: string;
  peso: string;
  piernaBuena: "Derecha" | "Izquierda" | "Ambidiestro";
  contratoHasta: string;
  foto: string | null;
  partidos: number;
  minutos: number;
  goles: number;
  asistencias: number;
  amarillas: number;
  rojas: number;
  xG: number;
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
};

export type SquadClubInfo = {
  nombre: string;
  temporada: string;
  estadio: string;
  escudo: string;
  entrenador: string;
  jugadores: number;
  stats: SquadClubStats;
};

export type SquadModalTab = "resumen" | "partidos" | "estadisticas" | "trayectoria";

export const SQUAD_POSITIONS: SquadPosition[] = ["Portero", "Defensa", "Centrocampista", "Delantero"];

export const SQUAD_POSITION_LABELS: Record<SquadPosition, string> = {
  Portero: "Porteros",
  Defensa: "Defensas",
  Centrocampista: "Centrocampistas",
  Delantero: "Delanteros",
};
