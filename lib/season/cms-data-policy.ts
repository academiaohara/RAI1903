import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";

/** Con Supabase configurado, los datos de competición viven en el CMS (no en mock.ts). */
export function shouldUseMockCompetitionFallback(): boolean {
  return !isSupabaseConfigured();
}

export function seasonHasCompetitionBundles(bundles: SeasonBundlesMap): boolean {
  const keys = Object.keys(bundles);
  return keys.some(
    (key) =>
      key.endsWith(":fixtures") ||
      key.endsWith(":squad") ||
      key === "global:match_articles" ||
      key === "global:transfers",
  );
}
