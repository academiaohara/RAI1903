import juvenilU19 from "@/data/cantera-juvenil-u19-2526.json";
import {
  buildFilialMatchesFromFixtures,
  buildFilialStandingsFromMatches,
  buildFilialSummaryFromData,
} from "@/lib/cantera/filial-season-data";
import { getJuvenilASquadImport } from "@/lib/cantera-squad";
import {
  buildJuvenilSummary,
  slugifyCanteraTeamName,
} from "@/lib/cantera-data";
import type {
  FilialCompetitionConfigBundle,
  FilialFixturesBundle,
} from "@/lib/cms/filial-bundles";
import {
  buildTeamSeedsFromFixtures,
  resolveCanteraClubTeamId,
} from "@/lib/cms/filial-bundles";
import { DEFAULT_ZONE_COLORS } from "@/lib/cms/competition-config-bundle";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { bundleMapKey } from "@/lib/cms/season-bundles";
import type { CanteraSquadImport } from "@/types/cantera-squad-import";
import type { Match, Team } from "@/types";
import type { CompetitionId } from "@/types";
import type { CompetitionZoneRule } from "@/lib/cms/competition-config-bundle";
import type { StandingsLegendItem } from "@/lib/standings-styles";
import { buildZoneLegend } from "@/lib/competition/standings-zones";

export const JUVENIL_DEFAULT_COMPETITION_ID = "liga-nacional-juvenil" as CompetitionId;

type RawPartido = {
  fecha: string;
  local: string;
  visitante: string;
  goles_local: number | null;
  goles_visitante: number | null;
  estado: "finalizado" | "pendiente";
};

type RawJornada = {
  jornada: number;
  partidos: RawPartido[];
};

function getJuvenilSquadBundle(map: SeasonBundlesMap): CanteraSquadImport | null {
  const payload = map[bundleMapKey("juvenil", "squad")];
  return (payload as CanteraSquadImport | undefined) ?? null;
}

function getJuvenilFixturesBundle(map: SeasonBundlesMap): FilialFixturesBundle | null {
  const payload = map[bundleMapKey("juvenil", "fixtures")];
  return (payload as FilialFixturesBundle | undefined) ?? null;
}

function getJuvenilCompetitionConfigBundle(map: SeasonBundlesMap): FilialCompetitionConfigBundle | null {
  const payload = map[bundleMapKey("juvenil", "competition_config")];
  return (payload as FilialCompetitionConfigBundle | undefined) ?? null;
}

function buildJuvenilCalendarMatches(matches: Match[], clubTeamId: string): Match[] {
  return matches.filter((m) => m.homeTeamId === clubTeamId || m.awayTeamId === clubTeamId);
}

const JUVENIL_DEFAULT_CLUB_TEAM_ID = slugifyCanteraTeamName("Real Avilés U19");

export function defaultJuvenilCompetitionConfig(): FilialCompetitionConfigBundle {
  const fixtures = buildMockJuvenilFixturesFromRepo();
  return {
    teams: buildTeamSeedsFromFixtures(fixtures),
    zones: [
      {
        id: "promotion",
        label: "Ascenso",
        count: 1,
        from: "top",
        colorClass: DEFAULT_ZONE_COLORS.promotion,
      },
      {
        id: "playoff",
        label: "Playoff",
        count: 3,
        from: "top",
        colorClass: DEFAULT_ZONE_COLORS.playoff,
      },
      {
        id: "relegation",
        label: "Descenso",
        count: 2,
        from: "bottom",
        colorClass: DEFAULT_ZONE_COLORS.relegation,
      },
    ],
    leagueRounds: 30,
    ligaLabel: "Liga Nacional Juvenil",
    matchCompetition: JUVENIL_DEFAULT_COMPETITION_ID,
    clubTeamId: JUVENIL_DEFAULT_CLUB_TEAM_ID,
  };
}

export function resolveJuvenilCompetitionConfig(map: SeasonBundlesMap): FilialCompetitionConfigBundle {
  return getJuvenilCompetitionConfigBundle(map) ?? defaultJuvenilCompetitionConfig();
}

