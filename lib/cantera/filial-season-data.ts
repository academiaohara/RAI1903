import {
  buildFilialTeamNameToId,
  FILIAL_DEFAULT_COMPETITION_ID,
  type FilialCompetitionConfigBundle,
  type FilialFixturePartido,
  type FilialFixturesBundle,
  resolveCanteraClubTeamId,
  resolveFilialCompetitionConfig,
} from "@/lib/cms/filial-bundles";
import { getFilialFixturesBundle, getFilialSquadBundle } from "@/lib/cms/filial-bundles";
import { zonesToLegacyConfig } from "@/lib/cms/competition-config-bundle";
import { applyCustomZoneColors } from "@/lib/competition/standings-zones";
import { FILIAL_TEAM_ID } from "@/lib/segunda-asturfutbol-2526";
import {
  SEGUNDA_ASTURFUTBOL_DATA,
  buildFilialSummary,
  buildSegundaAsturfutbolAllMatches,
  buildSegundaAsturfutbolFilialCalendar,
  buildSegundaAsturfutbolTable,
} from "@/lib/segunda-asturfutbol-2526";
import { getFilialBSquadImport } from "@/lib/cantera-squad";
import { computeStandings, type FinishedLeagueMatch } from "@/lib/standings";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import type { Match, Team } from "@/types";
import type { CanteraSquadImport } from "@/types/cantera-squad-import";
import type { CompetitionZoneRule } from "@/lib/cms/competition-config-bundle";
import type { StandingsLegendItem } from "@/lib/standings-styles";
import { buildZoneLegend } from "@/lib/competition/standings-zones";

function parseKickoffIso(fecha: string, hora: string | null | undefined): string {
  const [year, month, day] = fecha.split("-").map(Number);
  const [hours, minutes] = hora ? hora.split(":").map(Number) : [12, 0];
  return new Date(Date.UTC(year, month - 1, day, hours, minutes)).toISOString();
}

