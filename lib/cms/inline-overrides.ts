import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { isMissingSeasonIdColumnError } from "@/lib/cms/inline-overrides-compat";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { DEFAULT_COMPETITION_SEASON_ID } from "@/data/mock";
import { shouldCopyInlineOverrideKey } from "@/lib/fixture-inline-keys";
import { CLUB_X_POSTS_STORAGE_KEY } from "@/lib/club-x-posts";
import { isMediaRaiGlobalInlineKey, MEDIA_RAI_INLINE_SEASON_ID } from "@/lib/fan-videos";
import { HOME_SECTION_ORDER_KEY } from "@/lib/home-layout";

const HOME_GLOBAL_INLINE_KEYS = [CLUB_X_POSTS_STORAGE_KEY, HOME_SECTION_ORDER_KEY] as const;

export function isHomeGlobalInlineKey(key: string): boolean {
  return (HOME_GLOBAL_INLINE_KEYS as readonly string[]).includes(key);
}

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

type InlineOverrideSeasonRow = InlineOverrideRow & {
  season_id?: string;
  updated_at?: string;
};

/** Overrides de Media RAI guardados en cualquier temporada (vídeos y secciones globales). */
export async function fetchMediaRaiInlineOverrides(): Promise<{
  overrides: InlineOverridesMap;
  error?: string;
}> {
  if (!isSupabaseConfigured()) return { overrides: {} };

  const supabase = createBrowserClient();
  let { data, error } = await supabase
    .from("cms_inline_overrides")
    .select("season_id, key, value, updated_at")
    .or("key.like.media-rai:%,key.like.contenido-fan:%");

  if (error && isMissingSeasonIdColumnError(error.message)) {
    const legacy = await supabase.from("cms_inline_overrides").select("key, value");
    data = legacy.data?.map((row) => ({ ...row, season_id: MEDIA_RAI_INLINE_SEASON_ID, updated_at: undefined })) ?? null;
    error = legacy.error;
  }

  if (error) {
    return {
      overrides: {},
      error: `${error.message} — Ejecuta supabase/APPLY_CMS_MIGRATIONS.sql en el SQL Editor de Supabase.`,
    };
  }
  if (!data?.length) return { overrides: {} };

  const latestByKey = new Map<string, InlineOverrideSeasonRow>();
  for (const row of data as InlineOverrideSeasonRow[]) {
    if (!isMediaRaiGlobalInlineKey(row.key)) continue;

    const existing = latestByKey.get(row.key);
    if (!existing) {
      latestByKey.set(row.key, row);
      continue;
    }

    const existingTime = existing.updated_at ? Date.parse(existing.updated_at) : 0;
    const rowTime = row.updated_at ? Date.parse(row.updated_at) : 0;
    if (rowTime >= existingTime) {
      latestByKey.set(row.key, row);
    }
  }

  return { overrides: rowsToMap([...latestByKey.values()]) };
}

export function resolveInlineOverrideSeasonId(
  key: string,
  viewedSeasonId = DEFAULT_COMPETITION_SEASON_ID,
): string {
  if (isMediaRaiGlobalInlineKey(key) || isHomeGlobalInlineKey(key)) {
    return MEDIA_RAI_INLINE_SEASON_ID;
  }
  return viewedSeasonId;
}

