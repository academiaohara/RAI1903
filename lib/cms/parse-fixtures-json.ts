import { resolveMatchCompetition } from "@/lib/cms/competition-config-bundle";
import { getGroupTeamSlots, slugFromTeamName } from "@/lib/cms/group-teams";
import type { FilialFixturePartido, FilialFixturesBundle } from "@/lib/cms/filial-bundles";
import { getCompetitionConfigBundle, defaultCompetitionConfig } from "@/lib/cms/competition-config-bundle";
import type { SeasonBundlesMap } from "@/lib/cms/season-bundles";
import { getTeamsBundle } from "@/lib/cms/teams-bundle";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { CompetitionId, Match, Matchday } from "@/types";

export type ParseFixturesJsonResult<T> =
  | { ok: true; data: T; summary: string }
  | { ok: false; error: string };

type RawPartido = {
  fecha?: unknown;
  hora?: unknown;
  local?: unknown;
  visitante?: unknown;
  goles_local?: unknown;
  goles_visitante?: unknown;
  estado?: unknown;
};

type RawJornada = {
  jornada?: unknown;
  partidos?: unknown;
  grupo?: unknown;
};

type RawJornadasPayload = {
  competicion?: unknown;
  temporada?: unknown;
  jornadas?: unknown;
  jornadasGrupo2?: unknown;
};

type RawMatch = {
  id?: unknown;
  matchday?: unknown;
  homeTeamId?: unknown;
  awayTeamId?: unknown;
  homeTeam?: unknown;
  awayTeam?: unknown;
  date?: unknown;
  competition?: unknown;
  venue?: unknown;
  status?: unknown;
  homeScore?: unknown;
  awayScore?: unknown;
};

type RawMatchday = {
  round?: unknown;
  matches?: unknown;
};

type RawPrimerEquipoBundle = {
  matchdays?: unknown;
  matchdaysFemenino?: unknown;
  matchdaysGrupo2?: unknown;
  meta?: unknown;
};

const SPANISH_MONTH_INDEX: Record<string, number> = {
  ENE: 0,
  FEB: 1,
  MAR: 2,
  ABR: 3,
  MAY: 4,
  JUN: 5,
  JUL: 6,
  AGO: 7,
  SEP: 8,
  OCT: 9,
  NOV: 10,
  DIC: 11,
};

function parseJsonInput(input: string): ParseFixturesJsonResult<unknown> {
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

function parseKickoffIso(fecha: string, hora: string | null | undefined): string {
  const trimmed = fecha.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const [year, month, day] = trimmed.slice(0, 10).split("-").map(Number);
    const [hours, minutes] = hora ? String(hora).split(":").map(Number) : [12, 0];
    return new Date(Date.UTC(year, month - 1, day, hours, minutes)).toISOString();
  }

  const [dayStr, monthToken, yearStr] = trimmed.split(/\s+/);
  const day = Number(dayStr);
  const month = SPANISH_MONTH_INDEX[String(monthToken).toUpperCase()];
  const year = Number(yearStr);
  if (!day || month === undefined || !year) {
    throw new Error(`Fecha no reconocida: "${fecha}"`);
  }
  return new Date(Date.UTC(year, month, day, 12, 0)).toISOString();
}

function normalizeCanteraPartido(raw: unknown, index: number, jornada: number): FilialFixturePartido | string {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return `Jornada ${jornada}, partido ${index + 1}: debe ser un objeto.`;
  }
  const row = raw as RawPartido;
  const local = String(row.local ?? "").trim();
  const visitante = String(row.visitante ?? "").trim();
  const fecha = String(row.fecha ?? "").trim();
  if (!fecha) return `Jornada ${jornada}, partido ${index + 1}: falta fecha.`;
  if (!local) return `Jornada ${jornada}, partido ${index + 1}: falta local.`;
  if (!visitante) return `Jornada ${jornada}, partido ${index + 1}: falta visitante.`;

  const hora = row.hora === null || row.hora === undefined || row.hora === "" ? null : String(row.hora);

  return {
    fecha,
    hora,
    local,
    visitante,
    goles_local: null,
    goles_visitante: null,
    estado: "pendiente",
  };
}

