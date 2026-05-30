import { matchdays, players, playersFemenino, teams, teamsFemenino } from "@/data/mock";
import { RAI_FEM_TEAM_ID, RAI_TEAM_ID } from "@/data/mock";
import {
  buildClubInfoFromImport,
  buildSquadFromImport,
  getImportedRivalSquad,
} from "@/lib/rival-squad-imports";
import { getTeamCrestById } from "@/lib/team-crests";
import { matchToFinishedLeagueMatch } from "@/lib/standings";
import { getPlayerRole } from "@/lib/player-roles";
import { getSquadPlayerPhoto, getStadiumPhoto } from "@/lib/squad-photos";
import type { Player } from "@/types";
import type { PlayerCareerRecord, PlayerMatchRecord, SquadClubInfo, SquadPlayer } from "@/types/squad";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

const BIRTH_PLACES = [
  "Avilés",
  "Gijon",
  "Oviedo",
  "Langreo",
  "Mieres",
  "Siero",
  "Cangas de Onis",
  "Llanes",
  "Luanco",
  "Pola de Siero",
] as const;

const MATCH_FIXTURES: Array<{ rival: string; competicion: string; fecha: string }> = [
  { rival: "Pontevedra CF", competicion: "Liga RAI1903 Norte", fecha: "2025-08-17" },
  { rival: "CD Numancia", competicion: "Liga RAI1903 Norte", fecha: "2025-08-24" },
  { rival: "UP Langreo", competicion: "Liga RAI1903 Norte", fecha: "2025-08-31" },
  { rival: "Coruxo FC", competicion: "Liga RAI1903 Norte", fecha: "2025-09-07" },
  { rival: "Marino de Luanco", competicion: "Liga RAI1903 Norte", fecha: "2025-09-14" },
  { rival: "SD Compostela", competicion: "Liga RAI1903 Norte", fecha: "2025-09-21" },
  { rival: "Bergantinos FC", competicion: "Liga RAI1903 Norte", fecha: "2025-09-28" },
  { rival: "CD Guijuelo", competicion: "Liga RAI1903 Norte", fecha: "2025-10-05" },
  { rival: "Zamora CF", competicion: "Liga RAI1903 Norte", fecha: "2025-10-12" },
  { rival: "CD Covadonga", competicion: "Copa del Rey", fecha: "2025-10-19" },
  { rival: "Barakaldo CF", competicion: "1ª RFEF - Grupo I", fecha: "2025-10-26" },
  { rival: "Ourense CF", competicion: "1ª RFEF - Grupo I", fecha: "2025-11-02" },
];

