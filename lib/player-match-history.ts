import { getAvilesMatchesByGender, getRaiTeamId } from "@/lib/fixtures";
import { matchCompetitionShortLabel } from "@/lib/competition-labels";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { Match } from "@/types";
import type { PlayerMatchRecord } from "@/types/squad";

type PlayerMatchStats = {
  id: string;
  partidos: number;
  minutos: number;
  goles: number;
  asistencias: number;
  amarillas: number;
  rojas: number;
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

function rivalFromMatch(match: Match, raiTeamId: string): string {
  return match.homeTeamId === raiTeamId ? match.awayTeam : match.homeTeam;
}

function pickPlayedIndices(playerId: string, total: number, appearances: number): Set<number> {
  const played = new Set<number>();
  if (appearances <= 0 || total <= 0) return played;

  const target = Math.min(appearances, total);
  for (let i = 0; i < total && played.size < target; i += 1) {
    const slot = (hashString(`${playerId}-slot-${i}`) + i * 7) % total;
    played.add(slot);
  }

  let cursor = 0;
  while (played.size < target) {
    played.add(cursor % total);
    cursor += 1;
  }

  return played;
}

function distributeStat(
  playerId: string,
  statKey: string,
  playedIndices: readonly number[],
  total: number,
): Map<number, number> {
  const result = new Map<number, number>();
  if (total <= 0) return result;

  const ranked = [...playedIndices].sort(
    (a, b) => hashString(`${playerId}-${statKey}-${a}`) - hashString(`${playerId}-${statKey}-${b}`),
  );

  for (let i = 0; i < total; i += 1) {
    const index = ranked[i % ranked.length];
    result.set(index, (result.get(index) ?? 0) + 1);
  }

  return result;
}

export function buildPlayerMatchHistory(
  player: PlayerMatchStats,
  gender: PrimerEquipoGender = "masculino",
): PlayerMatchRecord[] {
  const raiTeamId = getRaiTeamId(gender);
  const fixtures = getAvilesMatchesByGender(gender).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  if (fixtures.length === 0) return [];

  const playedIndices = pickPlayedIndices(player.id, fixtures.length, player.partidos);
  const playedList = [...playedIndices].sort((a, b) => a - b);

  const goalsByIndex = distributeStat(player.id, "goals", playedList, player.goles);
  const assistsByIndex = distributeStat(player.id, "assists", playedList, player.asistencias);
  const yellowsByIndex = distributeStat(player.id, "yellows", playedList, player.amarillas);
  const redsByIndex = distributeStat(player.id, "reds", playedList, player.rojas);

  const playedCount = playedList.length;
  const baseMinutes = playedCount > 0 ? Math.floor(player.minutos / playedCount) : 0;
  const minutesRemainder = playedCount > 0 ? player.minutos - baseMinutes * playedCount : 0;
  let playedCursor = 0;

  const records = fixtures.map((match, index) => {
    const played = playedIndices.has(index);
    if (!played) {
    return {
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
    }

    playedCursor += 1;
    const minutes = baseMinutes + (playedCursor <= minutesRemainder ? 1 : 0);

    return {
      fecha: toDateKey(match.date),
      rival: rivalFromMatch(match, raiTeamId),
      competicion: matchCompetitionShortLabel(match),
      competitionId: match.competition,
      minutos: minutes,
      goles: goalsByIndex.get(index) ?? 0,
      asistencias: assistsByIndex.get(index) ?? 0,
      amarillas: yellowsByIndex.get(index) ?? 0,
      rojas: redsByIndex.get(index) ?? 0,
    };
  });

  return records.reverse();
}

export function mergeMatchHistoryOverrides(
  base: PlayerMatchRecord[],
  overrides: PlayerMatchRecord[],
): PlayerMatchRecord[] {
  const byFecha = new Map(overrides.map((row) => [row.fecha, row]));
  const byRival = new Map(overrides.map((row) => [row.rival.toLowerCase(), row]));

  return base.map((row) => {
    const exact = byFecha.get(row.fecha);
    if (exact) return exact;

    const byName = byRival.get(row.rival.toLowerCase());
    if (byName && byName.fecha === row.fecha) return byName;

    return row;
  });
}