function normalizeCanteraJornadas(rawJornadas: unknown): ParseFixturesJsonResult<FilialFixturesBundle["jornadas"]> {
  if (!Array.isArray(rawJornadas) || rawJornadas.length === 0) {
    return { ok: false, error: "Se esperaba un array jornadas con al menos una jornada." };
  }

  const jornadas: FilialFixturesBundle["jornadas"] = [];
  for (const [jIndex, rawJornada] of rawJornadas.entries()) {
    if (!rawJornada || typeof rawJornada !== "object" || Array.isArray(rawJornada)) {
      return { ok: false, error: `Jornada ${jIndex + 1}: formato inválido.` };
    }
    const jornadaRow = rawJornada as RawJornada;
    const jornada = Number(jornadaRow.jornada);
    if (!Number.isFinite(jornada) || jornada < 1) {
      return { ok: false, error: `Jornada ${jIndex + 1}: falta número de jornada válido.` };
    }
    if (!Array.isArray(jornadaRow.partidos)) {
      return { ok: false, error: `Jornada ${jornada}: falta array partidos.` };
    }

    const partidos: FilialFixturePartido[] = [];
    for (const [pIndex, rawPartido] of jornadaRow.partidos.entries()) {
      const normalized = normalizeCanteraPartido(rawPartido, pIndex, jornada);
      if (typeof normalized === "string") {
        return { ok: false, error: normalized };
      }
      partidos.push(normalized);
    }
    jornadas.push({ jornada, partidos });
  }

  jornadas.sort((a, b) => a.jornada - b.jornada);
  return { ok: true, data: jornadas, summary: "" };
}

/** Parsea JSON de calendario cantera (filial/juvenil). */
export function parseCanteraFixturesJson(input: string): ParseFixturesJsonResult<FilialFixturesBundle> {
  const parsed = parseJsonInput(input);
  if (!parsed.ok) return parsed;

  const root = parsed.data;
  if (!root || typeof root !== "object" || Array.isArray(root)) {
    return { ok: false, error: "El JSON debe ser un objeto con jornadas." };
  }

  const payload = root as RawJornadasPayload & FilialFixturesBundle;
  const jornadasResult = normalizeCanteraJornadas(payload.jornadas);
  if (!jornadasResult.ok) return jornadasResult;

  const matchCount = jornadasResult.data.reduce((sum, j) => sum + j.partidos.length, 0);
  const lastRound = jornadasResult.data.at(-1)?.jornada ?? 0;

  return {
    ok: true,
    data: {
      competicion: String(payload.competicion ?? "").trim() || "Competición",
      temporada: payload.temporada ? String(payload.temporada) : undefined,
      jornadas: jornadasResult.data,
    },
    summary: `${jornadasResult.data.length} jornadas · ${matchCount} partidos (hasta jornada ${lastRound})`,
  };
}

type TeamLookup = {
  resolve: (name: string) => { id: string; name: string; stadium: string };
};

function normalizeName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function buildTeamLookup(bundles: SeasonBundlesMap, gender: PrimerEquipoGender): TeamLookup {
  const entries: Array<{ name: string; id: string; stadium: string }> = [];

  for (const team of getTeamsBundle(bundles, gender)?.teams ?? []) {
    if (team.name.trim()) entries.push({ name: team.name, id: team.id, stadium: team.stadium ?? "" });
    if (team.shortName?.trim()) {
      entries.push({ name: team.shortName, id: team.id, stadium: team.stadium ?? "" });
    }
  }

  if (gender === "masculino") {
    for (const grupo of ["1", "2"] as const) {
      const slots = getGroupTeamSlots(bundles, gender, grupo);
      slots.forEach((slot, index) => {
        const label = slot.name.trim() || `Equipo ${index + 1}`;
        entries.push({ name: label, id: slot.id, stadium: "" });
      });
    }
  }

  const byNormalized = new Map<string, { id: string; name: string; stadium: string }>();
  for (const entry of entries) {
    byNormalized.set(normalizeName(entry.name), {
      id: entry.id,
      name: entry.name,
      stadium: entry.stadium,
    });
  }

  return {
    resolve(name: string) {
      const trimmed = name.trim();
      const known = byNormalized.get(normalizeName(trimmed));
      if (known) return known;
      const id = slugFromTeamName(trimmed) || `equipo-${byNormalized.size + 1}`;
      return { id, name: trimmed, stadium: "" };
    },
  };
}

