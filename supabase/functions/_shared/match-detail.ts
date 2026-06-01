import { apiFootballGet } from "./api-football.ts";
import { getAdminClient } from "./supabase-admin.ts";

type ApiEvent = {
  time: { elapsed: number | null; extra: number | null };
  team: { id: number; name: string };
  player: { id: number | null; name: string | null };
  assist: { id: number | null; name: string | null };
  type: string;
  detail: string;
  comments: string | null;
};

type ApiLineup = {
  team: { id: number };
  formation: string | null;
  coach: { name: string | null };
  startXI: Array<{ player: { id: number; name: string; number: number; pos: string | null } }>;
  substitutes: Array<{ player: { id: number; name: string; number: number; pos: string | null } }>;
};

type ApiStat = {
  team: { id: number };
  statistics: Array<{ type: string; value: string | number | null }>;
};

function mapEventType(type: string, detail: string): string {
  const t = type.toLowerCase();
  const d = detail.toLowerCase();
  if (t === "goal") {
    if (d.includes("cancelled") || d.includes("disallowed")) return "goal_disallowed";
    return "goal";
  }
  if (t === "card") {
    if (d.includes("red")) return "red";
    return "yellow";
  }
  if (t === "subst") return "substitution";
  return t;
}

function teamSide(homeTeamId: number, awayTeamId: number, eventTeamId: number): "home" | "away" {
  if (eventTeamId === homeTeamId) return "home";
  if (eventTeamId === awayTeamId) return "away";
  return "home";
}

export async function syncMatchDetailForFixture(fixtureId: number): Promise<{ events: number; stats: number; lineups: number }> {
  const supabase = getAdminClient();

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("api_football_fixture_id, home_team_id, away_team_id, status_short")
    .eq("api_football_fixture_id", fixtureId)
    .maybeSingle();

  if (matchError) throw matchError;
  if (!match) throw new Error(`Fixture ${fixtureId} not found in matches`);

  const [eventsRaw, lineupsRaw, statsRaw] = await Promise.all([
    apiFootballGet<ApiEvent>("/fixtures/events", { fixture: fixtureId }),
    apiFootballGet<ApiLineup>("/fixtures/lineups", { fixture: fixtureId }),
    apiFootballGet<ApiStat>("/fixtures/statistics", { fixture: fixtureId }),
  ]);

  await supabase.from("match_events").delete().eq("fixture_id", fixtureId);
  if (eventsRaw.length > 0) {
    const eventRows = eventsRaw.map((ev, index) => ({
      fixture_id: fixtureId,
      elapsed: ev.time.elapsed,
      extra: ev.time.extra,
      team_side: teamSide(match.home_team_id, match.away_team_id, ev.team.id),
      event_type: mapEventType(ev.type, ev.detail),
      detail: ev.detail,
      player_name: ev.player?.name,
      assist_name: ev.assist?.name,
      player_id: ev.player?.id,
      sort_order: index,
      raw: ev,
    }));
    const { error } = await supabase.from("match_events").insert(eventRows);
    if (error) throw error;
  }

  await supabase.from("match_statistics").delete().eq("fixture_id", fixtureId);
  const statRows: Array<{
    fixture_id: number;
    team_side: "home" | "away";
    stat_type: string;
    stat_value: string;
  }> = [];

  for (const block of statsRaw) {
    const side = teamSide(match.home_team_id, match.away_team_id, block.team.id);
    for (const stat of block.statistics) {
      statRows.push({
        fixture_id: fixtureId,
        team_side: side,
        stat_type: stat.type,
        stat_value: stat.value === null ? "" : String(stat.value),
      });
    }
  }
  if (statRows.length > 0) {
    const { error } = await supabase.from("match_statistics").insert(statRows);
    if (error) throw error;
  }

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
  if (lineupRows.length > 0) {
    const { error } = await supabase.from("lineups").insert(lineupRows);
    if (error) throw error;
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("matches")
    .update({
      detail_synced_at: now,
      lineup_synced_at: lineupRows.length > 0 ? now : undefined,
      updated_at: now,
    })
    .eq("api_football_fixture_id", fixtureId);

  if (updateError) throw updateError;

  return {
    events: eventsRaw.length,
    stats: statRows.length,
    lineups: lineupRows.length,
  };
}
