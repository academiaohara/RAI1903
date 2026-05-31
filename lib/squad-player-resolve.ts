import { getPlayerDisplayName, getPlayerFullName } from "@/lib/squad-utils";
import type { SquadPlayer } from "@/types/squad";

function normalizePlayerName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveSquadPlayerByName(squad: SquadPlayer[], rawName: string): SquadPlayer | undefined {
  const normalized = normalizePlayerName(rawName);
  if (!normalized) return undefined;

  const exact = squad.find((player) => normalizePlayerName(getPlayerFullName(player)) === normalized);
  if (exact) return exact;

  const byDisplay = squad.find((player) => normalizePlayerName(getPlayerDisplayName(player)) === normalized);
  if (byDisplay) return byDisplay;

  const byLastName = squad.find((player) => {
    const last = normalizePlayerName(player.apellido);
    const first = normalizePlayerName(player.nombre);
    return last === normalized || first === normalized;
  });
  if (byLastName) return byLastName;

  return squad.find((player) => {
    const full = normalizePlayerName(getPlayerFullName(player));
    return full.includes(normalized) || normalized.includes(full);
  });
}

export function scorerLabelForPlayer(player: SquadPlayer): string {
  return getPlayerDisplayName(player);
}