function resolveTeamId(name: string, nameToId: Record<string, string>): string {
  const known = nameToId[name];
  if (known) return known;
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function partidoToFinishedMatch(
  partido: FilialFixturePartido,
  jornada: number,
  index: number,
  nameToId: Record<string, string>,
  competitionId: string,
  teamById: Map<string, FilialCompetitionConfigBundle["teams"][number]>,
): Match | null {
  const finished =
    partido.estado === "finalizado" ||
    (partido.goles_local != null && partido.goles_visitante != null);
  const homeTeamId = resolveTeamId(partido.local, nameToId);
  const awayTeamId = resolveTeamId(partido.visitante, nameToId);
  const home = teamById.get(homeTeamId);
  const away = teamById.get(awayTeamId);

  const base: Match = {
    id: `filial-j${jornada}-${index}-${homeTeamId}-${awayTeamId}`,
    matchday: jornada,
    homeTeamId,
    awayTeamId,
    homeTeam: home?.name ?? partido.local,
    awayTeam: away?.name ?? partido.visitante,
    date: parseKickoffIso(partido.fecha, partido.hora ?? null),
    competition: competitionId as Match["competition"],
    venue: home?.stadium ?? partido.local,
    status: finished ? "finished" : "scheduled",
  };

  if (finished && partido.goles_local != null && partido.goles_visitante != null) {
    return {
      ...base,
      homeScore: partido.goles_local,
      awayScore: partido.goles_visitante,
    };
  }

  return base;
}

export function buildFilialMatchesFromFixtures(
  fixtures: FilialFixturesBundle,
  config: FilialCompetitionConfigBundle,
): Match[] {
  const nameToId = buildFilialTeamNameToId(config);
  const teamById = new Map(config.teams.map((team) => [team.id, team]));
  const competitionId = config.matchCompetition ?? FILIAL_DEFAULT_COMPETITION_ID;

  return [...fixtures.jornadas]
    .sort((a, b) => a.jornada - b.jornada)
    .flatMap((jornada) =>
      jornada.partidos.map((partido, index) =>
        partidoToFinishedMatch(partido, jornada.jornada, index, nameToId, competitionId, teamById),
      ),
    )
    .filter((match): match is Match => match !== null);
}

function finishedLeagueMatches(matches: Match[]): FinishedLeagueMatch[] {
  return matches.flatMap((match) => {
    if (match.status !== "finished" || match.homeScore === undefined || match.awayScore === undefined) {
      return [];
    }
    return [
      {
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        date: match.date,
      },
    ];
  });
}

function baseTeamFromSeed(seed: FilialCompetitionConfigBundle["teams"][number], position: number): Team {
  return {
    id: seed.id,
    name: seed.name,
    shortName: seed.shortName,
    city: seed.city ?? "Asturias",
    stadium: seed.stadium ?? "—",
    coach: "—",
    founded: 0,
    crestInitials: seed.crestInitials ?? seed.shortName.slice(0, 3).toUpperCase(),
    colors: seed.colors ?? ["#64748B", "#FFFFFF"],
    position,
    form: [],
    stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
  };
}

export function buildFilialStandingsFromMatches(
  matches: Match[],
  config: FilialCompetitionConfigBundle,
): Team[] {
  const teamIds = config.teams.map((team) => team.id);
  const zones = zonesToLegacyConfig(config.zones);
  const standings = computeStandings(teamIds, finishedLeagueMatches(matches), zones);
  const byId = new Map(standings.map((row) => [row.teamId, row]));
  const teams = config.teams
    .map((seed, index) => {
      const base = baseTeamFromSeed(seed, index + 1);
      const row = byId.get(seed.id);
      if (!row) return base;
      return {
        ...base,
        position: row.position,
        zone: row.zone,
        form: row.form,
        stats: {
          played: row.played,
          won: row.won,
          drawn: row.drawn,
          lost: row.lost,
          goalsFor: row.goalsFor,
          goalsAgainst: row.goalsAgainst,
          points: row.points,
        },
      };
    })
    .sort((a, b) => a.position - b.position);

  return applyCustomZoneColors(teams, config.zones);
}

export function buildFilialCalendarMatches(matches: Match[], clubTeamId: string): Match[] {
  return matches.filter((match) => match.homeTeamId === clubTeamId || match.awayTeamId === clubTeamId);
}

function formatFilialResultLine(match: Match, clubTeamId: string, clubTeamName: string): string {
  if (match.homeTeamId === clubTeamId) {
    return `${clubTeamName} ${match.homeScore}-${match.awayScore} ${match.awayTeam}`;
  }
  return `${match.homeTeam} ${match.homeScore}-${match.awayScore} ${clubTeamName}`;
}

export function buildFilialSummaryFromData(
  standings: Team[],
  calendar: Match[],
  category: string,
  clubTeamId: string = FILIAL_TEAM_ID,
): {
  category: string;
  position: string;
  lastResult: string;
  nextMatch: string;
} {
  const clubTeam = standings.find((team) => team.id === clubTeamId);
  const clubTeamName = clubTeam?.name ?? "Real Avilés";
  const finished = calendar.filter((m) => m.status === "finished");
  const lastMatch = finished.at(-1);
  const nextMatch = calendar.find((m) => m.status === "scheduled");

  return {
    category,
    position: clubTeam ? `${clubTeam.position}º - ${clubTeam.stats.points} pts` : "—",
    lastResult: lastMatch ? formatFilialResultLine(lastMatch, clubTeamId, clubTeamName) : "—",
    nextMatch: nextMatch ? `${nextMatch.homeTeam} - ${nextMatch.awayTeam}` : "Sin partidos programados",
  };
}

export type FilialSeasonData = {
  squad: CanteraSquadImport;
  config: FilialCompetitionConfigBundle;
  fixtures: FilialFixturesBundle;
  allMatches: Match[];
  calendar: Match[];
  standings: Team[];
  summary: ReturnType<typeof buildFilialSummaryFromData>;
  zoneRules: CompetitionZoneRule[];
  zoneLegend: StandingsLegendItem[];
  seasonLabel: string;
  usesCms: boolean;
};

export function buildMockFilialSeasonData(seasonLabel: string): FilialSeasonData {
  const config = resolveFilialCompetitionConfig({});
  const fixtures: FilialFixturesBundle = {
    competicion: SEGUNDA_ASTURFUTBOL_DATA.competicion,
    temporada: SEGUNDA_ASTURFUTBOL_DATA.temporada,
    jornadas: SEGUNDA_ASTURFUTBOL_DATA.jornadas.map((jornada) => ({
      jornada: jornada.jornada,
      partidos: jornada.partidos.map((partido) => ({
        fecha: partido.fecha,
        hora: partido.hora,
        local: partido.local,
        visitante: partido.visitante,
        goles_local: partido.goles_local,
        goles_visitante: partido.goles_visitante,
        estado: "finalizado" as const,
      })),
    })),
  };

  const standings = buildSegundaAsturfutbolTable();
  const calendar = buildSegundaAsturfutbolFilialCalendar();
  const summary = buildFilialSummary();

  return {
    squad: getFilialBSquadImport(),
    config,
    fixtures,
    allMatches: buildSegundaAsturfutbolAllMatches(),
    calendar,
    standings,
    summary,
    zoneRules: config.zones,
    zoneLegend: buildZoneLegend(config.zones),
    seasonLabel,
    usesCms: false,
  };
}

export function resolveFilialSeasonData(bundles: SeasonBundlesMap, seasonLabel: string): FilialSeasonData {
  const hasCmsBundles = Boolean(
    bundles["filial:squad"] || bundles["filial:fixtures"] || bundles["filial:competition_config"],
  );

  if (!hasCmsBundles) {
    return buildMockFilialSeasonData(seasonLabel);
  }

  const cmsSquad = getFilialSquadBundle(bundles);
  const cmsFixtures = getFilialFixturesBundle(bundles);
  const cmsConfig = resolveFilialCompetitionConfig(bundles);
  const mock = buildMockFilialSeasonData(seasonLabel);

  const squad = cmsSquad?.plantilla?.length ? cmsSquad : mock.squad;
  const fixtures = cmsFixtures?.jornadas?.length ? cmsFixtures : mock.fixtures;
  const clubTeamId = resolveCanteraClubTeamId(cmsConfig, FILIAL_TEAM_ID);
  const allMatches = buildFilialMatchesFromFixtures(fixtures, cmsConfig);
  const standings = buildFilialStandingsFromMatches(allMatches, cmsConfig);
  const calendar = buildFilialCalendarMatches(allMatches, clubTeamId);
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

export function buildFilialMockBundleEntries(): Array<{
  scope: "filial";
  bundleKey: "squad" | "fixtures" | "competition_config";
  payload: unknown;
}> {
  const mock = buildMockFilialSeasonData("25/26");
  return [
    { scope: "filial", bundleKey: "squad", payload: mock.squad },
    { scope: "filial", bundleKey: "fixtures", payload: mock.fixtures },
    { scope: "filial", bundleKey: "competition_config", payload: mock.config },
  ];
}
