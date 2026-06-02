import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { SquadPlayer } from "@/types/squad";

export async function fetchSquadPlayersFromCms(
  gender: PrimerEquipoGender,
  seasonId: string,
): Promise<SquadPlayer[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("cms_players")
    .select("id, payload, published")
    .eq("season_id", seasonId)
    .eq("squad", gender)
    .eq("published", true);

  if (error || !data?.length) {
    return [];
  }

  return data.map((row) => row.payload as SquadPlayer);
}

export async function upsertSquadPlayer(
  gender: PrimerEquipoGender,
  seasonId: string,
  player: SquadPlayer,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const supabase = createClient();
  const { error } = await supabase.from("cms_players").upsert({
    id: player.id,
    season_id: seasonId,
    squad: gender,
    payload: player,
    published: true,
    updated_at: new Date().toISOString(),
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function upsertSquadPlayersBatch(
  gender: PrimerEquipoGender,
  seasonId: string,
  players: SquadPlayer[],
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  if (!players.length) return { ok: true };

  const supabase = createClient();
  const now = new Date().toISOString();
  const rows = players.map((player) => ({
    id: player.id,
    season_id: seasonId,
    squad: gender,
    payload: player,
    published: true,
    updated_at: now,
  }));

  const { error } = await supabase.from("cms_players").upsert(rows);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteSquadPlayer(
  gender: PrimerEquipoGender,
  seasonId: string,
  playerId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no configurado" };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("cms_players")
    .delete()
    .eq("id", playerId)
    .eq("season_id", seasonId)
    .eq("squad", gender);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
