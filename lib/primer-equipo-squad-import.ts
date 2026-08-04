import type { CanteraSquadImport, CanteraSquadImportPlayer } from "@/types/cantera-squad-import";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { SquadClubInfo, SquadPlayer, SquadPosition, SquadRoleCode } from "@/types/squad";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parsePlayerName(jugador: string): { nombre: string; apellido: string } {
  const parts = jugador.trim().split(/\s+/);
  if (parts.length === 1) {
    return { nombre: parts[0]!, apellido: "" };
  }
  return { nombre: parts[0]!, apellido: parts.slice(1).join(" ") };
}

function mapImportPosition(pos: string): { posicion: SquadPosition; rol: SquadRoleCode } {
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
  if (normalized.includes("central") || normalized.includes("defensa")) {
    return { posicion: "Defensa", rol: "DFC" };
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
  if (normalized.includes("media punta") || normalized.includes("mediapunta")) {
    return { posicion: "Centrocampista", rol: "MCO" };
  }
  if (
    normalized.includes("medio centro") ||
    normalized.includes("mediocentro") ||
    normalized.includes("centrocampista")
  ) {
    return { posicion: "Centrocampista", rol: "MC" };
  }

  return { posicion: "Centrocampista", rol: "MC" };
}

function importPlayerToSquadPlayer(
  player: CanteraSquadImportPlayer,
  index: number,
  gender: PrimerEquipoGender,
): SquadPlayer {
  const { nombre, apellido } = parsePlayerName(player.jugador);
  const { posicion, rol } = mapImportPosition(player.pos);
  const idPrefix = gender === "femenino" ? "fem" : "rai";
  const slug = slugify(player.jugador) || `jugador-${index + 1}`;
  const birthYear =
    player.edad != null ? new Date().getFullYear() - player.edad : new Date().getFullYear();

  return {
    id: `${idPrefix}-${slug}-${index + 1}`,
    nombre,
    apellido,
    dorsal: player.dorsal ?? 0,
    posicion,
    rol,
    estado: "suplente",
    edad: player.edad ?? 0,
    fechaNacimiento: player.edad != null ? `${birthYear}-07-01` : "",
    lugarNacimiento: "",
    nacionalidad: "España",
    altura: "",
    peso: "",
    piernaBuena: "Derecha",
    contratoHasta: "",
    valorMercado: null,
    descripcion: "",
    foto: null,
    partidos: player.pj,
    minutos: player.min,
    goles: player.goles,
    asistencias: 0,
    amarillas: player.ta,
    rojas: player.tr,
    historialPartidos: [],
    trayectoria: [],
  };
}

export type PrimerEquipoSquadImportResult = {
  players: SquadPlayer[];
  clubInfo?: Partial<SquadClubInfo>;
};

export function buildSquadFromCanteraImport(
  data: CanteraSquadImport,
  gender: PrimerEquipoGender,
): PrimerEquipoSquadImportResult {
  const players = data.plantilla.map((player, index) => importPlayerToSquadPlayer(player, index, gender));
  const clubInfo: Partial<SquadClubInfo> = {};

  if (data.entrenador.trim()) {
    clubInfo.entrenador = data.entrenador.trim();
  }

  return {
    players,
    ...(Object.keys(clubInfo).length ? { clubInfo } : {}),
  };
}
