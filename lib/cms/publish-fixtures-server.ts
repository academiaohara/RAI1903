import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchInlineOverridesWithClient } from "@/lib/cms/inline-overrides-server";
import { fetchSeasonBundlesWithClient } from "@/lib/cms/fetch-season-bundles-server";
import { mergeFixtureBundleWithOverrides } from "@/lib/cms/publish-fixture-overrides";
import type { SeasonBundleScope } from "@/lib/cms/season-bundles";
import type { CompetitionSeasonId } from "@/data/mock";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

export async function publishFixturesBundleFromOverrides(
  supabase: SupabaseClient,
  seasonId: CompetitionSeasonId,
  gender: PrimerEquipoGender,
): Promise<{ ok: boolean; error?: string; matchdaysUpdated?: number }> {
  const [bundles, overrides] = await Promise.all([
    fetchSeasonBundlesWithClient(supabase, seasonId),
    fetchInlineOverridesWithClient(supabase, seasonId),
  ]);

  const merged = mergeFixtureBundleWithOverrides(bundles, overrides, gender);
  if (!merged) {
    return { ok: false, error: "No hay bundle de calendario (fixtures) para esta temporada." };
  }

  const scope: SeasonBundleScope = gender;
  const result = await upsertSeasonBundleWithClient(supabase, seasonId, scope, "fixtures", merged);
  if (!result.ok) return result;

  const matchdaysUpdated =
    gender === "femenino"
      ? (merged as { matchdaysFemenino?: unknown[] }).matchdaysFemenino?.length ?? 0
      : (merged as { matchdays?: unknown[] }).matchdays?.length ?? 0;

  return { ok: true, matchdaysUpdated };
}

async function upsertSeasonBundleWithClient(
  supabase: SupabaseClient,
  seasonId: string,
  scope: SeasonBundleScope,
  bundleKey: "fixtures",
  payload: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("cms_season_bundles").upsert(
    {
      season_id: seasonId,
      scope,
      bundle_key: bundleKey,
      payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "season_id,scope,bundle_key" },
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
