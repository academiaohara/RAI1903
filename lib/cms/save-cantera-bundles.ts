import type { CanteraCmsScope } from "@/lib/cantera/cantera-cms";
import type { CompetitionSeasonId } from "@/data/mock";
import type { FilialCompetitionConfigBundle, FilialFixturesBundle } from "@/lib/cms/filial-bundles";
import {
  bundleMapKey,
  upsertSeasonBundle,
  upsertSeasonBundlesBatch,
  type SeasonBundlesMap,
} from "@/lib/cms/season-bundles";
import { getTeamCrestsBundle, type TeamCrestsBundle } from "@/lib/cms/team-crests-bundle";
import type { CanteraSquadImport } from "@/types/cantera-squad-import";

export async function saveCanteraBundlesAndCrests(
  seasonId: CompetitionSeasonId,
  scope: CanteraCmsScope,
  bundles: SeasonBundlesMap,
  squad: CanteraSquadImport,
  fixtures: FilialFixturesBundle,
  config: FilialCompetitionConfigBundle,
  crestOverrides: Record<string, string>,
): Promise<{ ok: boolean; error?: string }> {
  const batchResult = await upsertSeasonBundlesBatch(seasonId, [
    { scope, bundleKey: "squad", payload: squad },
    { scope, bundleKey: "fixtures", payload: fixtures },
    { scope, bundleKey: "competition_config", payload: config },
  ]);
  if (!batchResult.ok) return batchResult;

  const crestsFromBundle = getTeamCrestsBundle(bundles).crests;
  const remappedCrests = { ...crestsFromBundle, ...crestOverrides };

  const crestResult = await upsertSeasonBundle(seasonId, "global", "team_crests", {
    crests: remappedCrests,
  } satisfies TeamCrestsBundle);
  if (!crestResult.ok) return crestResult;

  return { ok: true };
}

/** Crest paths assigned to teams in a cantera competition config. */
export function getCanteraTeamCrests(
  bundles: SeasonBundlesMap,
  scope: CanteraCmsScope,
): Record<string, string> {
  const configPayload = bundles[bundleMapKey(scope, "competition_config")] as
    | FilialCompetitionConfigBundle
    | undefined;
  const teamIds = new Set((configPayload?.teams ?? []).map((team) => team.id));
  const crests = getTeamCrestsBundle(bundles).crests;
  const result: Record<string, string> = {};
  for (const teamId of teamIds) {
    const path = crests[teamId];
    if (path) result[teamId] = path;
  }
  return result;
}
