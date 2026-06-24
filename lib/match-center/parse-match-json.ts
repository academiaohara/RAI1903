import { createMatchEventId } from "@/lib/match-events";
import type { LineupPlayer, MatchEvent, MatchEventType, MatchLineup, MatchStatCategory, MatchStatRow } from "@/types";

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
  goal_disallowed: "goal_disallowed",
  gol_anulado: "goal_disallowed",
  "gol anulado": "goal_disallowed",
  yellow: "yellow",
  amarilla: "yellow",
  tarjeta_amarilla: "yellow",
  "tarjeta amarilla": "yellow",
  red: "red",
  roja: "red",
  tarjeta_roja: "red",
  "tarjeta roja": "red",
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

function parseEventTeam(value: unknown): "home" | "away" | null {
  const raw = readString(value);
  if (!raw) return null;
  const normalized = raw.toLowerCase();
  if (normalized === "home" || normalized === "local" || normalized === "h" || normalized === "casa") {
    return "home";
  }
  if (normalized === "away" || normalized === "visitante" || normalized === "a" || normalized === "fuera") {
    return "away";
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

function parseMatchEvent(raw: unknown, index: number): MatchEvent | string {
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
    return `Evento ${index + 1}: tipo no reconocido (goal, yellow, red, substitution…).`;
  }

  const team = parseEventTeam(record.team ?? record.equipo ?? record.side);
  if (!team) {
    return `Evento ${index + 1}: equipo no reconocido (home/local o away/visitante).`;
  }

  const player = readString(record.player ?? record.jugador ?? record.nombre);
  if (!player) {
    return `Evento ${index + 1}: falta el jugador (player / jugador).`;
  }

  const detail =
    readString(
      record.detail ??
        record.detalle ??
        record.asistencia ??
        record.assist ??
        record.sale ??
        record.out,
    ) ?? undefined;

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

export function parseMatchEventsJson(input: string): ParseMatchJsonResult<MatchEvent[]> {
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
    const result = parseMatchEvent(items[index], index);
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

function parseLineupPlayer(raw: unknown, index: number): LineupPlayer | string {
  const record = asRecord(raw);
  if (!record) {
    return `Jugador ${index + 1}: debe ser un objeto.`;
  }

  const name = readString(record.name ?? record.nombre ?? record.jugador ?? record.player);
  if (!name) {
    return `Jugador ${index + 1}: falta el nombre (name / nombre).`;
  }

  const number = readNumber(record.number ?? record.dorsal ?? record.numero ?? record.num) ?? 0;
  const role = readString(record.role ?? record.posicion ?? record.position) ?? undefined;

  return {
    number: Math.max(0, Math.round(number)),
    name,
    ...(role ? { role } : {}),
  };
}

function parseLineupList(raw: unknown, listName: string): LineupPlayer[] | string {
  if (!Array.isArray(raw)) {
    return `Falta el array "${listName}".`;
  }

  const players: LineupPlayer[] = [];
  for (let index = 0; index < raw.length; index += 1) {
    const result = parseLineupPlayer(raw[index], index);
    if (typeof result === "string") {
      return `${listName}: ${result}`;
    }
    players.push(result);
  }
  return players;
}

function parseSingleLineup(raw: unknown): MatchLineup | string {
  const record = asRecord(raw);
  if (!record) {
    return "La alineación debe ser un objeto con formation, starters y bench.";
  }

  const formation = readString(record.formation ?? record.formacion ?? record.sistema) ?? "";
  const starters = parseLineupList(record.starters ?? record.titulares ?? record.xi, "starters");
  if (typeof starters === "string") return starters;

  const benchRaw = record.bench ?? record.suplentes ?? record.substitutes;
  const bench = benchRaw === undefined ? [] : parseLineupList(benchRaw, "bench");
  if (typeof bench === "string") return bench;

  return { formation, starters, bench };
}

export type ParsedMatchLineups = {
  home?: MatchLineup;
  away?: MatchLineup;
};

function extractLineupSides(payload: unknown): ParsedMatchLineups | string {
  const record = asRecord(payload);
  if (!record) {
    return "La alineación debe ser un objeto.";
  }

  const hasHome = record.home !== undefined || record.local !== undefined;
  const hasAway = record.away !== undefined || record.visitante !== undefined;

  if (hasHome || hasAway) {
    const result: ParsedMatchLineups = {};
    if (record.home !== undefined || record.local !== undefined) {
      const home = parseSingleLineup(record.home ?? record.local);
      if (typeof home === "string") return `Local: ${home}`;
      result.home = home;
    }
    if (record.away !== undefined || record.visitante !== undefined) {
      const away = parseSingleLineup(record.away ?? record.visitante);
      if (typeof away === "string") return `Visitante: ${away}`;
      result.away = away;
    }
    if (!result.home && !result.away) {
      return "No se encontró alineación local ni visitante.";
    }
    return result;
  }

  const single = parseSingleLineup(record);
  if (typeof single === "string") return single;
  return { home: single };
}

export function parseMatchLineupsJson(input: string): ParseMatchJsonResult<ParsedMatchLineups> {
  const parsed = parseJsonInput(input);
  if (!parsed.ok) return parsed;

  const result = extractLineupSides(parsed.data);
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
    parts.push(`local: ${result.home.starters.length} titulares`);
  }
  if (result.away) {
    parts.push(`visitante: ${result.away.starters.length} titulares`);
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
