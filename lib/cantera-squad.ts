import { filialBSquadImport2526 } from "@/data/cantera/filial-b-2526";
import { juvenilASquadImport2526 } from "@/data/cantera/juvenil-a-2526";
import type { CanteraTeamId } from "@/lib/cantera-data";
import type { CanteraSquadImport, CanteraSquadImportPlayer } from "@/types/cantera-squad-import";
import type { SquadPosition, SquadRoleCode } from "@/types/squad";
import type { Player } from "@/types";

export type CanteraSquadPlayer = CanteraSquadImportPlayer & {
  id: string;
  nombre: string;
  apellido: string;
  posicion: SquadPosition;
  rol: SquadRoleCode;
  posLabel: string;
};

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parsePlayerName(jugador: string): { nombre: string; apellido: string } {
  const parts = jugador.trim().split(/\s+/);
  if (parts.length === 1) {
    return { nombre: parts[0]!, apellido: "" };
  }
  return { nombre: parts[0]!, apellido: parts.slice(1).join(" ") };
}

function mapCanteraPosition(pos: string): { posicion: SquadPosition; rol: SquadRoleCode } {
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
  if (normalized.includes("central")) {
    return { posicion: "Defensa", rol: "DFC" };
  }
  if (normalized.includes("defensa")) {
    return { posicion: "Defensa", rol: "DFC" };
  }
  if (normalized.includes("extremo izquierdo")) {
    return { posicion: "Delantero", rol: "EI" };
  }
  if (normalized.includes("extremo derecho")) {
    return { posicion: "Delantero", rol: "ED" };
  }
  if (normalized.includes("delantero")) {
    return { posicion: "Delantero", rol: "DC" };
  }
  if (normalized.includes("interior izquierdo")) {
    return { posicion: "Centrocampista", rol: "EI" };
  }
  if (normalized.includes("media punta")) {
    return { posicion: "Centrocampista", rol: "MCO" };
  }
  if (normalized.includes("medio centro") || normalized.includes("mediocentro") || normalized.includes("centrocampista")) {
    return { posicion: "Centrocampista", rol: "MC" };
  }

  return { posicion: "Centrocampista", rol: "MC" };
}

function importPlayerToCanteraPlayer(player: CanteraSquadImportPlayer, idPrefix: string): CanteraSquadPlayer {
  const { nombre, apellido } = parsePlayerName(player.jugador);
  const { posicion, rol } = mapCanteraPosition(player.pos);

  return {
    ...player,
    id: `${idPrefix}-${slugify(player.jugador)}`,
    nombre,
    apellido,
    posicion,
    rol,
    posLabel: player.pos,
  };
}

function toAcademyRosterPlayer(player: CanteraSquadPlayer): Pick<Player, "id" | "displayName" | "number" | "position" | "age"> {
  const shortName = player.apellido ? `${player.nombre} ${player.apellido.split(" ")[0]}` : player.nombre;
  return {
    id: player.id,
    displayName: shortName,
    number: player.dorsal ?? 0,
    position: player.posicion,
    age: player.edad ?? 0,
  };
}

export function getJuvenilASquadImport(): CanteraSquadImport {
  return juvenilASquadImport2526;
}

export function getFilialBSquadImport(): CanteraSquadImport {
  return filialBSquadImport2526;
}

export function getCanteraSquadImport(teamId: CanteraTeamId): CanteraSquadImport {
  return teamId === "filial" ? filialBSquadImport2526 : juvenilASquadImport2526;
}

export function getJuvenilASquadPlayers(): CanteraSquadPlayer[] {
  return juvenilASquadImport2526.plantilla.map((player) => importPlayerToCanteraPlayer(player, "juvenil"));
}

export function getFilialBSquadPlayers(): CanteraSquadPlayer[] {
  return filialBSquadImport2526.plantilla.map((player) => importPlayerToCanteraPlayer(player, "filial"));
}

export function getCanteraSquadPlayers(teamId: CanteraTeamId): CanteraSquadPlayer[] {
  return teamId === "filial" ? getFilialBSquadPlayers() : getJuvenilASquadPlayers();
}

export function buildJuvenilAcademyRoster(): Array<Pick<Player, "id" | "displayName" | "number" | "position" | "age">> {
  return getJuvenilASquadPlayers().map(toAcademyRosterPlayer);
}

export function buildFilialAcademyRoster(): Array<Pick<Player, "id" | "displayName" | "number" | "position" | "age">> {
  return getFilialBSquadPlayers().map(toAcademyRosterPlayer);
}

export function formatCanteraGoals(player: CanteraSquadPlayer): string {
  if (player.posicion === "Portero" && player.golesEncajados != null) {
    return `(${player.golesEncajados})`;
  }
  return String(player.goles);
}
