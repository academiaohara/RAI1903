import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { syncMatchDetailForFixture } from "../_shared/match-detail.ts";
import { isFinishedStatus } from "../_shared/mappers.ts";
import { getAdminClient, logSync } from "../_shared/supabase-admin.ts";

const JOB = "sync-match-detail";
const DETAIL_DELAY_MS = 3 * 60 * 60 * 1000;

serve(async (req) => {
  let logId: number | undefined;
  try {
    logId = await logSync(JOB, "started");

    const url = new URL(req.url);
    const fixtureParam = url.searchParams.get("fixture_id");
    const supabase = getAdminClient();
    const now = Date.now();
    const results: Array<{ fixtureId: number; ok: boolean; error?: string }> = [];

    let fixtureIds: number[] = [];
    if (fixtureParam) {
      fixtureIds = [Number(fixtureParam)];
    } else {
      const { data, error } = await supabase
        .from("matches")
        .select("api_football_fixture_id, kickoff_at, status_short, detail_synced_at")
        .in("status_short", ["FT", "AET", "PEN", "AWD", "WO"])
        .is("detail_synced_at", null)
        .order("kickoff_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      fixtureIds = (data ?? [])
        .filter((m) => {
          const kickoff = new Date(m.kickoff_at).getTime();
          return now - kickoff >= DETAIL_DELAY_MS && isFinishedStatus(m.status_short);
        })
        .map((m) => m.api_football_fixture_id);
    }

    for (const fixtureId of fixtureIds) {
      try {
        await syncMatchDetailForFixture(fixtureId);
        results.push({ fixtureId, ok: true });
      } catch (e) {
        results.push({
          fixtureId,
          ok: false,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    const body = { ok: true, processed: results.length, results };
    await logSync(JOB, "success", `Processed ${results.length} fixtures`, body, logId);

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
