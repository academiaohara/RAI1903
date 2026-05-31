import { getAvilesMatchesByGender, getRaiTeamId } from "@/lib/fixtures";
import { buildMatchDetail } from "@/lib/match-detail";
import { matchCompetitionShortLabel } from "@/lib/competition-labels";
import { resolveSquadPlayerByName } from "@/lib/squad-player-resolve";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Match, MatchEvent, MatchLineup } from "@/types";
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

type MutableStats = ChronicleAggregatedStats & { playedMatchIds: Set<string> };

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

function registerAppearance(
  stats: MutableStats,
  match: Match,
  raiTeamId: string,
  minutes: number,
): void {
  if (stats.playedMatchIds.has(match.id)) return;
  stats.playedMatchIds.add(match.id);
  stats.partidos += 1;
  stats.minutos += minutes;
  stats.historialPartidos.push({
    fecha: toDateKey(match.date),
    rival: rivalFromMatch(match, raiTeamId),
    competicion: matchCompetitionShortLabel(match),
    minutos: minutes,
    goles: 0,
    asistencias: 0,
    amarillas: 0,
    rojas: 0,
  });
}

function lastHistorialRow(stats: MutableStats): PlayerMatchRecord | undefined {
  return stats.historialPartidos[stats.historialPartidos.length - 1];
}

function resolvePlayerId(squad: SquadPlayer[], name: string): string | undefined {
  return resolveSquadPlayerByName(squad, name)?.id;
}

export function aggregateAvilesStatsFromChronicles(
  gender: PrimerEquipoGender,
  squad: SquadPlayer[],
  getOverride: <T>(key: string) => T | undefined,
): Map<string, ChronicleAggregatedStats> | null {
  const raiTeamId = getRaiTeamId(gender);
  const finished = getAvilesMatchesByGender(gender).filter((match) => match.status === "finished");
  const map = new Map<string, MutableStats>();
  let hasChronicleData = false;

  for (const match of finished) {
    const events = getOverride<MatchEvent[]>(matchEventsKey(match.id)) ?? [];
    const avilesSide: "home" | "away" = match.homeTeamId === raiTeamId ? "home" : "away";
    const detail = buildMatchDetail(match, gender);
    const defaultLineup = avilesSide === "home" ? detail.homeLineup : detail.awayLineup;
    const avilesLineup =
      getOverride<MatchLineup>(matchLineupKey(match.id, avilesSide)) ?? defaultLineup;

    const hasLineup = avilesLineup.starters.length > 0 || avilesLineup.bench.length > 0;
    if (events.length === 0 && !hasLineup) continue;

    hasChronicleData = true;

    if (hasLineup && avilesLineup) {
      for (const entry of [...avilesLineup.starters, ...avilesLineup.bench]) {
        const playerId = resolvePlayerId(squad, entry.name);
        if (!playerId) continue;
        const stats = ensurePlayerStats(map, squad, playerId);
        const minutes = avilesLineup.starters.some((starter) => starter.name === entry.name) ? 90 : 0;
        registerAppearance(stats, match, raiTeamId, minutes > 0 ? minutes : 1);
      }
    }

    for (const event of events) {
      if (event.team !== avilesSide) continue;

      if (event.type === "goal") {
        const scorerId = resolvePlayerId(squad, event.player);
        if (scorerId) {
          const stats = ensurePlayerStats(map, squad, scorerId);
          if (!stats.playedMatchIds.has(match.id)) registerAppearance(stats, match, raiTeamId, 90);
          stats.goles += 1;
          const row = lastHistorialRow(stats);
          if (row) row.goles += 1;

          if (event.detail) {
            const assistId = resolvePlayerId(squad, event.detail);
            if (assistId) {
              const assistStats = ensurePlayerStats(map, squad, assistId);
              if (!assistStats.playedMatchIds.has(match.id)) registerAppearance(assistStats, match, raiTeamId, 90);
              assistStats.asistencias += 1;
              const assistRow = lastHistorialRow(assistStats);
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
        if (!stats.playedMatchIds.has(match.id)) registerAppearance(stats, match, raiTeamId, 90);
        if (event.type === "yellow") {
          stats.amarillas += 1;
          const row = lastHistorialRow(stats);
          if (row) row.amarillas += 1;
        } else {
          stats.rojas += 1;
          const row = lastHistorialRow(stats);
          if (row) row.rojas += 1;
        }
        continue;
      }

      if (event.type === "substitution") {
        const inId = resolvePlayerId(squad, event.player);
        if (inId) {
          const stats = ensurePlayerStats(map, squad, inId);
          registerAppearance(stats, match, raiTeamId, Math.max(1, 90 - event.minute));
        }
        if (event.detail) {
          const outId = resolvePlayerId(squad, event.detail);
          if (outId) {
            const stats = ensurePlayerStats(map, squad, outId);
            registerAppearance(stats, match, raiTeamId, Math.min(90, event.minute));
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
