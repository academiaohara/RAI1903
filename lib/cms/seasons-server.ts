import { DEFAULT_COMPETITION_SEASON_ID } from "@/data/mock";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function fetchDefaultSeasonIdServer(): Promise<string> {
  if (!isSupabaseConfigured()) return DEFAULT_COMPETITION_SEASON_ID;

  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("cms_seasons")
      .select("id")
      .eq("is_default", true)
      .maybeSingle();

    if (error || !data?.id) return DEFAULT_COMPETITION_SEASON_ID;
    return data.id;
  } catch {
    return DEFAULT_COMPETITION_SEASON_ID;
  }
}
