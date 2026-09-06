import type { SeasonBundlesMap, SeasonSquadBundle } from "@/lib/cms/season-bundles";
import { getSquadBundle } from "@/lib/cms/season-bundles";
import { fetchSquadPlayersFromCms } from "@/lib/cms/players";
import { computeClubLeagueStatsForGender } from "@/lib/season/club-league-stats";
import { shouldUseMockCompetitionFallback } from "@/lib/season/cms-data-policy";
import { getSquadClubInfo, getSquadPlayers } from "@/lib/squad-data";
import { withSquadPlayerPhoto } from "@/lib/squad-photos";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Matchday } from "@/types";
import type { SquadClubInfo, SquadPlayer } from "@/types/squad";

function enrichSquadPhotos(players: SquadPlayer[]): SquadPlayer[] {
  return players.map(withSquadPlayerPhoto);
}

function squadFromBundles(bundles: SeasonBundlesMap | undefined, gender: PrimerEquipoGender): SquadPlayer[] | null {
  const bundle = getSquadBundle(bundles ?? {}, gender);
  if (bundle?.players?.length) return enrichSquadPhotos(bundle.players);
  return null;
}

/** Resuelve plantilla del primer equipo desde bundles CMS (síncrono). */
export function resolveSquadPlayersSync(
  gender: PrimerEquipoGender,
  bundles?: SeasonBundlesMap,
): SquadPlayer[] {
  const fromBundles = squadFromBundles(bundles, gender);
  if (fromBundles) return fromBundles;
  if (shouldUseMockCompetitionFallback()) return enrichSquadPhotos(getSquadPlayers(gender));
  return [];
}

export async function resolveSquadPlayers(
  gender: PrimerEquipoGender,
  seasonId: string,
  bundles: SeasonBundlesMap,
): Promise<SquadPlayer[]> {
  const fromBundles = squadFromBundles(bundles, gender);
  if (fromBundles) return fromBundles;

  const fromCms = await fetchSquadPlayersFromCms(gender, seasonId);
  if (fromCms.length) return enrichSquadPhotos(fromCms);

  if (shouldUseMockCompetitionFallback()) return enrichSquadPhotos(getSquadPlayers(gender));
  return [];
}

export function resolveSquadClubInfo(
  gender: PrimerEquipoGender,
  seasonLabel: string,
  bundles: SeasonBundlesMap,
  squadSize: number,
  leagueMatchdays: readonly Matchday[],
): SquadClubInfo {
  const bundle = getSquadBundle(bundles, gender);
  const base = getSquadClubInfo(gender);
  const stats = computeClubLeagueStatsForGender(gender, leagueMatchdays);

  const mergedClubInfo = bundle?.clubInfo ?? {};
  const estadioInfo = mergedClubInfo.estadioInfo ?? base.estadioInfo;

  return {
    ...base,
    ...mergedClubInfo,
    estadio: mergedClubInfo.estadio ?? estadioInfo.nombre,
    estadioInfo,
    temporada: mergedClubInfo.temporada ?? seasonLabel,
    jugadores: squadSize,
    stats,
  };
}

export function seasonSquadBundlePayload(players: SquadPlayer[], clubInfo?: Partial<SquadClubInfo>): SeasonSquadBundle {
  return { players, clubInfo };
}
