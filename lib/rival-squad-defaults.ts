import { getImportedRivalSquad } from "@/lib/rival-squad-imports";
import { getRivalSquad } from "@/lib/rival-squads";
import type { Team } from "@/types";
import type { RivalSquadImport, RivalSquadImportPlayer } from "@/types/rival-squad-import";

function defaultStadiumLabel(team: Team): string {
  const raw = team.stadium.trim();
  if (!raw) return `Estadio ${team.shortName || team.name}`;
  return /^estadio\s/i.test(raw) ? raw : `Estadio ${raw}`;
}

function rivalPlayerToImport(player: ReturnType<typeof getRivalSquad>[number], index: number): RivalSquadImportPlayer {
  return {
    dorsal: index + 1,
    jugador: player.displayName,
    pos: player.position,
    edad: null,
    pj: player.stats.appearances,
    g: player.stats.goals,
    a: player.stats.assists,
    ta: player.stats.yellowCards,
    tr: player.stats.redCards,
    valor: null,
    contrato: null,
  };
}

/** Plantilla inicial para editar en CMS (import del código o generada). */
export function buildDefaultRivalSquadImport(team: Team): RivalSquadImport {
  const imported = getImportedRivalSquad(team.id);
  if (imported) {
    return structuredClone(imported);
  }

  const roster = getRivalSquad(team);
  return {
    estadio: defaultStadiumLabel(team),
    capacidad: 5000,
    entrenador: team.coach.trim() || "—",
    plantilla: roster.map(rivalPlayerToImport),
  };
}
