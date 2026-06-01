import type { SupabaseClient } from "@supabase/supabase-js";
import type { SeasonBundleKey, SeasonBundleScope } from "@/lib/cms/season-bundles";
import { buildMockSeasonBundleEntries } from "@/lib/season/build-mock-bundles";
import { getSquadPlayers } from "@/lib/squad-data";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

/** Convierte `2025-26` → `25/26`. */
export function seasonIdToLabel(seasonId: string): string {
  const [start, end] = seasonId.split("-");
  if (!start || !end) return seasonId;
  return `${start.slice(-2)}/${end}`;
}

export async function seedSeasonFromRepo(
  supabase: SupabaseClient,
  seasonId: string,
  seasonLabel = seasonIdToLabel(seasonId),
): Promise<{ ok: boolean; error?: string }> {
  const now = new Date().toISOString();

  const { error: seasonError } = await supabase.from("cms_seasons").upsert({
    id: seasonId,
    label: seasonLabel,
    is_default: seasonId === "2025-26",
    sort_order: seasonId === "2025-26" ? 0 : 99,
    published: true,
    updated_at: now,
  });

  if (seasonError) return { ok: false, error: seasonError.message };

  const entries = buildMockSeasonBundleEntries(seasonLabel);
  const bundleRows = entries.map((entry) => ({
    season_id: seasonId,
    scope: entry.scope as SeasonBundleScope,
    bundle_key: entry.bundleKey as SeasonBundleKey,
    payload: entry.payload,
    updated_at: now,
  }));

  const { error: bundleError } = await supabase.from("cms_season_bundles").upsert(bundleRows);
  if (bundleError) return { ok: false, error: bundleError.message };

  const genders: PrimerEquipoGender[] = ["masculino", "femenino"];
  for (const gender of genders) {
    const players = getSquadPlayers(gender);
    if (!players.length) continue;

    const playerRows = players.map((player) => ({
      id: player.id,
      season_id: seasonId,
      squad: gender,
      payload: player,
      published: true,
      updated_at: now,
    }));

    const { error: playerError } = await supabase.from("cms_players").upsert(playerRows);
    if (playerError) return { ok: false, error: playerError.message };
  }

  return { ok: true };
}