function buildMockJuvenilFixturesFromRepo(): FilialFixturesBundle {
  const raw = juvenilU19 as { competicion: string; temporada: string; jornadas: RawJornada[] };
  return {
    competicion: raw.competicion,
    temporada: raw.temporada,
    jornadas: raw.jornadas.map((jornada) => ({
      jornada: jornada.jornada,
      partidos: jornada.partidos.map((partido) => ({
        fecha: partido.fecha,
        hora: null,
        local: partido.local,
        visitante: partido.visitante,
        goles_local: partido.goles_local,
        goles_visitante: partido.goles_visitante,
        estado: partido.estado,
      })),
    })),
  };
}

export type JuvenilSeasonData = {
  squad: CanteraSquadImport;
  config: FilialCompetitionConfigBundle;
  fixtures: FilialFixturesBundle;
  allMatches: Match[];
  calendar: Match[];
  standings: Team[];
  summary: ReturnType<typeof buildJuvenilSummary>;
  zoneRules: CompetitionZoneRule[];
  zoneLegend: StandingsLegendItem[];
  seasonLabel: string;
  usesCms: boolean;
};

export function buildMockJuvenilSeasonData(seasonLabel: string): JuvenilSeasonData {
  const fixtures = buildMockJuvenilFixturesFromRepo();
  const config = defaultJuvenilCompetitionConfig();
  const clubTeamId = resolveCanteraClubTeamId(config, JUVENIL_DEFAULT_CLUB_TEAM_ID);
  const allMatches = buildFilialMatchesFromFixtures(fixtures, config);
  const standings = buildFilialStandingsFromMatches(allMatches, config);
  const calendar = buildJuvenilCalendarMatches(allMatches, clubTeamId);
  const summary = buildJuvenilSummary();

  return {
    squad: getJuvenilASquadImport(),
    config,
    fixtures,
    allMatches,
    calendar,
    standings,
    summary,
    zoneRules: config.zones,
    zoneLegend: buildZoneLegend(config.zones),
    seasonLabel,
    usesCms: false,
  };
}

export function resolveJuvenilSeasonData(bundles: SeasonBundlesMap, seasonLabel: string): JuvenilSeasonData {
  const hasCmsBundles = Boolean(
    bundles["juvenil:squad"] || bundles["juvenil:fixtures"] || bundles["juvenil:competition_config"],
  );

  if (!hasCmsBundles) {
    return buildMockJuvenilSeasonData(seasonLabel);
  }

  const cmsSquad = getJuvenilSquadBundle(bundles);
  const cmsFixtures = getJuvenilFixturesBundle(bundles);
  const cmsConfig = resolveJuvenilCompetitionConfig(bundles);
  const mock = buildMockJuvenilSeasonData(seasonLabel);

  const squad = cmsSquad?.plantilla?.length ? cmsSquad : mock.squad;
  const fixtures = cmsFixtures?.jornadas?.length ? cmsFixtures : mock.fixtures;
  const clubTeamId = resolveCanteraClubTeamId(cmsConfig, JUVENIL_DEFAULT_CLUB_TEAM_ID);
  const allMatches = buildFilialMatchesFromFixtures(fixtures, cmsConfig);
  const standings = buildFilialStandingsFromMatches(allMatches, cmsConfig);
  const calendar = buildJuvenilCalendarMatches(allMatches, clubTeamId);
  const summary = buildFilialSummaryFromData(
    standings,
    calendar,
    fixtures.competicion,
    clubTeamId,
  );

  return {
    squad,
    config: cmsConfig,
    fixtures,
    allMatches,
    calendar,
    standings,
    summary,
    zoneRules: cmsConfig.zones,
    zoneLegend: buildZoneLegend(cmsConfig.zones),
    seasonLabel,
    usesCms: hasCmsBundles,
  };
}

export function buildJuvenilMockBundleEntries(): Array<{
  scope: "juvenil";
  bundleKey: "squad" | "fixtures" | "competition_config";
  payload: unknown;
}> {
  const mock = buildMockJuvenilSeasonData("25/26");
  return [
    { scope: "juvenil", bundleKey: "squad", payload: mock.squad },
    { scope: "juvenil", bundleKey: "fixtures", payload: mock.fixtures },
    { scope: "juvenil", bundleKey: "competition_config", payload: mock.config },
  ];
}
