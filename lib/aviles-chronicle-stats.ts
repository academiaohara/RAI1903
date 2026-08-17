import { isGoalEventType } from "@/lib/match-events";
import { getAvilesMatchesByGender, getMatchById, getRaiTeamId } from "@/lib/fixtures";
import { applyMatchInlineOverride } from "@/lib/fixture-overrides";
import { buildMatchDetail } from "@/lib/match-detail";
import { matchCompetitionShortLabel } from "@/lib/competition-labels";
import { isMatchPlayed } from "@/lib/match-result";
import { findMatchInBundles } from "@/lib/season/find-match-in-bundles";
import { findSquadPlayerByDorsal, findSquadPlayerByName } from "@/lib/squad-lineup";
import { resolveSquadPlayerByName } from "@/lib/squad-player-resolve";
import { getPlayerDisplayName } from "@/lib/squad-utils";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { LineupPlayer, Match, MatchEvent, MatchLineup } from "@/types";
import type { PlayerMatchRecord, SquadPlayer } from "@/types/squad";

export type ChronicleAggregatedStats = {
  partidos: number;
  minutos: number;
  goles: number;
  asistencias: number;
  amarillas: number;
  rojas: number;
  historialPartidos: PlayerMatchRecord[];
};

type MutableStats = ChronicleAggregatedStats & {
  playedMatchIds: Set<string>;
  matchRows: Map<string, PlayerMatchRecord>;
};

function matchEventsKey(matchId: string) {
  return `match:${matchId}:events`;
}

function matchLineupKey(matchId: string, side: "home" | "away") {
  return `match:${matchId}:${side === "home" ? "homeLineup" : "awayLineup"}`;
}

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

function rivalFromMatch(match: Match, raiTeamId: string): string {
  return match.homeTeamId === raiTeamId ? match.awayTeam : match.homeTeam;
}

function emptyMutable(): MutableStats {
  return {
    partidos: 0,
    minutos: 0,
    goles: 0,
    asistencias: 0,
    amarillas: 0,
    rojas: 0,
    historialPartidos: [],
    playedMatchIds: new Set(),
    matchRows: new Map(),
  };
}

function ensurePlayerStats(
  map: Map<string, MutableStats>,
  squad: SquadPlayer[],
  playerId: string,
): MutableStats {
  const existing = map.get(playerId);
  if (existing) return existing;

  const player = squad.find((entry) => entry.id === playerId);
  if (!player) {
    const fallback = emptyMutable();
    map.set(playerId, fallback);
    return fallback;
  }

  const created = emptyMutable();
  map.set(playerId, created);
  return created;
}

function ensureMatchRow(
  stats: MutableStats,
  match: Match,
  raiTeamId: string,
): PlayerMatchRecord {
  const existing = stats.matchRows.get(match.id);
  if (existing) return existing;

  const row: PlayerMatchRecord = {
    fecha: toDateKey(match.date),
    rival: rivalFromMatch(match, raiTeamId),
    competicion: matchCompetitionShortLabel(match),
    competitionId: match.competition,
    minutos: 0,
    goles: 0,
    asistencias: 0,
    amarillas: 0,
    rojas: 0,
  };

  stats.matchRows.set(match.id, row);
  stats.historialPartidos.push(row);

  if (!stats.playedMatchIds.has(match.id)) {
    stats.playedMatchIds.add(match.id);
    stats.partidos += 1;
  }

  return row;
}

function setMatchMinutes(
  stats: MutableStats,
  match: Match,
  raiTeamId: string,
  minutes: number,
  onBench = false,
): void {
  const row = ensureMatchRow(stats, match, raiTeamId);
  const delta = minutes - row.minutos;
  row.minutos = minutes;
  row.onBench = onBench && minutes === 0;
  stats.minutos += delta;
}

function lastHistorialRow(stats: MutableStats): PlayerMatchRecord | undefined {
  return stats.historialPartidos[stats.historialPartidos.length - 1];
}

function resolvePlayerId(squad: SquadPlayer[], name: string): string | undefined {
  return resolveSquadPlayerByName(squad, name)?.id;
}

function resolveLineupPlayerId(squad: SquadPlayer[], entry: LineupPlayer): string | undefined {
  if (entry.number > 0) {
    const byDorsal = findSquadPlayerByDorsal(squad, entry.number);
    if (byDorsal) return byDorsal.id;
  }
  return findSquadPlayerByName(squad, entry.name)?.id;
}

