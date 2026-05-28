import type { SquadPlayer } from "@/types/squad";
import type { PlayerRoleCode } from "@/types";

/** Anchor on the pitch in percentage (0–100), from the attacking end toward our goal. */
const ROLE_ANCHORS: Record<PlayerRoleCode, { x: number; y: number }> = {
  POR: { x: 50, y: 90 },
  LD: { x: 16, y: 74 },
  LI: { x: 84, y: 74 },
  DFC: { x: 50, y: 76 },
  MCD: { x: 50, y: 60 },
  MC: { x: 50, y: 50 },
  MCO: { x: 50, y: 40 },
  ED: { x: 82, y: 44 },
  EI: { x: 18, y: 44 },
  SD: { x: 68, y: 34 },
  DC: { x: 50, y: 26 },
  MP: { x: 50, y: 32 },
};

const FALLBACK_BY_POSITION: Record<SquadPlayer["posicion"], { x: number; y: number }> = {
  Portero: { x: 50, y: 90 },
  Defensa: { x: 50, y: 76 },
  Centrocampista: { x: 50, y: 50 },
  Delantero: { x: 50, y: 30 },
};

export type FieldPlacement = {
  x: number;
  y: number;
};

/**
 * Distributes players that share the same role anchor horizontally so cards do not overlap.
 */
export function getSquadFieldPlacement(
  player: SquadPlayer,
  indexInRole: number,
  countInRole: number,
): FieldPlacement {
  const anchor = ROLE_ANCHORS[player.rol] ?? FALLBACK_BY_POSITION[player.posicion];
  if (countInRole <= 1) return anchor;

  const spread = Math.min(22, 8 * (countInRole - 1));
  const step = countInRole > 1 ? spread / (countInRole - 1) : 0;
  const offset = -spread / 2 + step * indexInRole;

  return {
    x: Math.min(92, Math.max(8, anchor.x + offset)),
    y: anchor.y,
  };
}

export function groupPlayersByRole(players: SquadPlayer[]): Map<PlayerRoleCode, SquadPlayer[]> {
  const map = new Map<PlayerRoleCode, SquadPlayer[]>();

  for (const player of players) {
    const list = map.get(player.rol) ?? [];
    list.push(player);
    map.set(player.rol, list);
  }

  for (const [, list] of map) {
    list.sort((a, b) => a.dorsal - b.dorsal);
  }

  return map;
}
