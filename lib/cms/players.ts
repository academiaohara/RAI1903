import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Player } from "@/types";
import type { PrimerEquipoGender } from "@/types";

export async function fetchSquadPlayers(gender: PrimerEquipoGender, seasonId = "2025-26"): Promise<Player[]> {
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

  return data.map((row) => row.payload as Player);
}

export function playerPayload(player: Player): Player {
  return player;
}