function buildMatchFromPartido(
  partido: RawPartido,
  round: number,
  index: number,
  lookup: TeamLookup,
  competition: CompetitionId,
  idPrefix: string,
): Match | string {
  const local = String(partido.local ?? "").trim();
  const visitante = String(partido.visitante ?? "").trim();
  const fecha = String(partido.fecha ?? "").trim();
  if (!fecha) return `Jornada ${round}, partido ${index + 1}: falta fecha.`;
  if (!local) return `Jornada ${round}, partido ${index + 1}: falta local.`;
  if (!visitante) return `Jornada ${round}, partido ${index + 1}: falta visitante.`;

  let date: string;
  try {
    const hora =
      partido.hora === null || partido.hora === undefined || partido.hora === ""
        ? null
        : String(partido.hora);
    date = parseKickoffIso(fecha, hora);
  } catch (error) {
    return `Jornada ${round}, partido ${index + 1}: ${error instanceof Error ? error.message : "fecha inválida"}`;
  }

  const home = lookup.resolve(local);
  const away = lookup.resolve(visitante);

  return {
    id: `${idPrefix}j${round}-${home.id}-${away.id}`,
    matchday: round,
    homeTeamId: home.id,
    awayTeamId: away.id,
    homeTeam: home.name,
    awayTeam: away.name,
    date,
    competition,
    venue: home.stadium,
    status: "scheduled",
  };
}

function normalizeMatchdayList(
  raw: unknown,
  label: string,
): ParseFixturesJsonResult<Matchday[]> {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, error: `Se esperaba un array ${label} con al menos una jornada.` };
  }

  const matchdays: Matchday[] = [];
  for (const [index, rawMatchday] of raw.entries()) {
    if (!rawMatchday || typeof rawMatchday !== "object" || Array.isArray(rawMatchday)) {
      return { ok: false, error: `${label} ${index + 1}: formato inválido.` };
    }
    const row = rawMatchday as RawMatchday;
    const round = Number(row.round);
    if (!Number.isFinite(round) || round < 1) {
      return { ok: false, error: `${label} ${index + 1}: falta round válido.` };
    }
    if (!Array.isArray(row.matches)) {
      return { ok: false, error: `${label} jornada ${round}: falta array matches.` };
    }

    const matches: Match[] = [];
    for (const [mIndex, rawMatch] of row.matches.entries()) {
      if (!rawMatch || typeof rawMatch !== "object" || Array.isArray(rawMatch)) {
        return { ok: false, error: `${label} jornada ${round}, partido ${mIndex + 1}: formato inválido.` };
      }
      const match = rawMatch as RawMatch;
      const id = String(match.id ?? "").trim();
      const homeTeamId = String(match.homeTeamId ?? "").trim();
      const awayTeamId = String(match.awayTeamId ?? "").trim();
      const homeTeam = String(match.homeTeam ?? "").trim();
      const awayTeam = String(match.awayTeam ?? "").trim();
      const date = String(match.date ?? "").trim();
      const competition = String(match.competition ?? "").trim() as CompetitionId;
      if (!id || !homeTeamId || !awayTeamId || !homeTeam || !awayTeam || !date || !competition) {
        return {
          ok: false,
          error: `${label} jornada ${round}, partido ${mIndex + 1}: faltan campos obligatorios del partido.`,
        };
      }
      matches.push({
        id,
        matchday: round,
        homeTeamId,
        awayTeamId,
        homeTeam,
        awayTeam,
        date,
        competition,
        venue: String(match.venue ?? ""),
        status: "scheduled",
      });
    }
    matchdays.push({ round, matches });
  }

  matchdays.sort((a, b) => a.round - b.round);
  return { ok: true, data: matchdays, summary: "" };
}

