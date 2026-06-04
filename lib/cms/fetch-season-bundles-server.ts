import type { SupabaseClient } from "@supabase/supabase-js";
import type { SeasonBundleKey, SeasonBundlesMap, SeasonBundleScope } from "@/lib/cms/season-bundles";

type BundleRow = {
  season_id: string;
  scope: string;
  bundle_key: string;
  payload: unknown;
};

export async function fetchSeasonBundlesWithClient(
  supabase: SupabaseClient,
  seasonId: string,
): Promise<SeasonBundlesMap> {
  const { data, error } = await supabase
    .from("cms_season_bundles")
    .select("season_id, scope, bundle_key, payload")
    .eq("season_id", seasonId);

  if (error || !data?.length) return {};

  const map: SeasonBundlesMap = {};
  for (const row of data as BundleRow[]) {
    const key = `${row.scope}:${row.bundle_key}` as `${SeasonBundleScope}:${SeasonBundleKey}`;
    map[key] = row.payload;
  }
  return map;
}
