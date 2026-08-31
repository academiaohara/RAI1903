import type { CompetitionSeasonId } from "@/data/mock";
import { isMatchRatingVotingOpen } from "@/lib/match-rating-voting";
import { loadSeasonId } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

export type PlayerRatingAverage = {
  average: number;
  count: number;
};

const LEGACY_PLAYER_RATINGS_KEY = "rai1903.player-ratings.v1";
const LEGACY_PLAYER_RATINGS_MIGRATED_KEY = "rai1903.player-ratings:migrated";

type LegacyRatingsStore = {
  matches: Record<string, Record<string, number>>;
};

function readLegacyPlayerRatingsStore(): LegacyRatingsStore {
  if (typeof window === "undefined") return { matches: {} };
  try {
    const raw = window.localStorage.getItem(LEGACY_PLAYER_RATINGS_KEY);
    if (!raw) return { matches: {} };
    const parsed = JSON.parse(raw) as LegacyRatingsStore;
    return parsed?.matches ? parsed : { matches: {} };
  } catch {
    return { matches: {} };
  }
}

/** Migra valoraciones guardadas en localStorage al usuario actual en Supabase. */
export async function migrateLegacyPlayerRatingsToSupabase(
  userId: string,
  gender: PrimerEquipoGender = "masculino",
): Promise<void> {
  if (!isSupabaseConfigured() || typeof window === "undefined") return;
  if (window.localStorage.getItem(LEGACY_PLAYER_RATINGS_MIGRATED_KEY) === userId) return;

  const legacy = readLegacyPlayerRatingsStore();
  const matchIds = Object.keys(legacy.matches);
  if (!matchIds.length) {
    window.localStorage.setItem(LEGACY_PLAYER_RATINGS_MIGRATED_KEY, userId);
    return;
  }

  for (const matchId of matchIds) {
    const ratings = legacy.matches[matchId];
    if (!ratings || !Object.keys(ratings).length) continue;
    await submitMatchRatings({ userId, matchId, gender, ratings, seasonId: loadSeasonId() });
  }

  window.localStorage.removeItem(LEGACY_PLAYER_RATINGS_KEY);
  window.localStorage.setItem(LEGACY_PLAYER_RATINGS_MIGRATED_KEY, userId);
}

export async function fetchUserMatchRatings(
  userId: string,
  matchId: string,
  seasonId: CompetitionSeasonId = loadSeasonId(),
): Promise<Record<string, number>> {
  if (!isSupabaseConfigured()) return {};

  const supabase = createClient();

  const { data, error } = await supabase
    .from("match_player_ratings")
    .select("player_id, rating")
    .eq("user_id", userId)
    .eq("match_id", matchId)
    .eq("season_id", seasonId);

  if (error || !data) return {};

  const ratings: Record<string, number> = {};
  for (const row of data) {
    ratings[row.player_id] = Number(row.rating);
  }
  return ratings;
}

export async function fetchMatchRatingAverages(
  matchId: string,
  seasonId: CompetitionSeasonId = loadSeasonId(),
): Promise<Record<string, PlayerRatingAverage>> {
  if (!isSupabaseConfigured()) return {};

  const supabase = createClient();

  const { data, error } = await supabase
    .from("match_player_ratings")
    .select("player_id, rating")
    .eq("match_id", matchId)
    .eq("season_id", seasonId);

  if (error || !data) return {};

  const buckets = new Map<string, number[]>();
  for (const row of data) {
    const list = buckets.get(row.player_id) ?? [];
    list.push(Number(row.rating));
    buckets.set(row.player_id, list);
  }

  const averages: Record<string, PlayerRatingAverage> = {};
  for (const [playerId, values] of buckets) {
    const sum = values.reduce((total, value) => total + value, 0);
    averages[playerId] = { average: sum / values.length, count: values.length };
  }
  return averages;
}

export async function submitMatchRatings(params: {
  userId: string;
  matchId: string;
  gender: PrimerEquipoGender;
  ratings: Record<string, number>;
  seasonId?: CompetitionSeasonId;
  /** Si se indica, se comprueba que la votación siga abierta (3 días tras el partido). */
  matchDate?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  if (params.matchDate && !isMatchRatingVotingOpen(params.matchDate)) {
    return { ok: false, error: "El plazo de votación de este partido ha finalizado." };
  }

  const entries = Object.entries(params.ratings).filter(([, rating]) => Number.isFinite(rating));
  if (entries.length === 0) {
    return { ok: false, error: "No hay valoraciones para enviar" };
  }

  const supabase = createClient();
  const seasonId = params.seasonId ?? loadSeasonId();
  const rows = entries.map(([playerId, rating]) => ({
    user_id: params.userId,
    match_id: params.matchId,
    player_id: playerId,
    season_id: seasonId,
    gender: params.gender,
    rating,
  }));

  const { error } = await supabase.from("match_player_ratings").upsert(rows, {
    onConflict: "user_id,match_id,player_id,season_id",
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function fetchSeasonPlayerRatingAverages(
  seasonId = loadSeasonId(),
): Promise<Record<string, PlayerRatingAverage>> {
  if (!isSupabaseConfigured()) return {};

  const supabase = createClient();
  const { data, error } = await supabase
    .from("match_player_ratings")
    .select("player_id, rating")
    .eq("season_id", seasonId);

  if (error || !data) return {};

  const buckets = new Map<string, number[]>();
  for (const row of data) {
    const list = buckets.get(row.player_id) ?? [];
    list.push(Number(row.rating));
    buckets.set(row.player_id, list);
  }

  const averages: Record<string, PlayerRatingAverage> = {};
  for (const [playerId, values] of buckets) {
    const sum = values.reduce((total, value) => total + value, 0);
    averages[playerId] = { average: sum / values.length, count: values.length };
  }
  return averages;
}

export async function fetchPlayerSeasonRatingAverage(
  playerId: string,
  seasonId = loadSeasonId(),
): Promise<PlayerRatingAverage | null> {
  const all = await fetchSeasonPlayerRatingAverages(seasonId);
  return all[playerId] ?? null;
}
