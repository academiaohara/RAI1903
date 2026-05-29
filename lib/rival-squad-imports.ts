import { arenteiroSquadImport } from "@/data/rivals/arenteiro";
import { arenasSquadImport } from "@/data/rivals/arenas";
import { athleticBilbaoBSquadImport } from "@/data/rivals/athletic-bilbao-b";
import { barakaldoSquadImport } from "@/data/rivals/barakaldo";
import { cacerenoSquadImport } from "@/data/rivals/cacereno";
import { castillaSquadImport } from "@/data/rivals/castilla";
import { celtaFortunaSquadImport } from "@/data/rivals/celta-fortuna";
import { ferrolSquadImport } from "@/data/rivals/ferrol";
import { guadalajaraSquadImport } from "@/data/rivals/guadalajara";
import { lugoSquadImport } from "@/data/rivals/lugo";
import { meridaSquadImport } from "@/data/rivals/merida";
import { osasunaPromesasSquadImport } from "@/data/rivals/osasuna-promesas";
import { ponferradinaSquadImport } from "@/data/rivals/ponferradina";
import { pontevedraSquadImport } from "@/data/rivals/pontevedra";
import { realAvilesIndustrialSquadImport } from "@/data/rivals/real-aviles-industrial";
import { talaveraSquadImport } from "@/data/rivals/talavera";
import { tenerifeSquadImport } from "@/data/rivals/tenerife";
import { unionistasSquadImport } from "@/data/rivals/unionistas";
import { zamoraSquadImport } from "@/data/rivals/zamora";
import { getTeamCrestById } from "@/lib/team-crests";
import { getStadiumPhoto } from "@/lib/squad-photos";
import type { Team } from "@/types";
import type { RivalSquadImport, RivalSquadImportPlayer } from "@/types/rival-squad-import";
import type { SquadClubInfo, SquadPlayer, SquadPosition } from "@/types/squad";
import type { SquadRoleCode } from "@/types/squad";
import type { PlayerStatus } from "@/types";

const RIVAL_SQUAD_IMPORTS: Record<string, RivalSquadImport> = {
  arenteiro: arenteiroSquadImport,
  arenas: arenasSquadImport,
  "athletic-bilbao-b": athleticBilbaoBSquadImport,
  barakaldo: barakaldoSquadImport,
  cacereno: cacerenoSquadImport,
  castilla: castillaSquadImport,
  "celta-fortuna": celtaFortunaSquadImport,
  ferrol: ferrolSquadImport,
  guadalajara: guadalajaraSquadImport,
  lugo: lugoSquadImport,
  merida: meridaSquadImport,
  "osasuna-promesas": osasunaPromesasSquadImport,
  ponferradina: ponferradinaSquadImport,
  pontevedra: pontevedraSquadImport,
  "real-aviles-industrial": realAvilesIndustrialSquadImport,
  talavera: talaveraSquadImport,
  tenerife: tenerifeSquadImport,
  unionistas: unionistasSquadImport,
  zamora: zamoraSquadImport,
};

function parsePlayerName(jugador: string): { nombre: string; apellido: string } {
  const parts = jugador.trim().split(/\s+/);
  if (parts.length === 1) {
    return { nombre: parts[0]!, apellido: "" };
  }
  return { nombre: parts[0]!, apellido: parts.slice(1).join(" ") };
}

function mapRivalPosition(pos: string): { posicion: SquadPosition; rol: SquadRoleCode } {
  const normalized = pos.toLowerCase();

  if (normalized.includes("portero")) {
    return { posicion: "Portero", rol: "POR" };
  }
  if (normalized.includes("lateral izquierdo")) {
    return { posicion: "Defensa", rol: "LI" };
  }
  if (normalized.includes("lateral derecho")) {
    return { posicion: "Defensa", rol: "LD" };
  }
  if (normalized.includes("defensa central")) {
    return { posicion: "Defensa", rol: "DFC" };
  }
  if (normalized === "defensa") {
    return { posicion: "Defensa", rol: "DFC" };
  }
  if (normalized.includes("mediocentro ofensivo") || normalized.includes("mediapunta")) {
    return { posicion: "Centrocampista", rol: "MCO" };
  }
  if (normalized.includes("pivote") || normalized.includes("mediocentro")) {
    return { posicion: "Centrocampista", rol: "MC" };
  }
  if (normalized.includes("extremo izquierdo")) {
    return { posicion: "Delantero", rol: "EI" };
  }
  if (normalized.includes("extremo derecho")) {
    return { posicion: "Delantero", rol: "ED" };
  }
  if (normalized.includes("delantero") || normalized.includes("atacante")) {
    return { posicion: "Delantero", rol: "DC" };
  }
  if (normalized.includes("centrocampista")) {
    return { posicion: "Centrocampista", rol: "MC" };
  }

  return { posicion: "Centrocampista", rol: "MC" };
}

function importPlayerToSquadPlayer(
  team: Team,
  player: RivalSquadImportPlayer,
  status: PlayerStatus = "titular",
): SquadPlayer {
  const { nombre, apellido } = parsePlayerName(player.jugador);
  const { posicion, rol } = mapRivalPosition(player.pos);
  const birthYear =
    player.edad != null ? new Date().getFullYear() - player.edad : new Date().getFullYear();

  return {
    id: `${team.id}-d${player.dorsal}`,
    nombre,
    apellido,
    dorsal: player.dorsal,
    posicion,
    rol,
    estado: status,
    edad: player.edad ?? 0,
    fechaNacimiento: player.edad != null ? `${birthYear}-07-01` : "",
    lugarNacimiento: team.city,
    nacionalidad: "España",
    altura: "1,78 m",
    peso: "76 kg",
    piernaBuena: "Derecha",
    contratoHasta: player.contrato != null ? `${player.contrato}-06-30` : "—",
    descripcion: player.valor
      ? `Valor de mercado: ${player.valor}. Jugador de ${team.shortName} en la temporada 2025/26.`
      : `Jugador de ${team.shortName} en la temporada 2025/26.`,
    foto: null,
    partidos: player.pj,
    minutos: player.pj * 72,
    goles: player.g,
    asistencias: player.a,
    amarillas: player.ta,
    rojas: player.tr,
    historialPartidos: [],
    trayectoria: [
      {
        temporada: "2025/26",
        club: team.name,
        partidos: player.pj,
        goles: player.g,
        asistencias: player.a,
      },
    ],
  };
}

export function getImportedRivalSquad(teamId: string): RivalSquadImport | null {
  return RIVAL_SQUAD_IMPORTS[teamId] ?? null;
}

export function buildSquadFromImport(team: Team, data: RivalSquadImport): SquadPlayer[] {
  return data.plantilla.map((player) => importPlayerToSquadPlayer(team, player));
}

export function buildClubInfoFromImport(team: Team, data: RivalSquadImport): SquadClubInfo {
  const stadiumImage = getStadiumPhoto(team.id);
  const shortStadiumName = data.estadio.replace(/^Estadio\s+/i, "");

  return {
    nombre: team.name,
    temporada: "2025/26",
    estadio: shortStadiumName,
    estadioInfo: {
      nombre: data.estadio,
      imagen: stadiumImage,
      capacidad: data.capacidad,
      direccion: data.estadio,
      ciudad: team.city,
      inaugurado: 1925,
      superficie: "Césped natural",
    },
    escudo: getTeamCrestById(team.id, team.crestInitials),
    entrenador: data.entrenador,
    jugadores: data.plantilla.length,
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