function isLineupStarter(lineup: MatchLineup, entry: LineupPlayer): boolean {
  return lineup.starters.some(
    (starter) =>
      (entry.number > 0 && starter.number === entry.number) ||
      starter.name.trim().toLowerCase() === entry.name.trim().toLowerCase(),
  );
}

const CHRONICLE_OVERRIDE_KEY = /^match:([^:]+):(events|homeLineup|awayLineup)$/;

/** Partidos con alineación o eventos guardados en overrides (aunque no estén en el calendario cargado). */
export function matchIdsWithChronicleOverrides(overrides: Record<string, unknown>): string[] {
  const ids = new Set<string>();
  for (const key of Object.keys(overrides)) {
    const match = CHRONICLE_OVERRIDE_KEY.exec(key);
    if (match) ids.add(match[1]);
  }
  return [...ids];
}

export type BuildChronicleAggregationMatchesOptions = {
  gender: PrimerEquipoGender;
  seasonMatches: Match[];
  overrides: Record<string, unknown>;
  bundles: SeasonBundlesMap;
  getOverride: (key: string) => unknown;
};

/** Calendario de la temporada + partidos referenciados solo en overrides de crónica. */
export function buildChronicleAggregationMatches({
  gender,
  seasonMatches,
  overrides,
  bundles,
  getOverride,
}: BuildChronicleAggregationMatchesOptions): Match[] {
  const raiTeamId = getRaiTeamId(gender);
  const byId = new Map<string, Match>();

  const addMatch = (raw: Match | undefined) => {
    if (!raw) return;
    const match = applyMatchInlineOverride(raw, getOverride, gender);
    if (match.homeTeamId !== raiTeamId && match.awayTeamId !== raiTeamId) return;
    byId.set(match.id, match);
  };

  for (const raw of seasonMatches) addMatch(raw);

  for (const matchId of matchIdsWithChronicleOverrides(overrides)) {
    if (byId.has(matchId)) continue;
    const fromBundles = findMatchInBundles(bundles, matchId, { gender, mapMatch: (m) => m });
    addMatch(fromBundles ?? getMatchById(matchId));
  }

  return [...byId.values()];
}

