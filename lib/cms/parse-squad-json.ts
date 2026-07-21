import type { ParseFixturesJsonResult } from "@/lib/cms/parse-fixtures-json";
import type {
  CanteraSquadImport,
  CanteraSquadImportPlayer,
  CanteraSquadImportStaff,
} from "@/types/cantera-squad-import";

function parseJsonInput(input: string): ParseFixturesJsonResult<unknown> {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Pega un JSON con la plantilla." };
  }
  try {
    return { ok: true, data: JSON.parse(trimmed) as unknown, summary: "" };
  } catch {
    return { ok: false, error: "JSON inválido. Revisa comas y comillas." };
  }
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = toNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

function toStringValue(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function parsePlayer(raw: unknown, index: number): CanteraSquadImportPlayer | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const player = raw as Record<string, unknown>;
  const jugador =
    toStringValue(player.jugador) ||
    toStringValue(player.nombre) ||
    toStringValue(player.name) ||
    toStringValue(player.player);
  if (!jugador) return null;

  const pos =
    toStringValue(player.pos) ||
    toStringValue(player.posicion) ||
    toStringValue(player.position) ||
    "Sin demarcación";

  const parsed: CanteraSquadImportPlayer = {
    dorsal: toNullableNumber(player.dorsal ?? player.number),
    jugador,
    pos,
    edad: toNullableNumber(player.edad ?? player.age),
    pc: toNumber(player.pc),
    pj: toNumber(player.pj),
    pt: toNumber(player.pt),
    min: toNumber(player.min ?? player.minutos),
    goles: toNumber(player.goles ?? player.goals),
    ta: toNumber(player.ta),
    tr: toNumber(player.tr),
  };

  const golesEncajados = player.golesEncajados ?? player.goles_encajados ?? player.encajados;
  if (golesEncajados !== undefined && golesEncajados !== null && golesEncajados !== "") {
    parsed.golesEncajados = toNumber(golesEncajados);
  }

  if (!parsed.jugador) {
    parsed.jugador = `Jugador ${index + 1}`;
  }

  return parsed;
}

function parseStaff(raw: unknown): CanteraSquadImportStaff | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const staff = raw as Record<string, unknown>;
  const nombre = toStringValue(staff.nombre) || toStringValue(staff.name);
  if (!nombre) return null;
  return {
    nombre,
    rol: toStringValue(staff.rol) || toStringValue(staff.role) || "Staff",
    partidos: toNumber(staff.partidos),
    ta: toNumber(staff.ta),
    tr: toNumber(staff.tr),
  };
}

function extractPlantilla(root: Record<string, unknown>): unknown[] | null {
  if (Array.isArray(root.plantilla)) return root.plantilla;
  if (Array.isArray(root.jugadores)) return root.jugadores;
  if (Array.isArray(root.players)) return root.players;
  if (Array.isArray(root.squad)) return root.squad;
  if (Array.isArray(root)) return root;
  return null;
}

export function parseCanteraSquadJson(input: string): ParseFixturesJsonResult<CanteraSquadImport> {
  const parsed = parseJsonInput(input);
  if (!parsed.ok) return parsed;

  const root = parsed.data;
  if (!root || typeof root !== "object") {
    return { ok: false, error: "El JSON debe ser un objeto o un array de jugadores." };
  }

  const payload = root as Record<string, unknown>;
  const plantillaRaw = Array.isArray(root)
    ? (root as unknown[])
    : extractPlantilla(payload);

  if (!plantillaRaw?.length) {
    return {
      ok: false,
      error: "No se encontró plantilla. Usa { plantilla: [...] } o un array de jugadores.",
    };
  }

  const plantilla = plantillaRaw
    .map((player, index) => parsePlayer(player, index))
    .filter((player): player is CanteraSquadImportPlayer => player !== null);

  if (!plantilla.length) {
    return { ok: false, error: "Ningún jugador válido en el JSON." };
  }

  const cuerpoTecnicoRaw = payload.cuerpoTecnico ?? payload.cuerpo_tecnico ?? payload.staff;
  const cuerpoTecnico = Array.isArray(cuerpoTecnicoRaw)
    ? cuerpoTecnicoRaw
        .map((member) => parseStaff(member))
        .filter((member): member is CanteraSquadImportStaff => member !== null)
    : undefined;

  const entrenador =
    toStringValue(payload.entrenador) ||
    toStringValue(payload.coach) ||
    cuerpoTecnico?.find((member) => member.rol.toLowerCase().includes("entren"))?.nombre ||
    "";

  const mediaEdad = toNumber(payload.mediaEdad ?? payload.media_edad ?? payload.averageAge);

  return {
    ok: true,
    data: {
      entrenador,
      mediaEdad,
      ...(cuerpoTecnico?.length ? { cuerpoTecnico } : {}),
      plantilla,
    },
    summary: `${plantilla.length} jugadores${entrenador ? ` · ${entrenador}` : ""}`,
  };
}
