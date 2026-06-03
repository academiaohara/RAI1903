import { getCompeticionSquadData } from "@/lib/competicion-squad";
import { getTeamByGender } from "@/lib/fixtures";
import { getPlayerDisplayName } from "@/lib/squad-utils";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { MatchAvailabilityPlayer } from "@/types";
import type { SquadPlayer } from "@/types/squad";

export type MatchSquadOption = {
  playerId: string;
  name: string;
  dorsal: number;
};

export function squadPlayersToMatchOptions(squad: SquadPlayer[]): MatchSquadOption[] {
  return squad
    .map((player) => ({
      playerId: player.id,
      name: getPlayerDisplayName(player),
      dorsal: player.dorsal,
    }))
    .sort((a, b) => a.dorsal - b.dorsal);
}

export function getMatchTeamSquadOptions(
  teamId: string,
  gender: PrimerEquipoGender,
  bundles?: SeasonBundlesMap,
): MatchSquadOption[] {
  const team = getTeamByGender(teamId, gender);
  if (!team) return [];

  const { squad } = getCompeticionSquadData(gender, team, bundles);
  return squadPlayersToMatchOptions(squad);
}

export function availabilityPlayerKey(entry: MatchAvailabilityPlayer): string {
  return entry.playerId ?? entry.name.trim().toLowerCase();
}
