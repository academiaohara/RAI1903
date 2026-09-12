import type { CanteraSquadImport, CanteraSquadImportPlayer } from "@/types/cantera-squad-import";
import type { SquadPlayer, SquadRoleCode } from "@/types/squad";
import { getPlayerFullName } from "@/lib/squad-utils";

const ROLE_TO_POS: Partial<Record<SquadRoleCode, string>> = {
  POR: "Portero",
  LI: "Lateral izquierdo",
  LD: "Lateral derecho",
  DFC: "Defensa central",
  MC: "Centrocampista",
  MCO: "Media punta",
  EI: "Extremo izquierdo",
  ED: "Extremo derecho",
  DC: "Delantero centro",
};

function playerToJsonEntry(player: CanteraSquadImportPlayer): Record<string, unknown> {
  const entry: Record<string, unknown> = {
    dorsal: player.dorsal,
    jugador: player.jugador,
    pos: player.pos,
    pc: player.pc,
    pj: player.pj,
    pt: player.pt,
    min: player.min,
    goles: player.goles,
    ta: player.ta,
    tr: player.tr,
  };
  if (player.edad != null) entry.edad = player.edad;
  if (player.golesEncajados != null) entry.golesEncajados = player.golesEncajados;
  return entry;
}

export function serializeCanteraSquadJson(squad: CanteraSquadImport): string {
  const payload: Record<string, unknown> = {
    entrenador: squad.entrenador,
    plantilla: squad.plantilla.map(playerToJsonEntry),
  };
  if (squad.cuerpoTecnico?.length) {
    payload.cuerpoTecnico = squad.cuerpoTecnico;
  }
  return JSON.stringify(payload, null, 2);
}

export function squadPlayersToCanteraImport(
  players: SquadPlayer[],
  entrenador = "",
): CanteraSquadImport {
  const plantilla: CanteraSquadImportPlayer[] = players.map((player) => ({
    dorsal: player.dorsal > 0 ? player.dorsal : null,
    jugador: getPlayerFullName(player),
    pos: ROLE_TO_POS[player.rol] ?? player.posicion,
    edad: player.edad > 0 ? player.edad : null,
    pc: 0,
    pj: player.partidos,
    pt: 0,
    min: player.minutos,
    goles: player.goles,
    ta: player.amarillas,
    tr: player.rojas,
  }));

  return {
    entrenador,
    mediaEdad: 0,
    plantilla,
  };
}
