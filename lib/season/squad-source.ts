import type { SeasonBundlesMap, SeasonSquadBundle } from "@/lib/cms/season-bundles";
import { getSquadBundle } from "@/lib/cms/season-bundles";
import { fetchSquadPlayersFromCms } from "@/lib/cms/players";
import { shouldUseMockCompetitionFallback } from "@/lib/season/cms-data-policy";
import { getSquadClubInfo, getSquadPlayers } from "@/lib/squad-data";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { SquadClubInfo, SquadPlayer } from "@/types/squad";

export async function resolveSquadPlayers(
  gender: PrimerEquipoGender,
  seasonId: string,
  bundles: SeasonBundlesMap,
): Promise<SquadPlayer[]> {
  const bundle = getSquadBundle(bundles, gender);
  if (bundle?.players?.length) return bundle.players;

  const fromCms = await fetchSquadPlayersFromCms(gender, seasonId);
  if (fromCms.length) return fromCms;

  if (shouldUseMockCompetitionFallback()) return getSquadPlayers(gender);
  return [];
}

export function resolveSquadClubInfo(
  gender: PrimerEquipoGender,
  seasonLabel: string,
  bundles: SeasonBundlesMap,
  squadSize: number,
): SquadClubInfo {
  const bundle = getSquadBundle(bundles, gender);
  const base = getSquadClubInfo(gender);
  const merged: SquadClubInfo = {
    ...base,
    ...(bundle?.clubInfo ?? {}),
    temporada: bundle?.clubInfo?.temporada ?? seasonLabel,
    jugadores: squadSize,
  };
  return merged;
}

export function seasonSquadBundlePayload(players: SquadPlayer[], clubInfo?: Partial<SquadClubInfo>): SeasonSquadBundle {
  return { players, clubInfo };
}
