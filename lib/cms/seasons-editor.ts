import { createClient } from "@/lib/supabase/client";
import { normalizeSinglePrincipalSeason } from "@/lib/cms/season-normalize";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { copyInlineOverrides } from "@/lib/cms/inline-overrides";
import { copySeasonBundles } from "@/lib/cms/season-bundles";
import type { CmsSeason } from "@/lib/cms/seasons";
import { seedSeasonFromRepo } from "@/lib/cms/seed-season-from-repo";

export type SeasonEditorInput = {
  id: string;
  label: string;
  published?: boolean;
  sortOrder?: number;
};

export async function fetchEditorSeasons(): Promise<CmsSeason[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("cms_seasons")
    .select("id, label, is_default, sort_order, published")
    .order("sort_order", { ascending: true });

  if (error || !data?.length) return [];

  return normalizeSinglePrincipalSeason(
    data.map((row) => ({
      id: row.id,
      label: row.label,
      isDefault: row.is_default,
      sortOrder: row.sort_order,
      published: row.published,
    })),
  );
}

export async function createSeason(input: SeasonEditorInput): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const supabase = createClient();
  const { error } = await supabase.from("cms_seasons").insert({
    id: input.id,
    label: input.label,
    is_default: false,
    sort_order: input.sortOrder ?? 99,
    published: input.published ?? false,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateSeason(
  id: string,
  patch: Partial<Pick<SeasonEditorInput, "label" | "published" | "sortOrder">>,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("cms_seasons")
    .update({
      ...(patch.label !== undefined ? { label: patch.label } : {}),
      ...(patch.published !== undefined ? { published: patch.published } : {}),
      ...(patch.sortOrder !== undefined ? { sort_order: patch.sortOrder } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteSeason(seasonId: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const supabase = createClient();
  const { data: row, error: fetchError } = await supabase
    .from("cms_seasons")
    .select("is_default")
    .eq("id", seasonId)
    .maybeSingle();

  if (fetchError) return { ok: false, error: fetchError.message };
  if (!row) return { ok: false, error: "Temporada no encontrada" };
  if (row.is_default) {
    return {
      ok: false,
      error: "No puedes borrar la temporada principal. Activa otra antes.",
    };
  }

  const { error } = await supabase.from("cms_seasons").delete().eq("id", seasonId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function setDefaultSeason(seasonId: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const supabase = createClient();
  const { error: clearError } = await supabase
    .from("cms_seasons")
    .update({ is_default: false, updated_at: new Date().toISOString() })
    .eq("is_default", true);

  if (clearError) return { ok: false, error: clearError.message };

  const { error } = await supabase
    .from("cms_seasons")
    .update({ is_default: true, published: true, updated_at: new Date().toISOString() })
    .eq("id", seasonId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function duplicateSeason(
  fromSeasonId: string,
  toSeason: SeasonEditorInput,
): Promise<{ ok: boolean; error?: string }> {
  const created = await createSeason(toSeason);
  if (!created.ok) return created;

  const bundles = await copySeasonBundles(fromSeasonId, toSeason.id);
  if (!bundles.ok) return bundles;

  const players = await copySeasonPlayers(fromSeasonId, toSeason.id);
  if (!players.ok) return players;

  const overrides = await copyInlineOverrides(fromSeasonId, toSeason.id);
  if (!overrides.ok) return overrides;

  return { ok: true };
}

export async function seedSeasonFromMock(
  seasonId: string,
  seasonLabel: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const supabase = createClient();
  return seedSeasonFromRepo(supabase, seasonId, seasonLabel);
}

async function copySeasonPlayers(
  fromSeasonId: string,
  toSeasonId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("cms_players")
    .select("id, squad, payload, published")
    .eq("season_id", fromSeasonId);

  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: true };

  const rows = data.map((row) => ({
    id: row.id,
    season_id: toSeasonId,
    squad: row.squad,
    payload: row.payload,
    published: row.published,
    updated_at: new Date().toISOString(),
  }));

  const { error: upsertError } = await supabase.from("cms_players").upsert(rows);
  if (upsertError) return { ok: false, error: upsertError.message };
  return { ok: true };
}
