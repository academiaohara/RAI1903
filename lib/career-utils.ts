import type { PlayerCareerRecord } from "@/types/squad";

/** Año de inicio de una temporada tipo "2024/25" o "24/25". */
export function parseTemporadaStart(temporada: string): number {
  const match = temporada.trim().match(/(\d{2,4})/);
  if (!match) return 0;
  const year = Number(match[1]);
  if (!Number.isFinite(year)) return 0;
  return year < 100 ? 2000 + year : year;
}

export function sortCareerByTemporada(career: PlayerCareerRecord[]): PlayerCareerRecord[] {
  return [...career].sort((a, b) => parseTemporadaStart(a.temporada) - parseTemporadaStart(b.temporada));
}

export type ParseCareerJsonResult =
  | { ok: true; records: PlayerCareerRecord[] }
  | { ok: false; error: string };

function careerStat(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeCareerRecord(raw: unknown, index: number): PlayerCareerRecord | ParseCareerJsonResult {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: `Fila ${index + 1}: debe ser un objeto con temporada y club.` };
  }

  const row = raw as Record<string, unknown>;
  const temporada = String(row.temporada ?? "").trim();
  const club = String(row.club ?? row.equipo ?? "").trim();

  if (!temporada) {
    return { ok: false, error: `Fila ${index + 1}: falta temporada.` };
  }
  if (!club) {
    return { ok: false, error: `Fila ${index + 1}: falta club.` };
  }

  return {
    temporada,
    club,
    partidos: careerStat(row.partidos ?? row.pj),
    goles: careerStat(row.goles ?? row.g),
    asistencias: careerStat(row.asistencias ?? row.a),
  };
}

/** Parsea un array JSON de trayectoria (campos de la app o alias equipo/pj/g/a). */
export function parseCareerJson(input: string): ParseCareerJsonResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "El JSON está vacío." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { ok: false, error: "JSON inválido. Comprueba comas y comillas." };
  }

  if (!Array.isArray(parsed)) {
    return { ok: false, error: "El JSON debe ser un array de temporadas." };
  }

  const records: PlayerCareerRecord[] = [];
  for (let index = 0; index < parsed.length; index += 1) {
    const normalized = normalizeCareerRecord(parsed[index], index);
    if ("ok" in normalized) return normalized;
    records.push(normalized);
  }

  return { ok: true, records: sortCareerByTemporada(records) };
}
