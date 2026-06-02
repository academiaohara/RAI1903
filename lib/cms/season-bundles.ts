import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { MatchArticle } from "@/types";
import type { Match, Matchday } from "@/types";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { TransferKind, TransferMarketWindowId } from "@/types";
import type { SquadClubInfo, SquadPlayer } from "@/types/squad";

export type SeasonBundleScope = PrimerEquipoGender | "global";

export type SeasonBundleKey =
  | "fixtures"
  | "squad"
  | "match_articles"
  | "competition_labels"
  | "team_crests"
  | "stadium_photos"
  | "transfers";

/** Movimiento oficial del mercado (carrusel de inicio). */
export type CmsTransferEntry = {
  id: string;
  playerId: string;
  kind: TransferKind;
  date: string;
  marketWindowId?: TransferMarketWindowId;
  originClub?: string;
  analysis?: string;
  /** URL al comunicado oficial del club. */
  clubAnnouncement?: string;
  clubAnnouncementTitle?: string;
  clubAnnouncementExcerpt?: string;
  clubAnnouncementImageUrl?: string;
  clubAnnouncementDate?: string;
  clubAnnouncementNewsId?: string;
};

export type SeasonTransfersBundle = {
  entries: CmsTransferEntry[];
};

export type SeasonFixturesBundle = {
  matchdays: Matchday[];
  matchdaysGrupo2?: Matchday[];
  amistosoMatches?: Match[];
  copaDelReyMatches?: Match[];
  meta?: {
    lastRound?: number;
    definitiveQualifyingLeagueRound?: number;
  };
};

export type SeasonFemeninoFixturesBundle = {
  matchdaysFemenino: Matchday[];
  meta?: { lastRound?: number };
};

export type SeasonSquadBundle = {
  players: SquadPlayer[];
  clubInfo?: Partial<SquadClubInfo>;
};

export type SeasonMatchArticlesBundle = {
  articles: MatchArticle[];
};

export type SeasonCompetitionLabelsBundle = Record<string, string>;

export type SeasonBundlesMap = Partial<
  Record<`${SeasonBundleScope}:${SeasonBundleKey}`, unknown>
>;

type BundleRow = {
  season_id: string;
  scope: string;
  bundle_key: string;
  payload: unknown;
};

function bundleMapKey(scope: SeasonBundleScope, bundleKey: SeasonBundleKey) {
  return `${scope}:${bundleKey}` as const;
}

function rowsToMap(rows: BundleRow[]): SeasonBundlesMap {
  const map: SeasonBundlesMap = {};
  for (const row of rows) {
    map[`${row.scope}:${row.bundle_key}` as keyof SeasonBundlesMap] = row.payload;
  }
  return map;
}

export async function fetchSeasonBundles(seasonId: string): Promise<SeasonBundlesMap> {
  if (!isSupabaseConfigured()) return {};

  const supabase = createClient();
  const { data, error } = await supabase
    .from("cms_season_bundles")
    .select("season_id, scope, bundle_key, payload")
    .eq("season_id", seasonId);

  if (error || !data?.length) return {};
  return rowsToMap(data as BundleRow[]);
}

export async function upsertSeasonBundle(
  seasonId: string,
  scope: SeasonBundleScope,
  bundleKey: SeasonBundleKey,
  payload: unknown,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const supabase = createClient();
  const { error } = await supabase.from("cms_season_bundles").upsert({
    season_id: seasonId,
    scope,
    bundle_key: bundleKey,
    payload,
    updated_at: new Date().toISOString(),
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function upsertSeasonBundlesBatch(
  seasonId: string,
  entries: Array<{ scope: SeasonBundleScope; bundleKey: SeasonBundleKey; payload: unknown }>,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const supabase = createClient();
  const rows = entries.map((entry) => ({
    season_id: seasonId,
    scope: entry.scope,
    bundle_key: entry.bundleKey,
    payload: entry.payload,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("cms_season_bundles").upsert(rows);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function copySeasonBundles(
  fromSeasonId: string,
  toSeasonId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("cms_season_bundles")
    .select("scope, bundle_key, payload")
    .eq("season_id", fromSeasonId);

  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: true };

  const rows = data.map((row) => ({
    season_id: toSeasonId,
    scope: row.scope as string,
    bundle_key: row.bundle_key as string,
    payload: row.payload,
    updated_at: new Date().toISOString(),
  }));

  const { error: upsertError } = await supabase.from("cms_season_bundles").upsert(rows);
  if (upsertError) return { ok: false, error: upsertError.message };
  return { ok: true };
}

export function getFixturesBundle(
  map: SeasonBundlesMap,
  gender: PrimerEquipoGender,
): SeasonFixturesBundle | SeasonFemeninoFixturesBundle | null {
  const payload = map[bundleMapKey(gender, "fixtures")];
  return (payload as SeasonFixturesBundle | SeasonFemeninoFixturesBundle | undefined) ?? null;
}

export function getSquadBundle(map: SeasonBundlesMap, gender: PrimerEquipoGender): SeasonSquadBundle | null {
  const payload = map[bundleMapKey(gender, "squad")];
  return (payload as SeasonSquadBundle | undefined) ?? null;
}

export function getMatchArticlesBundle(map: SeasonBundlesMap): SeasonMatchArticlesBundle | null {
  const payload = map[bundleMapKey("global", "match_articles")];
  return (payload as SeasonMatchArticlesBundle | undefined) ?? null;
}

export function getTransfersBundle(map: SeasonBundlesMap): SeasonTransfersBundle | null {
  const payload = map[bundleMapKey("global", "transfers")];
  return (payload as SeasonTransfersBundle | undefined) ?? null;
}
