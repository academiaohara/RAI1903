import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type InlineOverridesMap = Record<string, unknown>;

type InlineOverrideRow = {
  key: string;
  value: unknown;
};

export async function fetchInlineOverrides(): Promise<InlineOverridesMap> {
  if (!isSupabaseConfigured()) return {};

  const supabase = createClient();
  const { data, error } = await supabase.from("cms_inline_overrides").select("key, value");

  if (error || !data?.length) return {};

  const map: InlineOverridesMap = {};
  for (const row of data as InlineOverrideRow[]) {
    map[row.key] = row.value;
  }
  return map;
}

export async function upsertInlineOverride(
  key: string,
  value: unknown,
  userId?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const supabase = createClient();
  const { error } = await supabase.from("cms_inline_overrides").upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
    updated_by: userId ?? null,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteInlineOverride(key: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const supabase = createClient();
  const { error } = await supabase.from("cms_inline_overrides").delete().eq("key", key);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function clearInlineOverrides(): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const supabase = createClient();
  const { error } = await supabase.from("cms_inline_overrides").delete().neq("key", "");

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function upsertInlineOverridesBatch(
  entries: InlineOverridesMap,
  userId?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const keys = Object.keys(entries);
  if (!keys.length) return { ok: true };

  const supabase = createClient();
  const now = new Date().toISOString();
  const rows = keys.map((key) => ({
    key,
    value: entries[key],
    updated_at: now,
    updated_by: userId ?? null,
  }));

  const { error } = await supabase.from("cms_inline_overrides").upsert(rows);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
