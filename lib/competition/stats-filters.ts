import { isLeagueCompetition } from "@/lib/competition-labels";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { CompetitionId, Match } from "@/types";

export type StatsCompetitionFilter = "liga" | "copa-rey" | "amistoso" | "todos";

export const DEFAULT_STATS_COMPETITION_FILTER: StatsCompetitionFilter = "liga";

const STATS_FILTER_LABELS: Record<StatsCompetitionFilter, string> = {
  liga: "Liga",
  "copa-rey": "Copa del Rey",
  amistoso: "Amistosos",
  todos: "Todas",
};

export function statsCompetitionFilterLabel(filter: StatsCompetitionFilter): string {
  return STATS_FILTER_LABELS[filter];
}

export function statsCompetitionFilterHeading(filter: StatsCompetitionFilter): string {
  if (filter === "todos") return "Estadisticas en la temporada actual";
  return `Estadisticas en ${STATS_FILTER_LABELS[filter].toLowerCase()}`;
}

export function statsCompetitionFilterOptions(gender: PrimerEquipoGender): Array<{ id: StatsCompetitionFilter; label: string }> {
  const options: Array<{ id: StatsCompetitionFilter; label: string }> = [
    { id: "liga", label: "Liga" },
  ];

  if (gender === "masculino") {
    options.push({ id: "copa-rey", label: "Copa del Rey" });
  }

  options.push({ id: "amistoso", label: "Amistosos" });
  options.push({ id: "todos", label: "Todas" });

  return options;
}

export function matchesStatsCompetitionFilter(
  match: Pick<Match, "competition">,
  filter: StatsCompetitionFilter,
): boolean {
  if (filter === "todos") return true;
  if (filter === "copa-rey") return match.competition === "copa-rey";
  if (filter === "amistoso") return match.competition === "amistoso";
  return isLeagueCompetition(match.competition);
}

export function filterMatchesForStatsCompetition(
  matches: readonly Match[],
  filter: StatsCompetitionFilter,
): Match[] {
  if (filter === "todos") return [...matches];
  return matches.filter((match) => matchesStatsCompetitionFilter(match, filter));
}

export function matchesStatsCompetitionFilterFromId(
  competitionId: CompetitionId | undefined,
  filter: StatsCompetitionFilter,
): boolean {
  if (!competitionId) return filter === "todos";
  return matchesStatsCompetitionFilter({ competition: competitionId }, filter);
}
