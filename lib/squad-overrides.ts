import type { SquadPlayer } from "@/types/squad";

export const squadPlayerOverrideKey = (playerId: string) => `squad-player:${playerId}`;

export function mergeSquadPlayerOverrides(
  base: SquadPlayer[],
  getOverride: <T>(key: string) => T | undefined,
): SquadPlayer[] {
  return base.map((player) => ({
    ...player,
    ...(getOverride<Partial<SquadPlayer>>(squadPlayerOverrideKey(player.id)) ?? {}),
  }));
}

export function findSquadPlayerInList(squad: SquadPlayer[], playerId: string): SquadPlayer | undefined {
  return squad.find((player) => player.id === playerId);
}
