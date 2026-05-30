import type { CompetitionId } from "@/types";

export type FixtureMetaSource = {
  competition: CompetitionId;
  competitionStage?: string;
  matchday?: number;
};

/** Copa del Rey round labels keyed by league matchday (mock schedule). */
const COPA_ROUND_BY_MATCHDAY: Record<number, string> = {
  4: "Dieciseisavos",
  12: "Octavos",
};

export const LEAGUE_COMPETITION_IDS = ["liga-raij903", "primera-rfef"] as const;

export type LeagueCompetitionId = (typeof LEAGUE_COMPETITION_IDS)[number];

const LEAGUE_COMPETITION_LABELS: Record<LeagueCompetitionId, string> = {
  "liga-raij903": "1ª RFEF - Grupo I",
  "primera-rfef": "1ª RFEF",
};

export function leagueCompetitionLabel(id: LeagueCompetitionId): string {
  return LEAGUE_COMPETITION_LABELS[id];
}

export function isLeagueCompetition(competitionId: string): competitionId is LeagueCompetitionId {
  return (LEAGUE_COMPETITION_IDS as readonly string[]).includes(competitionId);
}

/** Short label shown on match cards (corner badge). */
export function matchCompetitionShortLabel(match: FixtureMetaSource): string {
  if (match.competition === "copa-rey") {
    const round = match.matchday !== undefined ? COPA_ROUND_BY_MATCHDAY[match.matchday] : undefined;
    return match.competitionStage ?? round ?? "Copa del Rey";
  }
  if (match.competition === "primera-rfef") return "1ª RFEF";
  if (match.competition === "liga-raij903") return "Liga";
  if (match.competition === "amistoso") return "Amistoso";
  if (match.competition === "liga-femenina") return "Liga Fem.";
  if (match.competition === "primera-asturfutbol") return "Primera Asturfutbol";
  if (match.competition === "segunda-asturfutbol") return "2ª Asturfutbol";
  if (match.competition === "liga-nacional-juvenil") return "Liga Nacional Juvenil";
  return match.competition;
}

/** Jornada badge label (e.g. J9) for league fixtures. */
export function matchJornadaLabel(match: FixtureMetaSource & { matchday?: number }): string | null {
  if (match.competition === "copa-rey" || match.matchday === undefined) {
    return null;
  }
  return `J${match.matchday}`;
}

/** Corner meta: competition + round (jornada or cup stage). */
export function matchFixtureMeta(match: FixtureMetaSource & { matchday: number }): string {
  const label = matchCompetitionShortLabel(match);
  if (match.competition === "copa-rey") {
    return label;
  }
  return `${label} · J${match.matchday}`;
}
