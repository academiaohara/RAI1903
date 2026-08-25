import { aggregateTeamPlayerGoals, readMatchGoalsOverride } from "@/lib/match-goals";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Matchday } from "@/types";
import type { SquadPlayer } from "@/types/squad";

export function applyMatchdayGoalsToSquad(
  squad: SquadPlayer[],
  teamId: string,
  matchdays: Matchday[],
  gender: PrimerEquipoGender,
  getOverride: (key: string) => unknown,
): SquadPlayer[] {
  const totals = aggregateTeamPlayerGoals(matchdays, teamId, (matchId) => {
    return readMatchGoalsOverride(getOverride, gender, matchId)?.goals ?? [];
  });

  if (totals.size === 0) return squad;

  return squad.map((player) => {
    const byDorsal = totals.get(String(player.dorsal));
    const byId = totals.get(player.id);
    const goals = byDorsal ?? byId;
    if (goals === undefined) return player;
    return { ...player, goles: goals };
  });
}
