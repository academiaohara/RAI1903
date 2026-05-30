import { RAI_FEM_TEAM_ID, RAI_TEAM_ID } from "@/data/mock";
import {
  buildClubInfoFromImport,
  buildSquadFromImport,
  getImportedRivalSquad,
} from "@/lib/rival-squad-imports";
import { getRivalSquad, type RivalPlayer } from "@/lib/rival-squads";
import { getSquadClubInfo, getSquadPlayers } from "@/lib/squad-data";
import { getSquadPlayerPhoto, getStadiumPhoto } from "@/lib/squad-photos";
import { getTeamCrestById } from "@/lib/team-crests";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Team } from "@/types";
import type { SquadClubInfo, SquadPlayer, SquadPosition } from "@/types/squad";
import type { SquadRoleCode } from "@/types/squad";

const ROLES_BY_POSITION: Record<SquadPosition, SquadRoleCode[]> = {
  Portero: ["POR"],
  Defensa: ["LD", "LI", "DFC"],
  Centrocampista: ["MC", "MCD", "MCO"],
  Delantero: ["ED", "EI", "DC", "SD"],
};

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function parseDisplayName(displayName: string): { nombre: string; apellido: string } {
  const parts = displayName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { nombre: parts[0]!, apellido: "" };
  }
  const nombre = parts[0]!.replace(/\.$/, "");
  const apellido = parts.slice(1).join(" ");
  return { nombre, apellido };
}

function roleForRival(player: RivalPlayer, index: number): SquadRoleCode {
  const roles = ROLES_BY_POSITION[player.position as SquadPosition];
  return roles[(hashString(player.id) + index) % roles.length] ?? "MC";
}

function rivalToSquadPlayer(player: RivalPlayer, team: Team, index: number): SquadPlayer {
  const { nombre, apellido } = parseDisplayName(player.displayName);
  const seed = hashString(player.id);
  const age = 20 + (seed % 14);
  const birthYear = new Date().getFullYear() - age;

  return {
    id: player.id,
    nombre,
    apellido,
    dorsal: index + 1,
    posicion: player.position as SquadPosition,
    rol: roleForRival(player, index),
    estado: player.status,
    edad: age,
    fechaNacimiento: `${birthYear}-06-15`,
    lugarNacimiento: team.city,
    nacionalidad: "España",
    altura: "1,78 m",
    peso: "76 kg",
    piernaBuena: seed % 5 === 0 ? "Izquierda" : "Derecha",
    contratoHasta: "2026-06-30",
    descripcion: `Jugador de ${team.shortName} en la temporada 2025/26.`,
    foto: null,
    partidos: player.stats.appearances,
    minutos: player.stats.appearances * 72,
    goles: player.stats.goals,
    asistencias: player.stats.assists,
    amarillas: player.stats.yellowCards,
    rojas: player.stats.redCards,
    historialPartidos: [],
    trayectoria: [
      {
        temporada: "2025/26",
        club: team.name,
        partidos: player.stats.appearances,
        goles: player.stats.goals,
        asistencias: player.stats.assists,
      },
    ],
  };
}

function buildClubInfoFromTeam(team: Team, playerCount: number): SquadClubInfo {
  const stadiumImage = getStadiumPhoto(team.id);

  return {
    nombre: team.name,
    temporada: "2025/26",
    estadio: team.stadium,
    estadioInfo: {
      nombre: team.stadium,
      imagen: stadiumImage,
      capacidad: 4000 + (hashString(team.id) % 12000),
      direccion: team.stadium,
      ciudad: team.city,
      inaugurado: 1950 + (hashString(team.id) % 60),
      superficie: "Cesped natural",
    },
    escudo: getTeamCrestById(team.id, team.crestInitials),
    entrenador: team.coach,
    jugadores: playerCount,
    stats: {
      partidos: team.stats.played,
      victorias: team.stats.won,
      empates: team.stats.drawn,
      derrotas: team.stats.lost,
      golesFavor: team.stats.goalsFor,
      golesContra: team.stats.goalsAgainst,
      porteriasImbatidas: Math.max(0, Math.floor(team.stats.won / 2)),
    },
  };
}

export function isRaiCompetitionTeam(teamId: string, gender: PrimerEquipoGender): boolean {
  return gender === "femenino" ? teamId === RAI_FEM_TEAM_ID : teamId === RAI_TEAM_ID;
}

export function getCompeticionSquadData(
  gender: PrimerEquipoGender,
  team: Team,
): { club: SquadClubInfo; squad: SquadPlayer[]; isOwnClub: boolean } {
  const isOwnClub = isRaiCompetitionTeam(team.id, gender);
  const imported = getImportedRivalSquad(team.id);

  if (imported) {
    const squad =
      isOwnClub && gender === "masculino"
        ? buildSquadFromImport(team, imported).map((player) => ({
            ...player,
            foto: getSquadPlayerPhoto(player.dorsal),
          }))
        : buildSquadFromImport(team, imported);

    return {
      club: isOwnClub ? getSquadClubInfo(gender) : buildClubInfoFromImport(team, imported),
      squad,
      isOwnClub,
    };
  }

  if (isOwnClub) {
    return {
      club: getSquadClubInfo(gender),
      squad: getSquadPlayers(gender),
      isOwnClub: true,
    };
  }

  const rivalSquad = getRivalSquad(team);
  const squad = rivalSquad.map((player, index) => rivalToSquadPlayer(player, team, index));

  return {
    club: buildClubInfoFromTeam(team, squad.length),
    squad,
    isOwnClub: false,
  };
}
