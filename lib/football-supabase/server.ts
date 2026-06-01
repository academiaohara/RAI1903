import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/env";
import type { DbLineup, DbMatch, DbMatchEvent, DbStanding, DbStat, DbTeam } from "@/lib/football-supabase/types";
import type { Match, Matchday, Team } from "@/types";
import {
  dbEventsToMatchEvents,
  dbLineupToMatchLineup,
  dbMatchToAppMatch,
  dbStandingToTeam,
  dbStatsToMatchCategories,
} from "@/lib/football-supabase/mappers";
import type { MatchDetail, MatchStatCategory } from "@/types";
import { buildMatchDetail } from "@/lib/match-detail";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";

const DEFAULT_SEASON = Number(process.env.FOOTBALL_SEASON ?? process.env.SEASON ?? 2025);

function createFootballClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export function isFootballDataConfigured(): boolean {
  return isSupabaseConfigured();
}

export async function hasFootballDataInSupabase(season = DEFAULT_SEASON): Promise<boolean> {
  const client = createFootballClient();
  if (!client) return false;
  const { count, error } = await client
    .from("matches")
    .select("api_football_fixture_id", { count: "exact", head: true })
    .eq("season", season)
    .eq("is_aviles_match", true);
  if (error) return false;
  return (count ?? 0) > 0;
}

async function loadTeams(client: ReturnType<typeof createFootballClient>, ids: number[]): Promise<Map<number, DbTeam>> {
  const map = new Map<number, DbTeam>();
  if (!client || ids.length === 0) return map;
  const unique = [...new Set(ids)];
  const { data } = await client.from("teams").select("*").in("api_football_id", unique);
  for (const team of data ?? []) {
    map.set(team.api_football_id, team as DbTeam);
  }
  return map;
}

export async function fetchAvilesMatchesFromSupabase(season = DEFAULT_SEASON): Promise<Match[] | null> {
  const client = createFootballClient();
  if (!client) return null;

  const { data: rows, error } = await client
    .from("matches")
    .select("*")
    .eq("season", season)
    .eq("is_aviles_match", true)
    .order("kickoff_at", { ascending: true });

  if (error || !rows?.length) return null;

  const teamIds = rows.flatMap((r) => [r.home_team_id, r.away_team_id] as number[]);
  const teams = await loadTeams(client, teamIds);

  return (rows as DbMatch[]).map((row) =>
    dbMatchToAppMatch(row, teams.get(row.home_team_id), teams.get(row.away_team_id)),
  );
}

export async function fetchMatchdaysFromSupabase(season = DEFAULT_SEASON): Promise<Matchday[] | null> {
  const client = createFootballClient();
  if (!client) return null;

  const leagueId = await getPrimaryLeagueId(client);
  if (!leagueId) return null;

  const { data: rows, error } = await client
    .from("matches")
    .select("*")
    .eq("season", season)
    .eq("league_id", leagueId)
    .order("kickoff_at", { ascending: true });

  if (error || !rows?.length) return null;

  const teamIds = rows.flatMap((r) => [r.home_team_id, r.away_team_id] as number[]);
  const teams = await loadTeams(client, teamIds);

  const byRound = new Map<number, Match[]>();
  for (const row of rows as DbMatch[]) {
    const round = row.matchday ?? 0;
    const match = dbMatchToAppMatch(row, teams.get(row.home_team_id), teams.get(row.away_team_id));
    if (!byRound.has(round)) byRound.set(round, []);
    byRound.get(round)!.push(match);
  }

  return [...byRound.entries()]
    .sort(([a], [b]) => a - b)
    .map(([round, matches]) => ({ round, matches }));
}

async function getPrimaryLeagueId(client: NonNullable<ReturnType<typeof createFootballClient>>): Promise<number | null> {
  const { data } = await client.from("football_sync_config").select("value").eq("key", "primary_league_id").maybeSingle();
  if (data?.value) return Number(data.value);
  const { data: match } = await client
    .from("matches")
    .select("league_id")
    .eq("is_aviles_match", true)
    .limit(1)
    .maybeSingle();
  return match?.league_id ?? null;
}

