import { players, playersFemenino } from "@/data/mock";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Player } from "@/types";
import type { PrimerEquipoGender } from "@/types";

export async function fetchSquadPlayers(gender: PrimerEquipoGender, seasonId = "2025-26"): Promise<Player[]> {
  const mock = gender === "femenino" ? playersFemenino : players;

  if (!isSupabaseConfigured()) {
    return mock;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("cms_players")
    .select("id, payload, published")
    .eq("season_id", seasonId)
    .eq("squad", gender)
    .eq("published", true);

  if (error || !data?.length) {
    return mock;
  }

  const cmsPlayers = data.map((row) => row.payload as Player);
  const cmsIds = new Set(cmsPlayers.map((p) => p.id));
  const mockOnly = mock.filter((p) => !cmsIds.has(p.id));
  return [...cmsPlayers, ...mockOnly];
}

export function playerPayload(player: Player): Player {
  return player;
}
