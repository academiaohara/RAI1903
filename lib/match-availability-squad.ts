import { getCompeticionSquadData } from "@/lib/competicion-squad";
import { getTeamByGender } from "@/lib/fixtures";
import { getPlayerDisplayName } from "@/lib/squad-utils";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { MatchAvailabilityPlayer } from "@/types";
export type MatchSquadOption = {
  playerId: string;
  name: string;
  dorsal: number;
};

export function getMatchTeamSquadOptions(
  teamId: string,
  gender: PrimerEquipoGender,
  bundles?: SeasonBundlesMap,
): MatchSquadOption[] {
  const team = getTeamByGender(teamId, gender);
  if (!team) return [];

  const { squad } = getCompeticionSquadData(gender, team, bundles);
  return squad
    .map((player) => ({
      playerId: player.id,
      name: getPlayerDisplayName(player),
      dorsal: player.dorsal,
    }))
    .sort((a, b) => a.dorsal - b.dorsal);
}

export function availabilityPlayerKey(entry: MatchAvailabilityPlayer): string {
  return entry.playerId ?? entry.name.trim().toLowerCase();
}