export function aggregateAvilesStatsFromChronicles(
  gender: PrimerEquipoGender,
  squad: SquadPlayer[],
  getOverride: <T>(key: string) => T | undefined,
  matches: Match[] = getAvilesMatchesByGender(gender),
): Map<string, ChronicleAggregatedStats> | null {
  const raiTeamId = getRaiTeamId(gender);
  const map = new Map<string, MutableStats>();
  let hasChronicleData = false;

  for (const match of matches) {
    const events = getOverride<MatchEvent[]>(matchEventsKey(match.id)) ?? [];
    const avilesSide: "home" | "away" = match.homeTeamId === raiTeamId ? "home" : "away";
    const detail = buildMatchDetail(match, gender);
    const defaultLineup = avilesSide === "home" ? detail.homeLineup : detail.awayLineup;
    const avilesLineup =
      getOverride<MatchLineup>(matchLineupKey(match.id, avilesSide)) ?? defaultLineup;

    const hasLineup = avilesLineup.starters.length > 0 || avilesLineup.bench.length > 0;
    const hasChronicle = events.length > 0 || hasLineup;
    if (!hasChronicle && !isMatchPlayed(match)) continue;

    hasChronicleData = true;

    if (hasLineup && avilesLineup) {
      for (const entry of [...avilesLineup.starters, ...avilesLineup.bench]) {
        const playerId = resolveLineupPlayerId(squad, entry);
        if (!playerId) continue;
        const stats = ensurePlayerStats(map, squad, playerId);
        const isStarter = isLineupStarter(avilesLineup, entry);
        setMatchMinutes(stats, match, raiTeamId, isStarter ? 90 : 0, !isStarter);
      }
    }

    for (const event of events) {
      if (event.team !== avilesSide) continue;

      if (isGoalEventType(event.type)) {
        const scorerId = resolvePlayerId(squad, event.player);
        if (scorerId) {
          const stats = ensurePlayerStats(map, squad, scorerId);
          if (!stats.playedMatchIds.has(match.id)) setMatchMinutes(stats, match, raiTeamId, 90);
          stats.goles += 1;
          const row = stats.matchRows.get(match.id) ?? lastHistorialRow(stats);
          if (row) row.goles += 1;

          if (event.detail) {
            const assistId = resolvePlayerId(squad, event.detail);
            if (assistId) {
              const assistStats = ensurePlayerStats(map, squad, assistId);
              if (!assistStats.playedMatchIds.has(match.id)) setMatchMinutes(assistStats, match, raiTeamId, 90);
              assistStats.asistencias += 1;
              const assistRow = assistStats.matchRows.get(match.id) ?? lastHistorialRow(assistStats);
              if (assistRow) assistRow.asistencias += 1;
            }
          }
        }
        continue;
      }

      if (event.type === "yellow" || event.type === "red") {
        const playerId = resolvePlayerId(squad, event.player);
        if (!playerId) continue;
        const stats = ensurePlayerStats(map, squad, playerId);
        if (!stats.playedMatchIds.has(match.id)) setMatchMinutes(stats, match, raiTeamId, 90);
        const row = stats.matchRows.get(match.id) ?? ensureMatchRow(stats, match, raiTeamId);
        if (event.type === "yellow") {
          stats.amarillas += 1;
          row.amarillas += 1;
        } else {
          stats.rojas += 1;
          row.rojas += 1;
        }
        continue;
      }

      if (event.type === "substitution") {
        const inId = resolvePlayerId(squad, event.player);
        if (inId) {
          const stats = ensurePlayerStats(map, squad, inId);
          setMatchMinutes(stats, match, raiTeamId, Math.max(0, 90 - event.minute), false);
        }
        if (event.detail) {
          const outId = resolvePlayerId(squad, event.detail);
          if (outId) {
            const stats = ensurePlayerStats(map, squad, outId);
            setMatchMinutes(stats, match, raiTeamId, Math.min(90, event.minute), false);
          }
        }
      }
    }
  }

  if (!hasChronicleData) return null;

  const result = new Map<string, ChronicleAggregatedStats>();
  for (const [playerId, stats] of map) {
    result.set(playerId, {
      partidos: stats.partidos,
      minutos: stats.minutos,
      goles: stats.goles,
      asistencias: stats.asistencias,
      amarillas: stats.amarillas,
      rojas: stats.rojas,
      historialPartidos: [...stats.historialPartidos].reverse(),
    });
  }

  return result;
}

export function applyChronicleStatsToSquad(
  squad: SquadPlayer[],
  chronicleStats: Map<string, ChronicleAggregatedStats> | null,
): SquadPlayer[] {
  if (!chronicleStats || chronicleStats.size === 0) return squad;

  return squad.map((player) => {
    const stats = chronicleStats.get(player.id);
    if (!stats) return player;

    return {
      ...player,
      partidos: stats.partidos,
      minutos: stats.minutos,
      goles: stats.goles,
      asistencias: stats.asistencias,
      amarillas: stats.amarillas,
      rojas: stats.rojas,
      historialPartidos: stats.historialPartidos,
    };
  });
}

/** Resuelve nombres de eventos JSON al nombre de plantilla usando dorsal o nombre. */
export function resolveEventPlayersWithSquad(
  events: MatchEvent[],
  squad: SquadPlayer[],
): MatchEvent[] {
  const resolveName = (name: string, dorsal?: number): string => {
    if (dorsal && dorsal > 0) {
      const byDorsal = findSquadPlayerByDorsal(squad, dorsal);
      if (byDorsal) return getPlayerDisplayName(byDorsal);
    }
    const resolved = resolveSquadPlayerByName(squad, name);
    return resolved ? getPlayerDisplayName(resolved) : name;
  };

  return events.map((event) => {
    const playerDorsal = extractDorsalFromName(event.player);
    const detailDorsal = event.detail ? extractDorsalFromName(event.detail) : undefined;
    return {
      ...event,
      player: resolveName(event.player, playerDorsal),
      ...(event.detail ? { detail: resolveName(event.detail, detailDorsal) } : {}),
    };
  });
}

function extractDorsalFromName(name: string): number | undefined {
  const match = /^#?(\d{1,2})\s/.exec(name.trim());
  if (match) return Number(match[1]);
  return undefined;
}