export async function fetchStandingsTeamsFromSupabase(season = DEFAULT_SEASON): Promise<Team[] | null> {
  const client = createFootballClient();
  if (!client) return null;

  const leagueId = await getPrimaryLeagueId(client);
  if (!leagueId) return null;

  const { data: standings, error } = await client
    .from("standings")
    .select("*")
    .eq("season", season)
    .eq("league_id", leagueId)
    .order("rank", { ascending: true });

  if (error || !standings?.length) return null;

  const teamIds = (standings as DbStanding[]).map((s) => s.team_id);
  const teams = await loadTeams(client, teamIds);

  return (standings as DbStanding[]).map((row) =>
    dbStandingToTeam(row, teams.get(row.team_id), row.rank),
  );
}

export async function fetchMatchByIdFromSupabase(matchId: string): Promise<Match | null> {
  const client = createFootballClient();
  if (!client) return null;

  const fixtureId = Number(matchId);
  if (Number.isNaN(fixtureId)) return null;

  const { data: row, error } = await client
    .from("matches")
    .select("*")
    .eq("api_football_fixture_id", fixtureId)
    .maybeSingle();

  if (error || !row) return null;

  const dbRow = row as DbMatch;
  const teams = await loadTeams(client, [dbRow.home_team_id, dbRow.away_team_id]);
  return dbMatchToAppMatch(dbRow, teams.get(dbRow.home_team_id), teams.get(dbRow.away_team_id));
}

export async function buildMatchDetailFromSupabase(
  match: Match,
  gender: PrimerEquipoGender,
): Promise<MatchDetail | null> {
  const client = createFootballClient();
  if (!client) return null;

  const fixtureId = Number(match.id);
  if (Number.isNaN(fixtureId)) return null;

  const [{ data: events }, { data: lineups }, { data: stats }, { data: dbMatch }] = await Promise.all([
    client.from("match_events").select("*").eq("fixture_id", fixtureId).order("sort_order"),
    client.from("lineups").select("*").eq("fixture_id", fixtureId),
    client.from("match_statistics").select("*").eq("fixture_id", fixtureId),
    client.from("matches").select("video_url").eq("api_football_fixture_id", fixtureId).maybeSingle(),
  ]);

  const hasDetail =
    (events?.length ?? 0) > 0 || (lineups?.length ?? 0) > 0 || (stats?.length ?? 0) > 0;
  if (!hasDetail && !dbMatch?.video_url) return null;

  const base = buildMatchDetail(match, gender);
  const lineupRows = (lineups ?? []) as DbLineup[];
  const homeLineup = lineupRows.find((l) => l.team_side === "home");
  const awayLineup = lineupRows.find((l) => l.team_side === "away");

  let statsCategories: MatchStatCategory[] = dbStatsToMatchCategories((stats ?? []) as DbStat[]);
  if (statsCategories.length === 0) statsCategories = base.stats;

  const videoUrl = dbMatch?.video_url;
  const rdpPostpartido =
    videoUrl && match.status === "finished"
      ? {
          id: `video-${fixtureId}`,
          title: "Vídeo del partido",
          url: videoUrl,
          label: "Vídeo",
        }
      : base.rdpPostpartido;

  return {
    ...base,
    stats: statsCategories,
    events: events?.length ? dbEventsToMatchEvents(events as DbMatchEvent[]) : base.events,
    homeLineup: homeLineup ? dbLineupToMatchLineup(homeLineup) : base.homeLineup,
    awayLineup: awayLineup ? dbLineupToMatchLineup(awayLineup) : base.awayLineup,
    rdpPostpartido,
  };
}

export async function updateMatchVideoUrl(
  fixtureId: number,
  videoUrl: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const client = createFootballClient();
  if (!client) return { ok: false, error: "Supabase no configurado" };

  const { error } = await client
    .from("matches")
    .update({ video_url: videoUrl, updated_at: new Date().toISOString() })
    .eq("api_football_fixture_id", fixtureId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
