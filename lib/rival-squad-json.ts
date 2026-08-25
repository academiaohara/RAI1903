import type { RivalSquadImport, RivalSquadImportPlayer } from "@/types/rival-squad-import";
import { normalizeRivalFoot } from "@/lib/match-goals";

type RawPlayer = Record<string, unknown>;

/** Campos mínimos exportados al JSON editable del editor. */
export type RivalSquadJsonPlayer = {
  dorsal: number | null;
  jugador: string;
  pos: string;
  edad: number | null;
  pie?: string;
  altura?: string | null;
};

export function serializeRivalSquadPlantillaJson(plantilla: RivalSquadImportPlayer[]): string {
  const minimal: RivalSquadJsonPlayer[] = plantilla.map((player) => {
    const entry: RivalSquadJsonPlayer = {
      dorsal: player.dorsal,
      jugador: player.jugador,
      pos: player.pos,
      edad: player.edad ?? null,
    };
    if (player.pie) entry.pie = player.pie;
    if (player.altura?.trim()) entry.altura = player.altura.trim();
    return entry;
  });
  return JSON.stringify(minimal, null, 2);
}

function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function asOptionalDorsal(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function sortRivalPlantilla(plantilla: RivalSquadImportPlayer[]): RivalSquadImportPlayer[] {
  return [...plantilla].sort((a, b) => {
    const aDorsal = a.dorsal;
    const bDorsal = b.dorsal;
    if (aDorsal != null && bDorsal != null) return aDorsal - bDorsal;
    if (aDorsal != null) return -1;
    if (bDorsal != null) return 1;
    return a.jugador.localeCompare(b.jugador, "es");
  });
}

function normalizePlayer(raw: RawPlayer): RivalSquadImportPlayer | null {
  const dorsal = asOptionalDorsal(raw.dorsal ?? raw.numero ?? raw.number);
  const jugador = String(raw.jugador ?? raw.nombre ?? raw.name ?? "").trim();
  const pos = String(raw.pos ?? raw.posicion ?? raw.position ?? "").trim();
  if (!jugador || !pos) return null;

  const pieRaw = raw.pie ?? raw.pierna ?? raw.foot;
  const pie =
    typeof pieRaw === "string"
      ? (normalizeRivalFoot(pieRaw) as RivalSquadImportPlayer["pie"])
      : undefined;

  return {
    dorsal,
    jugador,
    pos,
    pie,
    edad: asOptionalNumber(raw.edad ?? raw.age),
    altura:
      typeof raw.altura === "string"
        ? raw.altura.trim() || null
        : typeof raw.height === "string"
          ? raw.height.trim() || null
          : null,
    pj: asNumber(raw.pj ?? raw.partidos, 0),
    g: asNumber(raw.g ?? raw.goles, 0),
    a: asNumber(raw.a ?? raw.asistencias, 0),
    ta: asNumber(raw.ta ?? raw.amarillas, 0),
    tr: asNumber(raw.tr ?? raw.rojas, 0),
    valor: typeof raw.valor === "string" ? raw.valor : raw.valor == null ? null : String(raw.valor),
    contrato: asOptionalNumber(raw.contrato),
    estado: typeof raw.estado === "string" ? (raw.estado as RivalSquadImportPlayer["estado"]) : undefined,
  };
}

function normalizePlantilla(value: unknown): RivalSquadImportPlayer[] {
  if (!Array.isArray(value)) return [];
  const plantilla = value
    .map((entry) => (entry && typeof entry === "object" ? normalizePlayer(entry as RawPlayer) : null))
    .filter((entry): entry is RivalSquadImportPlayer => entry !== null);
  return sortRivalPlantilla(plantilla);
}

/** Acepta lista de jugadores o objeto `{ plantilla: [...] }`. */
export function parseRivalSquadJson(
  raw: unknown,
  fallback?: Partial<RivalSquadImport>,
): { ok: true; data: RivalSquadImport } | { ok: false; error: string } {
  let plantillaSource: unknown;
  let meta: Partial<RivalSquadImport> = {};

  if (Array.isArray(raw)) {
    plantillaSource = raw;
  } else if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    plantillaSource = obj.plantilla ?? obj.jugadores ?? obj.players;
    meta = {
      estadio: typeof obj.estadio === "string" ? obj.estadio : undefined,
      capacidad: asOptionalNumber(obj.capacidad) ?? undefined,
      entrenador: typeof obj.entrenador === "string" ? obj.entrenador : undefined,
    };
  } else {
    return { ok: false, error: "El JSON debe ser una lista de jugadores o un objeto con plantilla." };
  }

  const plantilla = normalizePlantilla(plantillaSource);
  if (plantilla.length === 0) {
    return { ok: false, error: "No se encontraron jugadores válidos (jugador y pos obligatorios)." };
  }

  return {
    ok: true,
    data: {
      estadio: meta.estadio ?? fallback?.estadio ?? "",
      capacidad: meta.capacidad ?? fallback?.capacidad ?? 0,
      entrenador: meta.entrenador ?? fallback?.entrenador ?? "",
      plantilla,
      estadioInfo: fallback?.estadioInfo,
    },
  };
}
