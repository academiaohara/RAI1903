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

export const LEAGUE_COMPETITION_IDS = [
  "liga-raij903",
  "primera-rfef",
  "liga-femenina",
  "liga-nacional-juvenil",
] as const;

export type LeagueCompetitionId = (typeof LEAGUE_COMPETITION_IDS)[number];

const LEAGUE_COMPETITION_LABELS: Record<LeagueCompetitionId, string> = {
  "liga-raij903": "1ª RFEF - Grupo I",
  "primera-rfef": "1ª RFEF",
  "liga-femenina": "2ª RFEF Femenina - Grupo I",
  "liga-nacional-juvenil": "Liga Nacional Juvenil",
};

export function leagueCompetitionLabel(id: LeagueCompetitionId): string {
  return LEAGUE_COMPETITION_LABELS[id];
}

export function isLeagueCompetition(competitionId: string): competitionId is LeagueCompetitionId {
  return (LEAGUE_COMPETITION_IDS as readonly string[]).includes(competitionId);
}

/** Partidos del calendario de liga sin `competition` explícito (CMS antiguo) cuentan como liga. */
export function countsAsLeagueCompetition(competitionId: string | undefined): boolean {
  if (!competitionId) return true;
  return isLeagueCompetition(competitionId);
}

function copaStageBadgeLabel(stage: string): string {
  const normalized = stage.toLowerCase();
  if (normalized.includes("primera")) return "1ª Elim.";
  if (normalized.includes("segunda")) return "2ª Elim.";
  if (normalized.includes("tercera")) return "3ª Elim.";
  if (normalized.includes("dieciseisav")) return "Diec.";
  if (normalized.includes("octavos")) return "Octavos";
  if (normalized.includes("cuartos")) return "Cuartos";
  if (normalized.includes("semifinal")) return "Semis";
  if (normalized.includes("final")) return "Final";
  return stage.length > 10 ? `${stage.slice(0, 9)}…` : stage;
}

function copaStageMetaLabel(match: FixtureMetaSource): string {
  const customStage = match.competitionStage?.trim();
  if (customStage) return customStage;
  if (match.matchday !== undefined) {
    const round = COPA_ROUND_BY_MATCHDAY[match.matchday];
    if (round) return round;
  }
  return "Copa del Rey";
}

/** Short label shown on match cards (corner badge). */
export function matchCompetitionShortLabel(match: FixtureMetaSource): string {
  const customStage = match.competitionStage?.trim();
  if (match.competition === "copa-rey") {
    return "Copa del Rey";
  }
  if (match.competition === "primera-rfef") return customStage || "1ª RFEF";
  if (match.competition === "liga-raij903") return customStage || "Liga";
  if (match.competition === "amistoso") return customStage || "Amistoso";
  if (match.competition === "liga-femenina") return "2ª RFEF Fem.";
  if (match.competition === "primera-asturfutbol") return "Primera Asturfutbol";
  if (match.competition === "segunda-asturfutbol") return "2ª Asturfutbol";
  if (match.competition === "liga-nacional-juvenil") return "Liga Nacional Juvenil";
  return match.competition;
}

/** Jornada badge label (e.g. J9) for league fixtures. */
export function matchJornadaLabel(match: FixtureMetaSource & { matchday?: number }): string | null {
  if (match.competition === "copa-rey" || match.competition === "amistoso" || match.matchday === undefined) {
    return null;
  }
  return `J${match.matchday}`;
}

/** Cuadrado de jornada / eliminatoria en banners y tarjetas. */
export function matchRoundBadgeLabel(match: FixtureMetaSource & { matchday?: number }): string | null {
  const jornada = matchJornadaLabel(match);
  if (jornada) return jornada;
  if (match.competition === "copa-rey") {
    const stage = match.competitionStage?.trim();
    if (stage) return copaStageBadgeLabel(stage);
    if (match.matchday !== undefined) {
      const round = COPA_ROUND_BY_MATCHDAY[match.matchday];
      if (round) return copaStageBadgeLabel(round);
    }
    return "Copa";
  }
  return null;
}

/** Corner meta: competition + round (jornada or cup stage). */
export function matchFixtureMeta(match: FixtureMetaSource & { matchday?: number }): string {
  const label = matchCompetitionShortLabel(match);
  if (match.competition === "copa-rey") {
    const stage = copaStageMetaLabel(match);
    return stage === "Copa del Rey" ? label : `${label} · ${stage}`;
  }
  if (match.matchday === undefined) return label;
  return `${label} · J${match.matchday}`;
}
