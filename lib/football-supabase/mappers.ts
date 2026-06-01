import { RAI_TEAM_ID } from "@/data/mock";
import type {
  DbLineup,
  DbMatch,
  DbMatchEvent,
  DbStanding,
  DbStat,
  DbTeam,
} from "@/lib/football-supabase/types";
import type {
  FormCode,
  Match,
  MatchEvent,
  MatchLineup,
  MatchStatCategory,
  MatchStatus,
  Team,
} from "@/types";

const FINISHED = new Set(["FT", "AET", "PEN", "AWD", "WO"]);

function teamId(team: DbTeam | undefined, apiId: number): string {
  return team?.local_slug ?? `api-${apiId}`;
}

function mapCompetition(leagueName: string): Match["competition"] {
  const n = leagueName.toLowerCase();
  if (n.includes("copa del rey") || n.includes("copa")) return "copa-rey";
  if (n.includes("rfef") || n.includes("federación")) return "primera-rfef";
  return "primera-rfef";
}

export function dbMatchToAppMatch(
  row: DbMatch,
  homeTeam: DbTeam | undefined,
  awayTeam: DbTeam | undefined,
): Match {
  const finished = FINISHED.has(row.status_short);
  const venue = [row.venue_name, row.venue_city].filter(Boolean).join(", ") || "Por confirmar";

  return {
    id: String(row.api_football_fixture_id),
    matchday: row.matchday ?? 0,
    homeTeamId: teamId(homeTeam, row.home_team_id),
    awayTeamId: teamId(awayTeam, row.away_team_id),
    homeTeam: homeTeam?.name ?? `Equipo ${row.home_team_id}`,
    awayTeam: awayTeam?.name ?? `Equipo ${row.away_team_id}`,
    date: row.kickoff_at,
    competition: mapCompetition(row.league_name),
    competitionStage: row.round ?? undefined,
    venue,
    status: (finished ? "finished" : "scheduled") satisfies MatchStatus,
    homeScore: row.home_goals ?? undefined,
    awayScore: row.away_goals ?? undefined,
  };
}

export function dbStandingToTeam(row: DbStanding, team: DbTeam | undefined, position: number): Team {
  const form = (row.form ?? "")
    .split("")
    .slice(-5)
    .map((c): FormCode => (c === "W" ? "G" : c === "D" ? "E" : c === "L" ? "P" : "E"));

  const slug = team?.local_slug ?? `api-${row.team_id}`;
  const shortName = team?.name?.split(" ").slice(-1)[0] ?? team?.name ?? slug;

  return {
    id: slug,
    name: team?.name ?? `Equipo ${row.team_id}`,
    shortName,
    city: "",
    stadium: "",
    coach: "",
    founded: 0,
    crestInitials: shortName.slice(0, 3).toUpperCase(),
    colors: ["#214C9B", "#FFFFFF"],
    position,
    form,
    stats: {
      played: row.played,
      won: row.won,
      drawn: row.drawn,
      lost: row.lost,
      goalsFor: row.goals_for,
      goalsAgainst: row.goals_against,
      points: row.points,
    },
  };
}

function mapLineupPlayers(
  players: DbLineup["starters"],
): MatchLineup["starters"] {
  return players.map((p) => ({
    number: p.number,
    name: p.name,
    role: p.pos ?? undefined,
  }));
}

export function dbLineupToMatchLineup(lineup: DbLineup | undefined): MatchLineup {
  if (!lineup) return { formation: "", starters: [], bench: [] };
  return {
    formation: lineup.formation ?? "",
    starters: mapLineupPlayers(lineup.starters),
    bench: mapLineupPlayers(lineup.substitutes),
  };
}

export function dbEventsToMatchEvents(rows: DbMatchEvent[]): MatchEvent[] {
  return rows.map((row) => ({
    id: String(row.id),
    minute: row.elapsed ?? 0,
    type: row.event_type as MatchEvent["type"],
    team: row.team_side,
    player: row.player_name ?? "—",
    detail: row.detail ?? row.assist_name ?? undefined,
  }));
}

const STAT_GROUPS: Record<string, string> = {
  "Shots on Goal": "Tiros",
  "Total Shots": "Tiros",
  "Ball Possession": "Posesión",
  "Passes %": "Pases",
  "Total passes": "Pases",
  "Fouls": "Disciplina",
  "Yellow Cards": "Disciplina",
  "Red Cards": "Disciplina",
  "Corner Kicks": "Balón parado",
  "Offsides": "General",
};

export function dbStatsToMatchCategories(rows: DbStat[]): MatchStatCategory[] {
  const byTitle = new Map<string, MatchStatCategory>();

  for (const row of rows) {
    const title = STAT_GROUPS[row.stat_type] ?? "General";
    if (!byTitle.has(title)) {
      byTitle.set(title, { title, rows: [] });
    }
    const category = byTitle.get(title)!;
    const existing = category.rows.find((r) => r.label === row.stat_type);
    if (existing) {
      if (row.team_side === "home") existing.home = row.stat_value;
      else existing.away = row.stat_value;
    } else {
      category.rows.push({
        label: row.stat_type,
        home: row.team_side === "home" ? row.stat_value : "—",
        away: row.team_side === "away" ? row.stat_value : "—",
      });
    }
  }

  return [...byTitle.values()];
}

export function isAvilesCentricMatch(match: Match): boolean {
  return match.homeTeamId === RAI_TEAM_ID || match.awayTeamId === RAI_TEAM_ID;
}
