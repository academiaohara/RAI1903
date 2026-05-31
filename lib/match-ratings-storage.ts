import { getActiveSeasonId } from "@/lib/quiniela-storage";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

export type PlayerRatingAverage = {
  average: number;
  count: number;
};

export async function fetchUserMatchRatings(
  userId: string,
  matchId: string,
): Promise<Record<string, number>> {
  if (!isSupabaseConfigured()) return {};

  const supabase = createClient();
  const seasonId = getActiveSeasonId();

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

export async function fetchMatchRatingAverages(matchId: string): Promise<Record<string, PlayerRatingAverage>> {
  if (!isSupabaseConfigured()) return {};

  const supabase = createClient();
  const seasonId = getActiveSeasonId();

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
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const entries = Object.entries(params.ratings).filter(([, rating]) => Number.isFinite(rating));
  if (entries.length === 0) {
    return { ok: false, error: "No hay valoraciones para enviar" };
  }

  const supabase = createClient();
  const seasonId = getActiveSeasonId();
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
