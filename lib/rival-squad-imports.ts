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
import { buildPlayerMatchHistory } from "@/lib/player-match-history";
import { getStadiumPhoto } from "@/lib/squad-photos";
import type { Team } from "@/types";
import { normalizeRivalFoot } from "@/lib/match-goals";
import { RIVAL_SQUAD_POS_OPTIONS } from "@/lib/rival-squad-positions";
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
  const normalized = pos.trim().toLowerCase();
  const exact = RIVAL_SQUAD_POS_OPTIONS.find((option) => option.value.toLowerCase() === normalized);
  if (exact) {
    return { posicion: exact.grupo as SquadPosition, rol: exact.web };
  }

  if (normalized.includes("portero")) {
    return { posicion: "Portero", rol: "POR" };
  }
  if (normalized.includes("lateral izquierdo")) {
    return { posicion: "Defensa", rol: "LI" };
  }
  if (normalized.includes("lateral derecho")) {
    return { posicion: "Defensa", rol: "LD" };
  }
  if (normalized.includes("defensa central") || normalized === "defensa") {
    return { posicion: "Defensa", rol: "DFC" };
  }
  if (normalized.includes("mediocentro ofensivo") || normalized.includes("mediapunta")) {
    return { posicion: "Centrocampista", rol: "MCO" };
  }
  if (normalized.includes("pivote") || normalized.includes("mediocentro") || normalized.includes("centrocampista")) {
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

  return { posicion: "Centrocampista", rol: "MC" };
}

function rivalImportPlayerId(teamId: string, player: RivalSquadImportPlayer, index: number): string {
  if (player.dorsal != null) {
    return `${teamId}-d${player.dorsal}`;
  }
  const slug = player.jugador
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug ? `${teamId}-n-${slug}` : `${teamId}-i${index}`;
}

function importPlayerToSquadPlayer(
  team: Team,
  player: RivalSquadImportPlayer,
  index: number,
  options?: { forQuiniela?: boolean },
): SquadPlayer {
  const status: PlayerStatus = player.estado ?? "titular";
  const { nombre, apellido } = parsePlayerName(player.jugador);
  const { posicion, rol } = mapRivalPosition(player.pos);
  const edad = player.edad ?? null;
  const birthYear = edad != null ? new Date().getFullYear() - edad : new Date().getFullYear();
  const pj = options?.forQuiniela ? 0 : (player.pj ?? 0);
  const goles = options?.forQuiniela ? 0 : (player.g ?? 0);
  const asistencias = options?.forQuiniela ? 0 : (player.a ?? 0);
  const amarillas = options?.forQuiniela ? 0 : (player.ta ?? 0);
  const rojas = options?.forQuiniela ? 0 : (player.tr ?? 0);

  const playerId = rivalImportPlayerId(team.id, player, index);

  return {
    id: playerId,
    nombre,
    apellido,
    dorsal: player.dorsal ?? 0,
    posicion,
    rol,
    estado: status,
    edad: edad ?? 0,
    fechaNacimiento: edad != null ? `${birthYear}-07-01` : "",
    lugarNacimiento: team.city,
    nacionalidad: "España",
    altura: player.altura?.trim() || "—",
    peso: "76 kg",
    piernaBuena: normalizeRivalFoot(player.pie),
    contratoHasta: player.contrato != null ? `${player.contrato}-06-30` : "—",
    valorMercado: player.valor ?? null,
    descripcion: player.valor
      ? `Valor de mercado: ${player.valor}. Jugador de ${team.shortName} en la temporada 2025/26.`
      : `Jugador de ${team.shortName} en la temporada 2025/26.`,
    foto: null,
    partidos: pj,
    minutos: pj * 72,
    goles,
    asistencias,
    amarillas,
    rojas,
    historialPartidos: options?.forQuiniela
      ? []
      : buildPlayerMatchHistory(
          {
            id: playerId,
            partidos: pj,
            minutos: pj * 72,
            goles,
            asistencias,
            amarillas,
            rojas,
          },
          "masculino",
        ),
    trayectoria: options?.forQuiniela
      ? []
      : [
          {
            temporada: "2025/26",
            club: team.name,
            partidos: pj,
            goles,
            asistencias,
          },
        ],
  };
}

export function getImportedRivalSquad(teamId: string): RivalSquadImport | null {
  return RIVAL_SQUAD_IMPORTS[teamId] ?? null;
}

export function buildSquadFromImport(
  team: Team,
  data: RivalSquadImport,
  options?: { forQuiniela?: boolean },
): SquadPlayer[] {
  return data.plantilla.map((player, index) => importPlayerToSquadPlayer(team, player, index, options));
}

export function buildQuinielaSquadFromImport(team: Team, data: RivalSquadImport): SquadPlayer[] {
  return buildSquadFromImport(team, data, { forQuiniela: true });
}

export { rivalImportPlayerId };

export function buildClubInfoFromImport(
  team: Team,
  data: RivalSquadImport,
  seasonLabel = "2025/26",
): SquadClubInfo {
  if (data.estadioInfo?.nombre?.trim()) {
    const info = data.estadioInfo;
    const shortStadiumName = info.nombre.replace(/^Estadio\s+/i, "");
    return {
      nombre: team.name,
      temporada: seasonLabel,
      estadio: shortStadiumName,
      estadioInfo: info,
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

  const stadiumImage = getStadiumPhoto(team.id);
  const shortStadiumName = data.estadio.replace(/^Estadio\s+/i, "");

  return {
    nombre: team.name,
    temporada: seasonLabel,
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
