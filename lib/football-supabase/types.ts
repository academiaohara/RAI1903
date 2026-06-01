export type DbTeam = {
  api_football_id: number;
  name: string;
  logo_url: string | null;
  local_slug: string | null;
};

export type DbMatch = {
  api_football_fixture_id: number;
  season: number;
  league_id: number;
  league_name: string;
  round: string | null;
  matchday: number | null;
  home_team_id: number;
  away_team_id: number;
  kickoff_at: string;
  venue_name: string | null;
  venue_city: string | null;
  status_short: string;
  status_long: string | null;
  home_goals: number | null;
  away_goals: number | null;
  is_aviles_match: boolean;
  video_url: string | null;
  detail_synced_at: string | null;
  lineup_synced_at: string | null;
};

export type DbMatchEvent = {
  id: number;
  fixture_id: number;
  elapsed: number | null;
  extra: number | null;
  team_side: "home" | "away";
  event_type: string;
  detail: string | null;
  player_name: string | null;
  assist_name: string | null;
  sort_order: number;
};

export type DbLineup = {
  fixture_id: number;
  team_side: "home" | "away";
  formation: string | null;
  coach_name: string | null;
  starters: Array<{ id: number; name: string; number: number; pos: string | null }>;
  substitutes: Array<{ id: number; name: string; number: number; pos: string | null }>;
};

export type DbStanding = {
  season: number;
  league_id: number;
  team_id: number;
  rank: number;
  points: number;
  goals_diff: number;
  form: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  description: string | null;
};

export type DbStat = {
  fixture_id: number;
  team_side: "home" | "away";
  stat_type: string;
  stat_value: string;
};
