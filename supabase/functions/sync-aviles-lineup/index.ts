import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { apiFootballGet } from "../_shared/api-football.ts";
import { getAvilesTeamId } from "../_shared/env.ts";
import { getAdminClient, logSync } from "../_shared/supabase-admin.ts";

const JOB = "sync-aviles-lineup";
const WINDOW_BEFORE_MS = 2 * 60 * 60 * 1000;
const MATCH_DURATION_MS = 2.5 * 60 * 60 * 1000;

type ApiLineup = {
  team: { id: number };
  formation: string | null;
  coach: { name: string | null };
  startXI: Array<{ player: { id: number; name: string; number: number; pos: string | null } }>;
  substitutes: Array<{ player: { id: number; name: string; number: number; pos: string | null } }>;
};

function teamSide(homeTeamId: number, awayTeamId: number, eventTeamId: number): "home" | "away" {
  if (eventTeamId === homeTeamId) return "home";
  if (eventTeamId === awayTeamId) return "away";
  return "home";
}

serve(async (_req) => {
  let logId: number | undefined;
  try {
    logId = await logSync(JOB, "started");

    getAvilesTeamId();
    const supabase = getAdminClient();
    const now = Date.now();

    const dayStart = new Date();
    dayStart.setUTCHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

    const { data: todayMatches, error } = await supabase
      .from("matches")
      .select("api_football_fixture_id, kickoff_at, home_team_id, away_team_id, status_short")
      .eq("is_aviles_match", true)
      .gte("kickoff_at", dayStart.toISOString())
      .lt("kickoff_at", dayEnd.toISOString());

    if (error) throw error;

    const inWindow = (todayMatches ?? []).filter((m) => {
      const kickoff = new Date(m.kickoff_at).getTime();
      const matchEnd = kickoff + MATCH_DURATION_MS;
      const windowStart = kickoff - WINDOW_BEFORE_MS;
      return now >= windowStart && now <= matchEnd;
    });

    if (inWindow.length === 0) {
      const body = { ok: true, skipped: true, reason: "no_aviles_match_in_lineup_window" };
      await logSync(JOB, "success", body.reason, body, logId);
      return new Response(JSON.stringify(body), { headers: { "Content-Type": "application/json" } });
    }

    let synced = 0;
    for (const match of inWindow) {
      const fixtureId = match.api_football_fixture_id;
      const lineupsRaw = await apiFootballGet<ApiLineup>("/fixtures/lineups", { fixture: fixtureId });
      if (lineupsRaw.length === 0) continue;

      await supabase.from("lineups").delete().eq("fixture_id", fixtureId);

      const lineupRows = lineupsRaw.map((lu) => {
        const side = teamSide(match.home_team_id, match.away_team_id, lu.team.id);
        const mapPlayer = (entry: { player: { id: number; name: string; number: number; pos: string | null } }) => ({
          id: entry.player.id,
          name: entry.player.name,
          number: entry.player.number,
          pos: entry.player.pos,
        });
        return {
          fixture_id: fixtureId,
          team_side: side,
          formation: lu.formation,
          coach_name: lu.coach?.name,
          starters: lu.startXI.map(mapPlayer),
          substitutes: lu.substitutes.map(mapPlayer),
          updated_at: new Date().toISOString(),
        };
      });

      const { error: insertError } = await supabase.from("lineups").insert(lineupRows);
      if (insertError) throw insertError;

      await supabase
        .from("matches")
        .update({ lineup_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("api_football_fixture_id", fixtureId);

      synced += 1;
    }

    const body = { ok: true, matchesInWindow: inWindow.length, synced };
    await logSync(JOB, "success", `Lineups synced for ${synced} matches`, body, logId);

    return new Response(JSON.stringify(body), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (logId) await logSync(JOB, "error", message, {}, logId).catch(() => {});
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
