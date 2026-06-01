import { matchdays as mockMatchdays, teams as mockTeams } from "@/data/mock";
import {
  fetchAvilesMatchesFromSupabase,
  fetchMatchByIdFromSupabase,
  fetchMatchdaysFromSupabase,
  fetchStandingsTeamsFromSupabase,
  hasFootballDataInSupabase,
} from "@/lib/football-supabase";
import { getMatchById } from "@/lib/fixtures";
import type { Match, Matchday, Team } from "@/types";

/** Partidos del Avilés: Supabase si hay datos sincronizados, si no mock. */
export async function getAvilesMatchesResolved(): Promise<Match[]> {
  if (await hasFootballDataInSupabase()) {
    const fromDb = await fetchAvilesMatchesFromSupabase();
    if (fromDb?.length) return fromDb;
  }
  const { getAvilesMatchesByGender } = await import("@/lib/fixtures");
  return getAvilesMatchesByGender("masculino");
}

/** Jornadas de liga (grupo del Avilés): Supabase o mock. */
export async function getLeagueMatchdaysResolved(): Promise<Matchday[]> {
  if (await hasFootballDataInSupabase()) {
    const fromDb = await fetchMatchdaysFromSupabase();
    if (fromDb?.length) return fromDb;
  }
  return mockMatchdays;
}

/** Clasificación: Supabase o mock. */
export async function getStandingsTeamsResolved(): Promise<Team[]> {
  if (await hasFootballDataInSupabase()) {
    const fromDb = await fetchStandingsTeamsFromSupabase();
    if (fromDb?.length) return fromDb;
  }
  return mockTeams;
}

export async function getMatchByIdResolved(matchId: string): Promise<Match | undefined> {
  if (await hasFootballDataInSupabase()) {
    const fromDb = await fetchMatchByIdFromSupabase(matchId);
    if (fromDb) return fromDb;
  }
  return getMatchById(matchId);
}
