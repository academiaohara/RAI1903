import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { apiFootballGet } from "../_shared/api-football.ts";
import { getAvilesTeamId, getSeason } from "../_shared/env.ts";
import { type FixtureRow, mapFixtureToMatch, mapTeamUpsert } from "../_shared/mappers.ts";
import { getAdminClient, logSync, setSyncConfig } from "../_shared/supabase-admin.ts";

const JOB = "sync-season-fixtures";

serve(async (_req) => {
  let logId: number | undefined;
  try {
    logId = await logSync(JOB, "started");

    const avilesTeamId = getAvilesTeamId();
    const season = getSeason();
    const fixtures = await apiFootballGet<FixtureRow>("/fixtures", {
      team: avilesTeamId,
      season,
    });

    const supabase = getAdminClient();
    const teamMap = new Map<number, ReturnType<typeof mapTeamUpsert>>();

    for (const row of fixtures) {
      teamMap.set(row.teams.home.id, mapTeamUpsert(row.teams.home));
      teamMap.set(row.teams.away.id, mapTeamUpsert(row.teams.away));
    }

    if (teamMap.size > 0) {
      const { error: teamsError } = await supabase.from("teams").upsert([...teamMap.values()], {
        onConflict: "api_football_id",
      });
      if (teamsError) throw teamsError;
    }

    const matchRows = fixtures.map((row) => mapFixtureToMatch(row, avilesTeamId));
    if (matchRows.length > 0) {
      const { error: matchesError } = await supabase.from("matches").upsert(matchRows, {
        onConflict: "api_football_fixture_id",
        ignoreDuplicates: false,
      });
      if (matchesError) throw matchesError;

      const primaryLeague = matchRows.find((m) => m.is_aviles_match)?.league_id;
      if (primaryLeague) {
        await setSyncConfig("primary_league_id", String(primaryLeague));
        await setSyncConfig("primary_season", String(season));
      }
    }

    const body = {
      ok: true,
      season,
      teamId: avilesTeamId,
      fixtures: fixtures.length,
      teams: teamMap.size,
    };

    await logSync(JOB, "success", `Synced ${fixtures.length} fixtures`, body, logId);

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
