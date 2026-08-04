import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_COMPETITION_SEASON_ID } from "@/data/mock";
import type { InlineOverridesMap } from "@/lib/cms/inline-overrides";
import { isHomeGlobalInlineKey } from "@/lib/cms/inline-overrides";
import { isMissingSeasonIdColumnError } from "@/lib/cms/inline-overrides-compat";
import { CLUB_X_POSTS_STORAGE_KEY } from "@/lib/club-x-posts";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isMediaRaiGlobalInlineKey } from "@/lib/fan-videos";
import { HOME_SECTION_ORDER_KEY } from "@/lib/home-layout";

const HOME_GLOBAL_INLINE_KEYS = [CLUB_X_POSTS_STORAGE_KEY, HOME_SECTION_ORDER_KEY] as const;

type InlineOverrideRow = { key: string; value: unknown };

function rowsToMap(data: InlineOverrideRow[]): InlineOverridesMap {
  const map: InlineOverridesMap = {};
  for (const row of data) {
    map[row.key] = row.value;
  }
  return map;
}

async function fetchInlineOverridesFromTable(
  supabase: SupabaseClient,
  seasonId: string,
): Promise<InlineOverridesMap> {
  let { data, error } = await supabase
    .from("cms_inline_overrides")
    .select("key, value")
    .eq("season_id", seasonId);

  if (error && isMissingSeasonIdColumnError(error.message)) {
    const legacy = await supabase.from("cms_inline_overrides").select("key, value");
    data = legacy.data;
    error = legacy.error;
  }

  if (error || !data?.length) return {};
  return rowsToMap(data as InlineOverrideRow[]);
}

/** Carga overrides en el servidor (visitantes ven el CMS sin esperar al cliente). */
export async function fetchInlineOverridesServer(
  seasonId = DEFAULT_COMPETITION_SEASON_ID,
): Promise<InlineOverridesMap> {
  if (!isSupabaseConfigured()) return {};

  try {
    const supabase = await createServerClient();
    return fetchInlineOverridesFromTable(supabase, seasonId);
  } catch {
    return {};
  }
}

type InlineOverrideSeasonRow = { key: string; value: unknown; updated_at?: string };

/** Overrides globales de Media RAI (secciones, vídeos) para el primer render del servidor. */
export async function fetchMediaRaiInlineOverridesServer(): Promise<InlineOverridesMap> {
  if (!isSupabaseConfigured()) return {};

  try {
    const supabase = await createServerClient();
    let { data, error } = await supabase
      .from("cms_inline_overrides")
      .select("key, value, updated_at")
      .or("key.like.media-rai:%,key.like.contenido-fan:%");

    if (error && isMissingSeasonIdColumnError(error.message)) {
      const legacy = await supabase.from("cms_inline_overrides").select("key, value");
      data = legacy.data?.map((row) => ({ ...row, updated_at: undefined })) ?? null;
      error = legacy.error;
    }

    if (error || !data?.length) return {};

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

    return rowsToMap([...latestByKey.values()]);
  } catch {
    return {};
  }
}

/** Overrides globales de inicio (orden de secciones, tweets del club) para el primer render del servidor. */
export async function fetchHomeGlobalInlineOverridesServer(): Promise<InlineOverridesMap> {
  if (!isSupabaseConfigured()) return {};

  try {
    const supabase = await createServerClient();
    let { data, error } = await supabase
      .from("cms_inline_overrides")
      .select("key, value, updated_at")
      .in("key", [...HOME_GLOBAL_INLINE_KEYS]);

    if (error && isMissingSeasonIdColumnError(error.message)) {
      const legacy = await supabase
        .from("cms_inline_overrides")
        .select("key, value")
        .in("key", [...HOME_GLOBAL_INLINE_KEYS]);
      data = legacy.data?.map((row) => ({ ...row, updated_at: undefined })) ?? null;
      error = legacy.error;
    }

    if (error || !data?.length) return {};

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

    return rowsToMap([...latestByKey.values()]);
  } catch {
    return {};
  }
}

export async function fetchInlineOverridesWithClient(
  supabase: SupabaseClient,
  seasonId: string,
): Promise<InlineOverridesMap> {
  return fetchInlineOverridesFromTable(supabase, seasonId);
}