function parseJornadasToMatchdays(
  rawJornadas: unknown,
  lookup: TeamLookup,
  competition: CompetitionId,
  idPrefix: string,
): ParseFixturesJsonResult<Matchday[]> {
  if (!Array.isArray(rawJornadas) || rawJornadas.length === 0) {
    return { ok: false, error: "Se esperaba un array jornadas con al menos una jornada." };
  }

  const byRound = new Map<number, Match[]>();
  for (const [jIndex, rawJornada] of rawJornadas.entries()) {
    if (!rawJornada || typeof rawJornada !== "object" || Array.isArray(rawJornada)) {
      return { ok: false, error: `Jornada ${jIndex + 1}: formato inválido.` };
    }
    const jornadaRow = rawJornada as RawJornada;
    const round = Number(jornadaRow.jornada);
    if (!Number.isFinite(round) || round < 1) {
      return { ok: false, error: `Jornada ${jIndex + 1}: falta número de jornada válido.` };
    }
    if (!Array.isArray(jornadaRow.partidos)) {
      return { ok: false, error: `Jornada ${round}: falta array partidos.` };
    }

    const matches = byRound.get(round) ?? [];
    for (const [pIndex, rawPartido] of jornadaRow.partidos.entries()) {
      if (!rawPartido || typeof rawPartido !== "object" || Array.isArray(rawPartido)) {
        return { ok: false, error: `Jornada ${round}, partido ${pIndex + 1}: formato inválido.` };
      }
      const built = buildMatchFromPartido(
        rawPartido as RawPartido,
        round,
        pIndex,
        lookup,
        competition,
        idPrefix,
      );
      if (typeof built === "string") return { ok: false, error: built };
      matches.push(built);
    }
    byRound.set(round, matches);
  }

  const matchdays = [...byRound.entries()]
    .sort(([a], [b]) => a - b)
    .map(([round, matches]) => ({ round, matches }));

  return { ok: true, data: matchdays, summary: "" };
}

function splitJornadasByGrupo(rawJornadas: unknown): { grupo1: RawJornada[]; grupo2: RawJornada[] } {
  if (!Array.isArray(rawJornadas)) return { grupo1: [], grupo2: [] };
  const grupo1: RawJornada[] = [];
  const grupo2: RawJornada[] = [];
  for (const item of rawJornadas) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const grupo = String((item as RawJornada).grupo ?? "1");
    if (grupo === "2") grupo2.push(item as RawJornada);
    else grupo1.push(item as RawJornada);
  }
  return { grupo1, grupo2 };
}

export type PrimerEquipoFixturesImport = {
  matchdays: Matchday[];
  matchdaysGrupo2?: Matchday[];
  meta: { lastRound: number };
};

