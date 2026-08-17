import {
  type ClubMatchJsonContext,
  isAvilesStorageTeam,
  storageTeamToClubJsonTeam,
  clubSideToStorageTeam,
} from "@/lib/match-center/club-match-json";
import { createMatchEventId } from "@/lib/match-events";
import { findSquadPlayerByDorsal } from "@/lib/squad-lineup";
import { resolveSquadPlayerByName } from "@/lib/squad-player-resolve";
import { getPlayerDisplayName } from "@/lib/squad-utils";
import type { LineupPlayer, MatchEvent, MatchEventType, MatchLineup, MatchStatCategory, MatchStatRow } from "@/types";
import type { SquadPlayer } from "@/types/squad";

export type ParseMatchJsonResult<T> =
  | { ok: true; data: T; summary: string }
  | { ok: false; error: string };

function parseJsonInput(input: string): ParseMatchJsonResult<unknown> {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "El JSON está vacío." };
  }
  try {
    return { ok: true, data: JSON.parse(trimmed), summary: "" };
  } catch {
    return { ok: false, error: "JSON inválido. Revisa comas, comillas y llaves." };
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function readString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

const EVENT_TYPE_ALIASES: Record<string, MatchEventType> = {
  goal: "goal",
  gol: "goal",
  goals: "goal",
  goal_penalty: "goal_penalty",
  penalti: "goal_penalty",
  penalty: "goal_penalty",
  gol_penalti: "goal_penalty",
  "gol de penalti": "goal_penalty",
  goal_free_kick: "goal_free_kick",
  falta: "goal_free_kick",
  free_kick: "goal_free_kick",
  gol_falta: "goal_free_kick",
  tiro_libre: "goal_free_kick",
  "gol de falta": "goal_free_kick",
  goal_disallowed: "goal_disallowed",
  gol_anulado: "goal_disallowed",
  "gol anulado": "goal_disallowed",
  post: "post",
  palo: "post",
  tiro_palo: "post",
  "tiro al palo": "post",
  yellow: "yellow",
  amarilla: "yellow",
  tarjeta_amarilla: "yellow",
  "tarjeta amarilla": "yellow",
  red: "red",
  roja: "red",
  tarjeta_roja: "red",
  "tarjeta roja": "red",
  red_disallowed: "red_disallowed",
  roja_anulada: "red_disallowed",
  "roja anulada": "red_disallowed",
  substitution: "substitution",
  cambio: "substitution",
  sustitucion: "substitution",
  sustitución: "substitution",
  sub: "substitution",
};

function parseEventType(value: unknown): MatchEventType | null {
  const raw = readString(value);
  if (!raw) return null;
  return EVENT_TYPE_ALIASES[raw.toLowerCase()] ?? null;
}

function parseEventTeam(value: unknown, context?: ClubMatchJsonContext): "home" | "away" | null {
  const raw = readString(value);
  if (!raw) return null;
  const normalized = raw.toLowerCase();
  if (context) {
    const clubSide = clubSideToStorageTeam(
      normalized as "aviles" | "local" | "visitante" | "home" | "away",
      context,
    );
    if (clubSide) return clubSide;
  }
  if (normalized === "home" || normalized === "local" || normalized === "h" || normalized === "casa") {
    return "home";
  }
  if (normalized === "away" || normalized === "visitante" || normalized === "a" || normalized === "fuera") {
    return "away";
  }
  if (normalized === "aviles" || normalized === "avilés") {
    return context ? (context.avilesIsHome ? "home" : "away") : null;
  }
  return null;
}

function extractEventsArray(payload: unknown): unknown[] | null {
  if (Array.isArray(payload)) return payload;
  const record = asRecord(payload);
  if (!record) return null;
  const nested = record.events ?? record.eventos;
  return Array.isArray(nested) ? nested : null;
}

function resolvePlayerNameFromJson(
  name: string,
  dorsal: number | null,
  squad?: SquadPlayer[],
): string {
  if (squad?.length) {
    if (dorsal !== null && dorsal > 0) {
      const byDorsal = findSquadPlayerByDorsal(squad, dorsal);
      if (byDorsal) return getPlayerDisplayName(byDorsal);
    }
    const resolved = resolveSquadPlayerByName(squad, name);
    if (resolved) return getPlayerDisplayName(resolved);
  }
  if (dorsal !== null && dorsal > 0) return `#${dorsal} ${name}`;
  return name;
}

function parseMatchEvent(
  raw: unknown,
  index: number,
  options?: { squad?: SquadPlayer[]; context?: ClubMatchJsonContext },
): MatchEvent | string {
  const record = asRecord(raw);
  if (!record) {
    return `Evento ${index + 1}: debe ser un objeto.`;
  }

  const minute = readNumber(record.minute ?? record.minuto ?? record.min);
  if (minute === null || minute < 0) {
    return `Evento ${index + 1}: falta un minuto válido (minute / minuto).`;
  }

  const type = parseEventType(record.type ?? record.tipo);
  if (!type) {
    return `Evento ${index + 1}: tipo no reconocido (goal, penalti, falta, yellow, red, substitution…).`;
  }

  const team = parseEventTeam(record.team ?? record.equipo ?? record.side, options?.context);
  if (!team) {
    const teamHint = options?.context
      ? `aviles o ${options.context.rivalKey}`
      : "home/local o away/visitante";
    return `Evento ${index + 1}: equipo no reconocido (${teamHint}).`;
  }

  const rawPlayer = readString(record.player ?? record.jugador ?? record.nombre);
  if (!rawPlayer) {
    return `Evento ${index + 1}: falta el jugador (player / jugador).`;
  }

  const playerDorsal = readNumber(record.dorsal ?? record.numero ?? record.number);
  const resolveSquad =
    options?.context && options.squad?.length && isAvilesStorageTeam(team, options.context)
      ? options.squad
      : undefined;
  const player = resolvePlayerNameFromJson(rawPlayer, playerDorsal, resolveSquad);

  const rawDetail =
    readString(
      record.detail ??
        record.detalle ??
        record.asistencia ??
        record.assist ??
        record.sale ??
        record.out,
    ) ?? undefined;

  let detail: string | undefined;
  if (rawDetail) {
    const detailDorsal = readNumber(
      record.detail_dorsal ?? record.sale_dorsal ?? record.out_dorsal ?? record.asistencia_dorsal,
    );
    detail = resolvePlayerNameFromJson(rawDetail, detailDorsal, resolveSquad);
  }

  const id = readString(record.id) ?? createMatchEventId();

  return {
    id,
    minute: Math.round(minute),
    type,
    team,
    player,
    ...(detail ? { detail } : {}),
  };
}

export function serializeMatchEvents(events: MatchEvent[], context?: ClubMatchJsonContext): string {
  const payload = events.map((event) => {
    const entry: Record<string, unknown> = {
      minute: event.minute,
      type: event.type,
      team: context ? storageTeamToClubJsonTeam(event.team, context) : event.team,
      player: event.player,
    };
    if (event.detail) entry.detail = event.detail;
    return entry;
  });
  return JSON.stringify(payload, null, 2);
}

export function serializeMatchLineups(
  home?: MatchLineup,
  away?: MatchLineup,
  context?: ClubMatchJsonContext,
): string {
  const payload: Record<string, unknown> = {};
  const writeSide = (side: "home" | "away", lineup: MatchLineup) => {
    const key = context ? storageTeamToClubJsonTeam(side, context) : side;
    payload[key] = {
      formation: lineup.formation,
      starters: lineup.starters.map((p) => ({ number: p.number, name: p.name })),
      bench: lineup.bench.map((p) => ({ number: p.number, name: p.name })),
    };
  };
  if (home) writeSide("home", home);
  if (away) writeSide("away", away);
  return JSON.stringify(payload, null, 2);
}

export function parseMatchEventsJson(
  input: string,
  squad?: SquadPlayer[],
  context?: ClubMatchJsonContext,
): ParseMatchJsonResult<MatchEvent[]> {
  const parsed = parseJsonInput(input);
  if (!parsed.ok) return parsed;

  const items = extractEventsArray(parsed.data);
  if (!items) {
    return {
      ok: false,
      error: 'Formato esperado: array de eventos o { "events": [ … ] }.',
    };
  }

  if (items.length === 0) {
    return { ok: false, error: "El array de eventos está vacío." };
  }

  const events: MatchEvent[] = [];
  for (let index = 0; index < items.length; index += 1) {
    const result = parseMatchEvent(items[index], index, { squad, context });
    if (typeof result === "string") {
      return { ok: false, error: result };
    }
    events.push(result);
  }

  return {
    ok: true,
    data: events,
    summary: `${events.length} evento${events.length === 1 ? "" : "s"}`,
  };
}

function parseStatRow(raw: unknown, index: number): MatchStatRow | string {
  const record = asRecord(raw);
  if (!record) {
    return `Fila ${index + 1}: debe ser un objeto.`;
  }

  const label = readString(record.label ?? record.etiqueta ?? record.nombre ?? record.name);
  if (!label) {
    return `Fila ${index + 1}: falta la etiqueta (label / etiqueta).`;
  }

  const home = record.home ?? record.local ?? record.casa;
  const away = record.away ?? record.visitante ?? record.fuera;
  if (home === undefined || away === undefined) {
    return `Fila ${index + 1}: faltan valores local y visitante (home/local, away/visitante).`;
  }

  const homeValue = typeof home === "string" || typeof home === "number" ? home : null;
  const awayValue = typeof away === "string" || typeof away === "number" ? away : null;
  if (homeValue === null || awayValue === null) {
    return `Fila ${index + 1}: los valores deben ser número o texto.`;
  }

  return { label, home: homeValue, away: awayValue };
}

function parseStatCategory(raw: unknown, index: number): MatchStatCategory | string {
  const record = asRecord(raw);
  if (!record) {
    return `Categoría ${index + 1}: debe ser un objeto.`;
  }

  const rowsRaw = record.rows ?? record.filas ?? record.stats ?? record.estadisticas;
  if (!Array.isArray(rowsRaw) || rowsRaw.length === 0) {
    return `Categoría ${index + 1}: falta un array "rows" con al menos una fila.`;
  }

  const rows: MatchStatRow[] = [];
  for (let rowIndex = 0; rowIndex < rowsRaw.length; rowIndex += 1) {
    const row = parseStatRow(rowsRaw[rowIndex], rowIndex);
    if (typeof row === "string") {
      return `Categoría ${index + 1}: ${row}`;
    }
    rows.push(row);
  }

  const title = readString(record.title ?? record.titulo ?? record.categoria) ?? "Estadísticas";
  return { title, rows };
}

function extractStatCategories(payload: unknown): unknown[] | null {
  if (Array.isArray(payload)) {
    if (payload.length === 0) return [];
    const first = payload[0];
    const firstRecord = asRecord(first);
    if (firstRecord && (firstRecord.rows || firstRecord.filas || firstRecord.label || firstRecord.etiqueta)) {
      if (firstRecord.rows || firstRecord.filas) {
        return payload;
      }
      return [{ title: "Estadísticas", rows: payload }];
    }
    return payload;
  }

  const record = asRecord(payload);
  if (!record) return null;

  const nested = record.categories ?? record.categorias ?? record.stats ?? record.estadisticas;
  if (Array.isArray(nested)) return nested;

  if (record.rows || record.filas) {
    return [record];
  }

  return null;
}

export function parseMatchStatsJson(input: string): ParseMatchJsonResult<MatchStatCategory[]> {
  const parsed = parseJsonInput(input);
  if (!parsed.ok) return parsed;

  const items = extractStatCategories(parsed.data);
  if (!items) {
    return {
      ok: false,
      error:
        'Formato esperado: array de categorías, filas sueltas, { "rows": [ … ] } o { "categories": [ … ] }.',
    };
  }

  if (items.length === 0) {
    return { ok: false, error: "No hay estadísticas en el JSON." };
  }

  const categories: MatchStatCategory[] = [];
  let totalRows = 0;
  for (let index = 0; index < items.length; index += 1) {
    const result = parseStatCategory(items[index], index);
    if (typeof result === "string") {
      return { ok: false, error: result };
    }
    categories.push(result);
    totalRows += result.rows.length;
  }

  return {
    ok: true,
    data: categories,
    summary: `${totalRows} fila${totalRows === 1 ? "" : "s"} en ${categories.length} categoría${categories.length === 1 ? "" : "s"}`,
  };
}

function parseLineupPlayer(raw: unknown, index: number, squad?: SquadPlayer[]): LineupPlayer | string {
  const record = asRecord(raw);
  if (!record) {
    return `Jugador ${index + 1}: debe ser un objeto.`;
  }

  const rawName = readString(record.name ?? record.nombre ?? record.jugador ?? record.player);
  if (!rawName) {
    return `Jugador ${index + 1}: falta el nombre (name / nombre).`;
  }

  const number = readNumber(record.number ?? record.dorsal ?? record.numero ?? record.num) ?? 0;
  const resolvedName = resolvePlayerNameFromJson(rawName, number > 0 ? number : null, squad);
  const role = readString(record.role ?? record.posicion ?? record.position) ?? undefined;
  const isCustom = squad
    ? !resolveSquadPlayerByName(squad, resolvedName) &&
      !(number > 0 && findSquadPlayerByDorsal(squad, number))
    : false;

  return {
    number: Math.max(0, Math.round(number)),
    name: resolvedName,
    ...(role ? { role } : {}),
    ...(isCustom ? { custom: true } : {}),
  };
}

function parseLineupList(raw: unknown, listName: string, squad?: SquadPlayer[]): LineupPlayer[] | string {
  if (!Array.isArray(raw)) {
    return `Falta el array "${listName}".`;
  }

  const players: LineupPlayer[] = [];
  for (let index = 0; index < raw.length; index += 1) {
    const result = parseLineupPlayer(raw[index], index, squad);
    if (typeof result === "string") {
      return `${listName}: ${result}`;
    }
    players.push(result);
  }
  return players;
}

function parseSingleLineup(raw: unknown, squad?: SquadPlayer[]): MatchLineup | string {
  const record = asRecord(raw);
  if (!record) {
    return "La alineación debe ser un objeto con formation, starters y bench.";
  }

  const formation = readString(record.formation ?? record.formacion ?? record.sistema) ?? "";
  const starters = parseLineupList(record.starters ?? record.titulares ?? record.xi, "starters", squad);
  if (typeof starters === "string") return starters;

  const benchRaw = record.bench ?? record.suplentes ?? record.substitutes;
  const bench = benchRaw === undefined ? [] : parseLineupList(benchRaw, "bench", squad);
  if (typeof bench === "string") return bench;

  return { formation, starters, bench };
}

export type ParsedMatchLineups = {
  home?: MatchLineup;
  away?: MatchLineup;
};

function extractLineupSides(
  payload: unknown,
  options?: { squad?: SquadPlayer[]; context?: ClubMatchJsonContext },
): ParsedMatchLineups | string {
  const record = asRecord(payload);
  if (!record) {
    return "La alineación debe ser un objeto.";
  }

  const context = options?.context;
  const squad = options?.squad;

  if (record.aviles !== undefined || record.avilés !== undefined) {
    const result: ParsedMatchLineups = {};
    const avilesLineup = parseSingleLineup(record.aviles ?? record.avilés, squad);
    if (typeof avilesLineup === "string") return `Avilés: ${avilesLineup}`;

    const rivalKey = context?.rivalKey ?? "visitante";
    const rivalRaw = record[rivalKey] ?? (context?.avilesIsHome ? record.visitante : record.local);

    if (context?.avilesIsHome) result.home = avilesLineup;
    else if (context) result.away = avilesLineup;
    else result.home = avilesLineup;

    if (rivalRaw !== undefined) {
      const rivalLineup = parseSingleLineup(rivalRaw, undefined);
      if (typeof rivalLineup === "string") return `Rival: ${rivalLineup}`;
      if (context?.avilesIsHome) result.away = rivalLineup;
      else if (context) result.home = rivalLineup;
    }

    if (!result.home && !result.away) {
      return "No se encontró alineación del rival.";
    }
    return result;
  }

  const hasHome = record.home !== undefined || record.local !== undefined;
  const hasAway = record.away !== undefined || record.visitante !== undefined;

  if (hasHome || hasAway) {
    const result: ParsedMatchLineups = {};
    if (hasHome) {
      const homeSquad = context && context.avilesIsHome ? squad : undefined;
      const home = parseSingleLineup(record.home ?? record.local, homeSquad);
      if (typeof home === "string") return `Local: ${home}`;
      result.home = home;
    }
    if (hasAway) {
      const awaySquad = context && !context.avilesIsHome ? squad : undefined;
      const away = parseSingleLineup(record.away ?? record.visitante, awaySquad);
      if (typeof away === "string") return `Visitante: ${away}`;
      result.away = away;
    }
    if (!result.home && !result.away) {
      return "No se encontró alineación local ni visitante.";
    }
    return result;
  }

  const single = parseSingleLineup(record, squad);
  if (typeof single === "string") return single;
  return { home: single };
}

export function parseMatchLineupsJson(
  input: string,
  squad?: SquadPlayer[],
  context?: ClubMatchJsonContext,
): ParseMatchJsonResult<ParsedMatchLineups> {
  const parsed = parseJsonInput(input);
  if (!parsed.ok) return parsed;

  const result = extractLineupSides(parsed.data, { squad, context });
  if (typeof result === "string") {
    return { ok: false, error: result };
  }

  const homeCount = result.home ? result.home.starters.length + result.home.bench.length : 0;
  const awayCount = result.away ? result.away.starters.length + result.away.bench.length : 0;
  const total = homeCount + awayCount;
  if (total === 0) {
    return { ok: false, error: "No hay jugadores en la alineación." };
  }

  const parts: string[] = [];
  if (result.home) {
    parts.push(`${context?.avilesIsHome ? "aviles" : context ? "local" : "local"}: ${result.home.starters.length} titulares`);
  }
  if (result.away) {
    parts.push(`${context && !context.avilesIsHome ? "aviles" : context ? "visitante" : "visitante"}: ${result.away.starters.length} titulares`);
  }

  return {
    ok: true,
    data: result,
    summary: parts.join(", ") || `${total} jugador${total === 1 ? "" : "es"}`,
  };
}

export function parseMatchLineupJson(input: string, side: "home" | "away"): ParseMatchJsonResult<MatchLineup> {
  const parsed = parseMatchLineupsJson(input);
  if (!parsed.ok) return parsed;

  const lineup = parsed.data[side];
  if (!lineup) {
    const sideLabel = side === "home" ? "local/home" : "visitante/away";
    return {
      ok: false,
      error: `No se encontró alineación ${sideLabel}. Pega un objeto con "formation" y "starters", o usa { "${side}": { … } }.`,
    };
  }

  const count = lineup.starters.length + lineup.bench.length;
  return {
    ok: true,
    data: lineup,
    summary: `${count} jugador${count === 1 ? "" : "es"} (${lineup.formation || "sin formación"})`,
  };
}
