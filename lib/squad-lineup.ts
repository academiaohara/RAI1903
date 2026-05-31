import { resolveSquadPlayerByName } from "@/lib/squad-player-resolve";
import type { MatchLineup } from "@/types";
import type { SquadPlayer } from "@/types/squad";

export function findSquadPlayerByDorsal(squad: SquadPlayer[], dorsal: number): SquadPlayer | undefined {
  return squad.find((player) => player.dorsal === dorsal);
}

export function findSquadPlayerByName(squad: SquadPlayer[], name: string): SquadPlayer | undefined {
  return resolveSquadPlayerByName(squad, name);
}

export function lineupPlayersToSquad(
  lineup: MatchLineup,
  squad: SquadPlayer[],
): Array<{ lineupName: string; dorsal: number; player: SquadPlayer | null }> {
  const entries = [...lineup.starters, ...lineup.bench];

  return entries.map((entry) => ({
    lineupName: entry.name,
    dorsal: entry.number,
    player: findSquadPlayerByDorsal(squad, entry.number) ?? null,
  }));
}
