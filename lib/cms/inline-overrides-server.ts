import { DEFAULT_COMPETITION_SEASON_ID } from "@/data/mock";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { InlineOverridesMap } from "@/lib/cms/inline-overrides";

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

/** Carga overrides en el servidor (visitantes ven el CMS sin esperar al cliente). */
export async function fetchInlineOverridesServer(
  seasonId = DEFAULT_COMPETITION_SEASON_ID,
): Promise<InlineOverridesMap> {
  if (!isSupabaseConfigured()) return {};

  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("cms_inline_overrides")
      .select("key, value")
      .eq("season_id", seasonId);

    if (error || !data?.length) return {};
    return rowsToMap(data as InlineOverrideRow[]);
  } catch {
    return {};
  }
}
