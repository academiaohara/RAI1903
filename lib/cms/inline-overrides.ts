import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { isMissingSeasonIdColumnError } from "@/lib/cms/inline-overrides-compat";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { DEFAULT_COMPETITION_SEASON_ID } from "@/data/mock";

export type InlineOverridesMap = Record<string, unknown>;

type InlineOverrideRow = {
  key: string;
  value: unknown;
};

function rowsToMap(data: InlineOverrideRow[]): InlineOverridesMap {
  const map: InlineOverridesMap = {};
  for (const row of data) {
    map[row.key] = row.value;
  }
  return map;
}

export async function fetchInlineOverrides(seasonId = DEFAULT_COMPETITION_SEASON_ID): Promise<{
  overrides: InlineOverridesMap;
  error?: string;
}> {
  if (!isSupabaseConfigured()) return { overrides: {} };

  const supabase = createBrowserClient();
  let { data, error } = await supabase
    .from("cms_inline_overrides")
    .select("key, value")
    .eq("season_id", seasonId);

  if (error && isMissingSeasonIdColumnError(error.message)) {
    const legacy = await supabase.from("cms_inline_overrides").select("key, value");
    data = legacy.data;
    error = legacy.error;
  }

  if (error) {
    return {
      overrides: {},
      error: `${error.message} — Ejecuta supabase/APPLY_CMS_MIGRATIONS.sql en el SQL Editor de Supabase.`,
    };
  }
  if (!data?.length) return { overrides: {} };

  return { overrides: rowsToMap(data as InlineOverrideRow[]) };
}

export async function upsertInlineOverride(
  key: string,
  value: unknown,
  userId?: string | null,
  seasonId = DEFAULT_COMPETITION_SEASON_ID,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const supabase = createBrowserClient();
  const row = {
    season_id: seasonId,
    key,
    value,
    updated_at: new Date().toISOString(),
    updated_by: userId ?? null,
  };

  let { error } = await supabase.from("cms_inline_overrides").upsert(row);

  if (error && isMissingSeasonIdColumnError(error.message)) {
    const legacy = await supabase.from("cms_inline_overrides").upsert({
      key,
      value,
      updated_at: row.updated_at,
      updated_by: row.updated_by,
    });
    error = legacy.error;
  }

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteInlineOverride(
  key: string,
  seasonId = DEFAULT_COMPETITION_SEASON_ID,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const supabase = createBrowserClient();
  const { error } = await supabase
    .from("cms_inline_overrides")
    .delete()
    .eq("season_id", seasonId)
    .eq("key", key);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function clearInlineOverrides(seasonId = DEFAULT_COMPETITION_SEASON_ID): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const supabase = createBrowserClient();
  const { error } = await supabase.from("cms_inline_overrides").delete().eq("season_id", seasonId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function upsertInlineOverridesBatch(
  entries: InlineOverridesMap,
  userId?: string | null,
  seasonId = DEFAULT_COMPETITION_SEASON_ID,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const keys = Object.keys(entries);
  if (!keys.length) return { ok: true };

  const supabase = createBrowserClient();
  const now = new Date().toISOString();
  const rows = keys.map((key) => ({
    season_id: seasonId,
    key,
    value: entries[key],
    updated_at: now,
    updated_by: userId ?? null,
  }));

  const { error } = await supabase.from("cms_inline_overrides").upsert(rows);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function copyInlineOverrides(
  fromSeasonId: string,
  toSeasonId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("cms_inline_overrides")
    .select("key, value, updated_by")
    .eq("season_id", fromSeasonId);

  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: true };

  const now = new Date().toISOString();
  const rows = data.map((row) => ({
    season_id: toSeasonId,
    key: row.key,
    value: row.value,
    updated_at: now,
    updated_by: row.updated_by,
  }));

  const { error: upsertError } = await supabase.from("cms_inline_overrides").upsert(rows);
  if (upsertError) return { ok: false, error: upsertError.message };
  return { ok: true };
}