/** Overrides globales de inicio (p. ej. tweets del club). */
export async function fetchHomeGlobalInlineOverrides(): Promise<{
  overrides: InlineOverridesMap;
  error?: string;
}> {
  if (!isSupabaseConfigured()) return { overrides: {} };

  const supabase = createBrowserClient();
  let { data, error } = await supabase
    .from("cms_inline_overrides")
    .select("season_id, key, value, updated_at")
    .in("key", [...HOME_GLOBAL_INLINE_KEYS]);

  if (error && isMissingSeasonIdColumnError(error.message)) {
    const legacy = await supabase
      .from("cms_inline_overrides")
      .select("key, value")
      .in("key", [...HOME_GLOBAL_INLINE_KEYS]);
    data =
      legacy.data?.map((row) => ({ ...row, season_id: MEDIA_RAI_INLINE_SEASON_ID, updated_at: undefined })) ?? null;
    error = legacy.error;
  }

  if (error) {
    return {
      overrides: {},
      error: `${error.message} — Ejecuta supabase/APPLY_CMS_MIGRATIONS.sql en el SQL Editor de Supabase.`,
    };
  }
  if (!data?.length) return { overrides: {} };

  const latestByKey = new Map<string, InlineOverrideSeasonRow>();
  for (const row of data as InlineOverrideSeasonRow[]) {
    if (!isHomeGlobalInlineKey(row.key)) continue;

    const existing = latestByKey.get(row.key);
    if (!existing) {
      latestByKey.set(row.key, row);
      continue;
    }

    const existingTime = existing.updated_at ? Date.parse(existing.updated_at) : 0;
    const rowTime = row.updated_at ? Date.parse(row.updated_at) : 0;
    if (rowTime >= existingTime) {
      latestByKey.set(row.key, row);
    }
  }

  return { overrides: rowsToMap([...latestByKey.values()]) };
}

export async function deleteClubXPostOverrides(): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("cms_inline_overrides")
    .select("season_id, key")
    .eq("key", CLUB_X_POSTS_STORAGE_KEY);

  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: true };

  const results = await Promise.all(
    data.map((row) =>
      supabase
        .from("cms_inline_overrides")
        .delete()
        .eq("season_id", row.season_id ?? MEDIA_RAI_INLINE_SEASON_ID)
        .eq("key", row.key),
    ),
  );

  const failed = results.find(({ error: deleteError }) => deleteError);
  if (failed?.error) return { ok: false, error: failed.error.message };
  return { ok: true };
}

export async function deleteMediaRaiSpaceOverrides(section: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const supabase = createBrowserClient();
  const globalKey = `media-rai:${section}:spaces`;

  const { data, error } = await supabase
    .from("cms_inline_overrides")
    .select("season_id, key")
    .eq("key", globalKey);

  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: true };

  const results = await Promise.all(
    data.map((row) =>
      supabase
        .from("cms_inline_overrides")
        .delete()
        .eq("season_id", row.season_id ?? MEDIA_RAI_INLINE_SEASON_ID)
        .eq("key", row.key),
    ),
  );

  const failed = results.find(({ error: deleteError }) => deleteError);
  if (failed?.error) return { ok: false, error: failed.error.message };
  return { ok: true };
}

export async function deleteMediaRaiVideoOverrides(section: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const supabase = createBrowserClient();
  const globalKey = `media-rai:${section}:videos`;

  const { data, error } = await supabase
    .from("cms_inline_overrides")
    .select("season_id, key")
    .or(`key.eq.${globalKey},key.like.contenido-fan:%:${section}:videos`);

  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: true };

  const targets = data.filter(
    (row) => row.key === globalKey || (row.key.endsWith(`:${section}:videos`) && !row.key.includes("primer-equipo")),
  );

  const results = await Promise.all(
    targets.map((row) =>
      supabase
        .from("cms_inline_overrides")
        .delete()
        .eq("season_id", row.season_id ?? MEDIA_RAI_INLINE_SEASON_ID)
        .eq("key", row.key),
    ),
  );

  const failed = results.find(({ error: deleteError }) => deleteError);
  if (failed?.error) return { ok: false, error: failed.error.message };
  return { ok: true };
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
  const rows = data
    .filter((row) => shouldCopyInlineOverrideKey(row.key))
    .map((row) => ({
      season_id: toSeasonId,
      key: row.key,
      value: row.value,
      updated_at: now,
      updated_by: row.updated_by,
    }));

  if (!rows.length) return { ok: true };

  const { error: upsertError } = await supabase.from("cms_inline_overrides").upsert(rows);
  if (upsertError) return { ok: false, error: upsertError.message };
  return { ok: true };
}
