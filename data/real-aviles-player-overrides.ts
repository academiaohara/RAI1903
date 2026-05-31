import { buildPlayerMatchHistory, mergeMatchHistoryOverrides } from "@/lib/player-match-history";
import type { PlayerCareerRecord, PlayerMatchRecord, SquadPlayer } from "@/types/squad";

const NANDO_CAREER: PlayerCareerRecord[] = [
  { temporada: "2019/20", club: "Balón de Cádiz CF", partidos: 0, goles: 0, asistencias: 0 },
  { temporada: "2020/21", club: "Cádiz U19", partidos: 15, goles: 0, asistencias: 1 },
  { temporada: "2021/22", club: "Cádiz U19", partidos: 25, goles: 0, asistencias: 1 },
  { temporada: "2021/22", club: "Cádiz CF Mirandilla", partidos: 4, goles: 0, asistencias: 0 },
  { temporada: "2022/23", club: "Cádiz CF Mirandilla", partidos: 20, goles: 1, asistencias: 1 },
  { temporada: "2023/24", club: "Cádiz CF Mirandilla", partidos: 14, goles: 1, asistencias: 1 },
  { temporada: "2024/25", club: "Hércules", partidos: 3, goles: 0, asistencias: 0 },
  { temporada: "2025/26", club: "Real Avilés Industrial", partidos: 11, goles: 0, asistencias: 0 },
];

const NANDO_MATCHES_2526: PlayerMatchRecord[] = [
  { fecha: "2025-10-30", rival: "Real Ávila", competicion: "Copa del Rey", minutos: 120, goles: 0, asistencias: 0, amarillas: 0, rojas: 0 },
  { fecha: "2026-02-15", rival: "Celta Fortuna", competicion: "Primera Federación", minutos: 90, goles: 0, asistencias: 0, amarillas: 0, rojas: 0 },
  { fecha: "2026-03-14", rival: "CF Talavera", competicion: "Primera Federación", minutos: 90, goles: 0, asistencias: 0, amarillas: 0, rojas: 0 },
  { fecha: "2026-03-22", rival: "CP Cacereño", competicion: "Primera Federación", minutos: 90, goles: 0, asistencias: 0, amarillas: 0, rojas: 0 },
  { fecha: "2026-04-05", rival: "Ourense CF", competicion: "Primera Federación", minutos: 90, goles: 0, asistencias: 0, amarillas: 0, rojas: 0 },
  { fecha: "2026-04-11", rival: "Osasuna Promesas", competicion: "Primera Federación", minutos: 90, goles: 0, asistencias: 0, amarillas: 0, rojas: 0 },
  { fecha: "2026-04-18", rival: "Unionistas CF", competicion: "Primera Federación", minutos: 90, goles: 0, asistencias: 0, amarillas: 0, rojas: 0 },
  { fecha: "2026-04-26", rival: "Racing Ferrol", competicion: "Primera Federación", minutos: 90, goles: 0, asistencias: 0, amarillas: 0, rojas: 0 },
  { fecha: "2026-05-02", rival: "CD Guadalajara", competicion: "Primera Federación", minutos: 90, goles: 0, asistencias: 0, amarillas: 0, rojas: 0 },
  { fecha: "2026-05-09", rival: "SD Ponferradina", competicion: "Primera Federación", minutos: 90, goles: 0, asistencias: 0, amarillas: 0, rojas: 0 },
  { fecha: "2026-05-17", rival: "Barakaldo CF", competicion: "Primera Federación", minutos: 90, goles: 0, asistencias: 0, amarillas: 0, rojas: 0 },
];

function enrichNandoAlmodovar(player: SquadPlayer): SquadPlayer {
  if (player.dorsal !== 13) return player;

  return {
    ...player,
    nombre: "Nando",
    apellido: "Almodóvar",
    edad: 22,
    fechaNacimiento: "2003-11-03",
    lugarNacimiento: "Jerez de la Frontera (Cádiz)",
    altura: "1,92 m",
    peso: "80 kg",
    estado: "suplente",
    valorMercado: "83 mil €",
    descripcion:
      "Hernando Almodóvar Marrufo, conocido como Nando, llega cedido desde el Cádiz CF Mirandilla. Portero de 1,92 m formado en la cantera del Cádiz, con experiencia en Segunda Federación y Primera Federación.",
    partidos: 11,
    minutos: 1020,
    historialPartidos: mergeMatchHistoryOverrides(
      buildPlayerMatchHistory(
        {
          id: player.id,
          partidos: 11,
          minutos: 1020,
          goles: 0,
          asistencias: 0,
          amarillas: 0,
          rojas: 0,
        },
        "masculino",
      ),
      NANDO_MATCHES_2526,
    ),
    trayectoria: NANDO_CAREER,
  };
}

export function applyRealAvilesPlayerOverrides(squad: SquadPlayer[]): SquadPlayer[] {
  return squad.map(enrichNandoAlmodovar);
}
