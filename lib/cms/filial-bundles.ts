import type { CompetitionZoneRule } from "@/lib/cms/competition-config-bundle";
import { DEFAULT_ZONE_COLORS } from "@/lib/cms/competition-config-bundle";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { bundleMapKey } from "@/lib/cms/season-bundles";
import { shortNameFromFull, slugifyCanteraTeamName } from "@/lib/cantera-data";
import { FILIAL_TEAM_ID, TEAM_SEEDS } from "@/lib/segunda-asturfutbol-2526";
import type { CanteraSquadImport } from "@/types/cantera-squad-import";
import type { CompetitionId } from "@/types";

export type FilialTeamSeed = {
  id: string;
  name: string;
  shortName: string;
  city?: string;
  stadium?: string;
  crestInitials?: string;
  colors?: [string, string];
};

export type FilialFixturePartido = {
  fecha: string;
  hora?: string | null;
  local: string;
  visitante: string;
  goles_local?: number | null;
  goles_visitante?: number | null;
  estado?: "finalizado" | "pendiente";
};

export type FilialFixturesBundle = {
  competicion: string;
  temporada?: string;
  jornadas: Array<{
    jornada: number;
    partidos: FilialFixturePartido[];
  }>;
};

export type FilialCompetitionConfigBundle = {
  teams: FilialTeamSeed[];
  zones: CompetitionZoneRule[];
  /** Jornadas totales previstas en la liga (ida y vuelta). */
  leagueRounds: number;
  ligaLabel?: string;
  matchCompetition?: CompetitionId;
  /** ID del equipo del club (calendario, jornadas, clasificación). */
  clubTeamId?: string;
};

export function leagueRoundCountFromTeamCount(teamCount: number): number {
  return Math.max(0, (teamCount - 1) * 2);
}

function initialsFromTeamName(name: string): string {
  const words = name.replace(/\s+U19$/i, "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return "EQ";
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function buildTeamSeedsFromFixtures(fixtures: FilialFixturesBundle): FilialTeamSeed[] {
  const names = new Set<string>();
  for (const jornada of fixtures.jornadas) {
    for (const partido of jornada.partidos) {
      if (partido.local.trim()) names.add(partido.local.trim());
      if (partido.visitante.trim()) names.add(partido.visitante.trim());
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b, "es")).map((name) => ({
    id: slugifyCanteraTeamName(name),
    name,
    shortName: shortNameFromFull(name),
    city: "Asturias",
    stadium: "—",
    crestInitials: initialsFromTeamName(name),
    colors: ["#64748B", "#FFFFFF"] as [string, string],
  }));
}

export function mergeTeamSeedsFromFixtures(
  existing: FilialTeamSeed[],
  fixtures: FilialFixturesBundle,
): FilialTeamSeed[] {
  const byName = new Map(existing.map((team) => [team.name, team]));
  const byId = new Map(existing.map((team) => [team.id, team]));
  return buildTeamSeedsFromFixtures(fixtures).map((seed) => {
    const preserved = byName.get(seed.name) ?? byId.get(seed.id);
    if (!preserved) return seed;
    return {
      ...seed,
      id: preserved.id,
      shortName: preserved.shortName || seed.shortName,
      city: preserved.city ?? seed.city,
      stadium: preserved.stadium ?? seed.stadium,
      crestInitials: preserved.crestInitials ?? seed.crestInitials,
      colors: preserved.colors ?? seed.colors,
    };
  });
}

export function resizeFilialTeamSeeds(teams: FilialTeamSeed[], targetCount: number): FilialTeamSeed[] {
  const count = Math.max(0, targetCount);
  if (teams.length === count) return teams;
  if (teams.length > count) return teams.slice(0, count);
  const next = [...teams];
  while (next.length < count) {
    const index = next.length + 1;
    next.push({
      id: `equipo-${index}`,
      name: `Equipo ${index}`,
      shortName: `EQ${index}`,
      city: "Asturias",
      stadium: "—",
      crestInitials: `E${index}`,
      colors: ["#64748B", "#FFFFFF"],
    });
  }
  return next;
}

export function resolveCanteraClubTeamId(
  config: FilialCompetitionConfigBundle,
  fallbackTeamId: string,
): string {
  if (config.clubTeamId && config.teams.some((team) => team.id === config.clubTeamId)) {
    return config.clubTeamId;
  }
  const avilesTeam = config.teams.find((team) => {
    const normalized = team.name
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase();
    return normalized.includes("real") && normalized.includes("aviles");
  });
  return avilesTeam?.id ?? fallbackTeamId;
}

export const FILIAL_DEFAULT_COMPETITION_ID = "segunda-asturfutbol" as CompetitionId;

export function defaultFilialCompetitionConfig(): FilialCompetitionConfigBundle {
  return {
    teams: TEAM_SEEDS.map((team) => ({
      id: team.id,
      name: team.name,
      shortName: team.shortName,
      city: team.city,
      stadium: team.stadium,
      crestInitials: team.crestInitials,
      colors: team.colors,
    })),
    zones: [
      {
        id: "promotion",
        label: "Campeón",
        count: 1,
        from: "top",
        colorClass: DEFAULT_ZONE_COLORS.promotion,
      },
    ],
    leagueRounds: 34,
    ligaLabel: "2ª Asturfútbol",
    matchCompetition: FILIAL_DEFAULT_COMPETITION_ID,
    clubTeamId: FILIAL_TEAM_ID,
  };
}

export function getFilialSquadBundle(map: SeasonBundlesMap): CanteraSquadImport | null {
  const payload = map[bundleMapKey("filial", "squad")];
  return (payload as CanteraSquadImport | undefined) ?? null;
}

export function getFilialFixturesBundle(map: SeasonBundlesMap): FilialFixturesBundle | null {
  const payload = map[bundleMapKey("filial", "fixtures")];
  return (payload as FilialFixturesBundle | undefined) ?? null;
}

export function getFilialCompetitionConfigBundle(map: SeasonBundlesMap): FilialCompetitionConfigBundle | null {
  const payload = map[bundleMapKey("filial", "competition_config")];
  return (payload as FilialCompetitionConfigBundle | undefined) ?? null;
}

export function resolveFilialCompetitionConfig(map: SeasonBundlesMap): FilialCompetitionConfigBundle {
  return getFilialCompetitionConfigBundle(map) ?? defaultFilialCompetitionConfig();
}

export function buildFilialTeamNameToId(config: FilialCompetitionConfigBundle): Record<string, string> {
  const map: Record<string, string> = {};
  for (const team of config.teams) {
    map[team.name] = team.id;
  }
  return map;
}
