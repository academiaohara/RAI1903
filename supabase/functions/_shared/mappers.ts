/** Normaliza nombre de equipo API → slug local del sitio (cuando se conoce). */
const TEAM_SLUG_BY_API_ID: Record<number, string> = {
  9632: "real-aviles-industrial",
};

const TEAM_SLUG_BY_NAME: Record<string, string> = {
  "real aviles": "real-aviles-industrial",
  "real aviles industrial": "real-aviles-industrial",
  "racing club ferrol": "ferrol",
  "cd lugo": "lugo",
  "pontevedra cf": "pontevedra",
  "zamora cf": "zamora",
  "cd arenteiro": "arenteiro",
  "unionistas de salamanca cf": "unionistas",
  "sd ponferradina": "ponferradina",
  "real madrid castilla": "castilla",
  "cd tenerife": "tenerife",
  "cd talavera": "talavera",
  "merida ad": "merida",
  "celta de vigo b": "celta-fortuna",
  "cp cacereno": "cacereno",
  "cd guadalajara": "guadalajara",
  "ourense cf": "ourense",
  "arenas club de getxo": "arenas",
  "barakaldo cf": "barakaldo",
  "athletic club b": "athletic-bilbao-b",
  "ca osasuna promesas": "osasuna-promesas",
};

export function resolveLocalSlug(apiTeamId: number, name: string): string | null {
  if (TEAM_SLUG_BY_API_ID[apiTeamId]) return TEAM_SLUG_BY_API_ID[apiTeamId];
  const key = name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
  return TEAM_SLUG_BY_NAME[key] ?? null;
}

export function parseMatchday(round: string | null | undefined): number | null {
  if (!round) return null;
  const match = round.match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

export function isFinishedStatus(short: string): boolean {
  return ["FT", "AET", "PEN", "AWD", "WO"].includes(short);
}

export type FixtureRow = {
  fixture: {
    id: number;
    date: string;
    status: { short: string; long: string };
    venue?: { name?: string; city?: string };
  };
  league: { id: number; name: string; season: number; round?: string };
  teams: {
    home: { id: number; name: string; logo?: string };
    away: { id: number; name: string; logo?: string };
  };
  goals: { home: number | null; away: number | null };
};

export function mapTeamUpsert(team: { id: number; name: string; logo?: string }) {
  return {
    api_football_id: team.id,
    name: team.name,
    logo_url: team.logo ?? null,
    local_slug: resolveLocalSlug(team.id, team.name),
    updated_at: new Date().toISOString(),
  };
}

export function mapFixtureToMatch(row: FixtureRow, avilesTeamId: number) {
  const { fixture, league, teams, goals } = row;
  const isAviles = teams.home.id === avilesTeamId || teams.away.id === avilesTeamId;
  return {
    api_football_fixture_id: fixture.id,
    season: league.season,
    league_id: league.id,
    league_name: league.name,
    round: league.round ?? null,
    matchday: parseMatchday(league.round),
    home_team_id: teams.home.id,
    away_team_id: teams.away.id,
    kickoff_at: fixture.date,
    venue_name: fixture.venue?.name ?? null,
    venue_city: fixture.venue?.city ?? null,
    status_short: fixture.status.short,
    status_long: fixture.status.long,
    home_goals: goals.home,
    away_goals: goals.away,
    is_aviles_match: isAviles,
    updated_at: new Date().toISOString(),
  };
}
