import type { CompetitionZoneRule } from "@/lib/cms/competition-config-bundle";
import { DEFAULT_ZONE_COLORS } from "@/lib/cms/competition-config-bundle";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { bundleMapKey } from "@/lib/cms/season-bundles";
import { TEAM_SEEDS } from "@/lib/segunda-asturfutbol-2526";
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
};

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