/** Parsea JSON de calendario de primer equipo (masculino o femenino). */
export function parsePrimerEquipoFixturesJson(
  input: string,
  options: {
    gender: PrimerEquipoGender;
    bundles: SeasonBundlesMap;
  },
): ParseFixturesJsonResult<PrimerEquipoFixturesImport> {
  const parsed = parseJsonInput(input);
  if (!parsed.ok) return parsed;

  const root = parsed.data;
  if (!root || typeof root !== "object") {
    return { ok: false, error: "El JSON debe ser un objeto." };
  }

  const config = getCompetitionConfigBundle(options.bundles, options.gender) ?? defaultCompetitionConfig(options.gender);
  const competition = resolveMatchCompetition(config, options.gender);
  const lookup = buildTeamLookup(options.bundles, options.gender);
  const idPrefix = options.gender === "femenino" ? "fem-" : "";

  if (Array.isArray(root)) {
    const matchdaysResult = normalizeMatchdayList(root, "matchdays");
    if (!matchdaysResult.ok) return matchdaysResult;
    const lastRound = matchdaysResult.data.at(-1)?.round ?? 0;
    const matchCount = matchdaysResult.data.reduce((sum, md) => sum + md.matches.length, 0);
    return {
      ok: true,
      data: { matchdays: matchdaysResult.data, meta: { lastRound } },
      summary: `${matchdaysResult.data.length} jornadas · ${matchCount} partidos`,
    };
  }

  const payload = root as RawJornadasPayload & RawPrimerEquipoBundle;

  const directKey = options.gender === "femenino" ? "matchdaysFemenino" : "matchdays";
  const directMatchdays = payload[directKey as keyof RawPrimerEquipoBundle];
  if (directMatchdays) {
    const matchdaysResult = normalizeMatchdayList(directMatchdays, directKey);
    if (!matchdaysResult.ok) return matchdaysResult;

    let matchdaysGrupo2: Matchday[] | undefined;
    if (options.gender === "masculino" && payload.matchdaysGrupo2) {
      const grupo2Result = normalizeMatchdayList(payload.matchdaysGrupo2, "matchdaysGrupo2");
      if (!grupo2Result.ok) return grupo2Result;
      matchdaysGrupo2 = grupo2Result.data;
    }

    const allRounds = [
      ...matchdaysResult.data.map((md) => md.round),
      ...(matchdaysGrupo2?.map((md) => md.round) ?? []),
    ];
    const lastRound = allRounds.length ? Math.max(...allRounds) : 0;
    const matchCount =
      matchdaysResult.data.reduce((sum, md) => sum + md.matches.length, 0) +
      (matchdaysGrupo2?.reduce((sum, md) => sum + md.matches.length, 0) ?? 0);

    return {
      ok: true,
      data: {
        matchdays: matchdaysResult.data,
        ...(matchdaysGrupo2 ? { matchdaysGrupo2 } : {}),
        meta: { lastRound },
      },
      summary: `${matchdaysResult.data.length} jornadas${matchdaysGrupo2 ? ` + ${matchdaysGrupo2.length} grupo II` : ""} · ${matchCount} partidos`,
    };
  }

  if (!payload.jornadas && !payload.jornadasGrupo2) {
    return {
      ok: false,
      error:
        'Formato no reconocido. Usa { "jornadas": [...] } o el bundle CMS ({ matchdays / matchdaysFemenino }).',
    };
  }

  const split = splitJornadasByGrupo(payload.jornadas);
  const jornadasGrupo1 = split.grupo1.length > 0 ? split.grupo1 : (payload.jornadas as RawJornada[] | undefined);
  const jornadasGrupo2Raw =
    payload.jornadasGrupo2 ?? (split.grupo2.length > 0 ? split.grupo2 : undefined);

  const matchdaysResult = parseJornadasToMatchdays(jornadasGrupo1, lookup, competition, idPrefix);
  if (!matchdaysResult.ok) return matchdaysResult;

  let matchdaysGrupo2: Matchday[] | undefined;
  if (options.gender === "masculino" && jornadasGrupo2Raw) {
    const grupo2Result = parseJornadasToMatchdays(jornadasGrupo2Raw, lookup, competition, "g2-");
    if (!grupo2Result.ok) return grupo2Result;
    matchdaysGrupo2 = grupo2Result.data;
  }

  const allRounds = [
    ...matchdaysResult.data.map((md) => md.round),
    ...(matchdaysGrupo2?.map((md) => md.round) ?? []),
  ];
  const lastRound = allRounds.length ? Math.max(...allRounds) : 0;
  const matchCount =
    matchdaysResult.data.reduce((sum, md) => sum + md.matches.length, 0) +
    (matchdaysGrupo2?.reduce((sum, md) => sum + md.matches.length, 0) ?? 0);

  return {
    ok: true,
    data: {
      matchdays: matchdaysResult.data,
      ...(matchdaysGrupo2 ? { matchdaysGrupo2 } : {}),
      meta: { lastRound },
    },
    summary: `${matchdaysResult.data.length} jornadas${matchdaysGrupo2 ? ` + ${matchdaysGrupo2.length} grupo II` : ""} · ${matchCount} partidos`,
  };
}