const WEIGHT_BY_POSITION: Record<Player["position"], string> = {
  Portero: "82 kg",
  Defensa: "78 kg",
  Centrocampista: "74 kg",
  Delantero: "76 kg",
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pick<T>(items: readonly T[], seed: string, index = 0): T {
  return items[(hashString(`${seed}-${index}`) + index) % items.length] as T;
}

function buildMatchHistory(player: Player): PlayerMatchRecord[] {
  const count = Math.min(player.stats.appearances, MATCH_FIXTURES.length);
  const records: PlayerMatchRecord[] = [];

  let goalsLeft = player.stats.goals;
  let assistsLeft = player.stats.assists;
  let yellowsLeft = player.stats.yellowCards;
  let redsLeft = player.stats.redCards;

  for (let i = 0; i < count; i += 1) {
    const fixture = MATCH_FIXTURES[i];
    const playedFull = i < count - 1 || player.stats.minutes >= 75;
    const minutes = playedFull ? 90 : Math.max(12, player.stats.minutes % 90);

    const matchGoals = goalsLeft > 0 && (i === 0 || hashString(`${player.id}-g-${i}`) % 3 === 0) ? 1 : 0;
    const matchAssists = assistsLeft > 0 && hashString(`${player.id}-a-${i}`) % 4 === 0 ? 1 : 0;
    const matchYellow = yellowsLeft > 0 && hashString(`${player.id}-y-${i}`) % 5 === 0 ? 1 : 0;
    const matchRed = redsLeft > 0 && i === count - 1 && player.stats.redCards > 0 ? 1 : 0;

    goalsLeft -= matchGoals;
    assistsLeft -= matchAssists;
    yellowsLeft -= matchYellow;
    redsLeft -= matchRed;

    records.push({
      fecha: fixture.fecha,
      rival: fixture.rival,
      competicion: fixture.competicion,
      minutos: minutes,
      goles: matchGoals,
      asistencias: matchAssists,
      amarillas: matchYellow,
      rojas: matchRed,
    });
  }

  return records.reverse();
}

function buildCareer(player: Player, clubName: string): PlayerCareerRecord[] {
  const currentSeason: PlayerCareerRecord = {
    temporada: "2025/26",
    club: clubName,
    partidos: player.stats.appearances,
    goles: player.stats.goals,
    asistencias: player.stats.assists,
  };

  const past = player.clubHistory
    .filter((club) => club !== clubName)
    .slice(0, 3)
    .map((club, index) => {
      const factor = 0.55 + index * 0.2;
      return {
        temporada: `${2022 + index}/${23 + index}`,
        club,
        partidos: Math.max(8, Math.round(player.stats.appearances * factor)),
        goles: Math.max(0, Math.round(player.stats.goals * factor * 0.7)),
        asistencias: Math.max(0, Math.round(player.stats.assists * factor * 0.6)),
      };
    });

  return [...past.reverse(), currentSeason];
}

function toSquadPlayer(player: Player, clubName: string, gender: PrimerEquipoGender): SquadPlayer {
  const birthPlace = pick(BIRTH_PLACES, player.id);
  const contractYear = player.seasonsAtClub >= 4 ? 2027 : 2026;

  return {
    id: player.id,
    nombre: player.firstName,
    apellido: player.lastName,
    dorsal: player.number,
    posicion: player.position,
    rol: getPlayerRole(player),
    estado: player.status,
    edad: player.age,
    fechaNacimiento: player.birthDate,
    lugarNacimiento: birthPlace,
    nacionalidad: player.nationality,
    altura: player.height,
    peso: WEIGHT_BY_POSITION[player.position],
    piernaBuena: player.preferredFoot,
    contratoHasta: `${contractYear}-06-30`,
    valorMercado: null,
    descripcion: player.bio,
    foto: gender === "masculino" ? getSquadPlayerPhoto(player.number) : null,
    partidos: player.stats.appearances,
    minutos: player.stats.minutes,
    goles: player.stats.goals,
    asistencias: player.stats.assists,
    amarillas: player.stats.yellowCards,
    rojas: player.stats.redCards,
    historialPartidos: buildMatchHistory(player),
    trayectoria: buildCareer(player, clubName),
  };
}

function countCleanSheets(teamId: string): number {
  return matchdays
    .flatMap((round) => round.matches)
    .reduce((count, match) => {
      const finished = matchToFinishedLeagueMatch(match);
      if (!finished) return count;

      const isHome = finished.homeTeamId === teamId;
      const isAway = finished.awayTeamId === teamId;
      if (!isHome && !isAway) return count;

      const conceded = isHome ? finished.awayScore : finished.homeScore;
      return conceded === 0 ? count + 1 : count;
    }, 0);
}

function getImportedMasculinoSquad(): SquadPlayer[] | null {
  const team = teams.find((entry) => entry.id === RAI_TEAM_ID);
  const imported = getImportedRivalSquad(RAI_TEAM_ID);
  if (!team || !imported) return null;

  return buildSquadFromImport(team, imported).map((player) => ({
    ...player,
    foto: getSquadPlayerPhoto(player.dorsal),
  }));
}

export function getSquadPlayers(gender: PrimerEquipoGender): SquadPlayer[] {
  if (gender === "masculino") {
    const importedSquad = getImportedMasculinoSquad();
    if (importedSquad) return importedSquad;
  }

  const source = gender === "femenino" ? playersFemenino : players;
  const clubName = gender === "femenino" ? "Real Avilés Industrial Femenino" : "Real Avilés Industrial";
  return source.map((player) => toSquadPlayer(player, clubName, gender));
}

export function getSquadClubInfo(gender: PrimerEquipoGender): SquadClubInfo {
  const teamId = gender === "femenino" ? RAI_FEM_TEAM_ID : RAI_TEAM_ID;
  const roster = gender === "femenino" ? teamsFemenino : teams;
  const team = roster.find((entry) => entry.id === teamId);
  const squad = getSquadPlayers(gender);

  if (gender === "masculino" && team) {
    const imported = getImportedRivalSquad(RAI_TEAM_ID);
    if (imported) {
      const club = buildClubInfoFromImport(team, imported);
      return {
        ...club,
        stats: {
          ...club.stats,
          porteriasImbatidas: countCleanSheets(teamId),
        },
      };
    }
  }

  const stats = team?.stats ?? {
    played: 9,
    won: 6,
    drawn: 1,
    lost: 2,
    goalsFor: 19,
    goalsAgainst: 9,
  };

  const stadiumName = team?.stadium ?? "Roman Suarez Puerta";
  const city = team?.city ?? "Avilés";

  return {
    nombre: team?.name ?? "Real Avilés Industrial",
    temporada: "2025/26",
    estadio: stadiumName,
    estadioInfo: {
      nombre: stadiumName,
      imagen: getStadiumPhoto(teamId),
      capacidad: 5000,
      direccion: "Calle Roman Suarez Puerta, s/n",
      ciudad: city,
      inaugurado: 1923,
      superficie: "Cesped natural",
    },
    escudo: getTeamCrestById(teamId),
    entrenador: team?.coach ?? "Miguel Alonso",
    jugadores: squad.length,
    stats: {
      partidos: stats.played,
      victorias: stats.won,
      empates: stats.drawn,
      derrotas: stats.lost,
      golesFavor: stats.goalsFor,
      golesContra: stats.goalsAgainst,
      porteriasImbatidas: countCleanSheets(teamId),
    },
  };
}
