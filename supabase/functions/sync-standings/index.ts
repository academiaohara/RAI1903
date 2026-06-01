import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { apiFootballGet } from "../_shared/api-football.ts";
import { getSeason } from "../_shared/env.ts";
import { mapTeamUpsert } from "../_shared/mappers.ts";
import { getAdminClient, getSyncConfig, logSync } from "../_shared/supabase-admin.ts";

const JOB = "sync-standings";

type StandingLeague = {
  league: { id: number; season: number };
  standings: Array<
    Array<{
      rank: number;
      team: { id: number; name: string; logo?: string };
      points: number;
      goalsDiff: number;
      form: string | null;
      description: string | null;
      all: {
        played: number;
        win: number;
        draw: number;
        lose: number;
        goals: { for: number; against: number };
      };
    }>
  >;
};

serve(async (_req) => {
  let logId: number | undefined;
  try {
    logId = await logSync(JOB, "started");

    const season = getSeason();
    const leagueIdStr = await getSyncConfig("primary_league_id");
    if (!leagueIdStr) {
      throw new Error("primary_league_id not set — run sync-season-fixtures first");
    }
    const leagueId = Number(leagueIdStr);

    const data = await apiFootballGet<StandingLeague>("/standings", {
      league: leagueId,
      season,
    });

    const supabase = getAdminClient();
    const flat = data[0]?.standings?.flat() ?? [];
    const teamRows = flat.map((row) => mapTeamUpsert(row.team));
    if (teamRows.length > 0) {
      const { error: teamsError } = await supabase.from("teams").upsert(teamRows, {
        onConflict: "api_football_id",
      });
      if (teamsError) throw teamsError;
    }

    const standingRows = flat.map((row) => ({
      season,
      league_id: leagueId,
      team_id: row.team.id,
      rank: row.rank,
      points: row.points,
      goals_diff: row.goalsDiff,
      form: row.form,
      played: row.all.played,
      won: row.all.win,
      drawn: row.all.draw,
      lost: row.all.lose,
      goals_for: row.all.goals.for,
      goals_against: row.all.goals.against,
      description: row.description,
      updated_at: new Date().toISOString(),
    }));

    if (standingRows.length > 0) {
      const { error } = await supabase.from("standings").upsert(standingRows, {
        onConflict: "season,league_id,team_id",
      });
      if (error) throw error;
    }

    const body = { ok: true, leagueId, season, teams: standingRows.length };
    await logSync(JOB, "success", `Synced ${standingRows.length} standings rows`, body, logId);

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
