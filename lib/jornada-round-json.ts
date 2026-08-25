import { mergeSpainDateAndTime } from "@/lib/match-kickoff-time";
import { spainDateInputValue, spainTimeInputValue } from "@/lib/match-kickoff-time";
import { matchGoalsOverrideKey, OWN_GOAL_PLAYER_KEY, readMatchGoalsOverride } from "@/lib/match-goals";
import { matchResultOverrideKey } from "@/lib/fixture-inline-keys";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { RfefGrupoId } from "@/lib/rfef-grupos";
import type { JornadaFixture } from "@/types/jornadas";
import type { MatchGoalEntry } from "@/types/match-goals";

export type JornadaRoundJsonGol = {
  lado: "local" | "visitante";
  jugador: string;
  minuto: number;
};

export type JornadaRoundJsonPartido = {
  id: string;
  fecha: string;
  hora?: string;
  local_id: string;
  local: string;
  visitante_id: string;
  visitante: string;
  estado: "programado" | "finalizado";
  goles_local?: number;
  goles_visitante?: number;
  goleadores?: JornadaRoundJsonGol[];
};

export type JornadaRoundJsonPayload = {
  jornada?: number | string;
  grupo: RfefGrupoId;
  partidos: JornadaRoundJsonPartido[];
};

export type ParseJornadaRoundJsonResult =
  | { ok: true; data: JornadaRoundJsonPayload; summary: string }
  | { ok: false; error: string };

function teamSideToLado(side: MatchGoalEntry["teamSide"]): JornadaRoundJsonGol["lado"] {
  return side === "home" ? "local" : "visitante";
}

function ladoToTeamSide(lado: JornadaRoundJsonGol["lado"]): MatchGoalEntry["teamSide"] {
  return lado === "local" ? "home" : "away";
}

function serializeGoal(goal: MatchGoalEntry): JornadaRoundJsonGol {
  return {
    lado: teamSideToLado(goal.teamSide),
    jugador: goal.playerKey,
    minuto: goal.minute,
  };
}

function parseGoal(raw: unknown): JornadaRoundJsonGol | null {
  if (!raw || typeof raw !== "object") return null;
  const entry = raw as Record<string, unknown>;
  const lado = entry.lado === "local" || entry.lado === "visitante" ? entry.lado : null;
  const jugador = typeof entry.jugador === "string" ? entry.jugador.trim() : "";
  const minuto = Number(entry.minuto);
  if (!lado || !jugador || !Number.isFinite(minuto) || minuto < 0) return null;
  return { lado, jugador, minuto: Math.round(minuto) };
}

function parsePartido(raw: unknown, index: number): JornadaRoundJsonPartido | null {
  if (!raw || typeof raw !== "object") return null;
  const entry = raw as Record<string, unknown>;

  const id = typeof entry.id === "string" ? entry.id.trim() : "";
  const fecha = typeof entry.fecha === "string" ? entry.fecha.trim() : "";
  const localId =
    typeof entry.local_id === "string"
      ? entry.local_id.trim()
      : typeof entry.localId === "string"
        ? entry.localId.trim()
        : "";
  const visitanteId =
    typeof entry.visitante_id === "string"
      ? entry.visitante_id.trim()
      : typeof entry.visitanteId === "string"
        ? entry.visitanteId.trim()
        : "";
  const local = typeof entry.local === "string" ? entry.local.trim() : "";
  const visitante = typeof entry.visitante === "string" ? entry.visitante.trim() : "";

  if (!fecha || !local || !visitante) {
    return null;
  }

  const estadoRaw = typeof entry.estado === "string" ? entry.estado.toLowerCase() : "programado";
  const estado = estadoRaw === "finalizado" || estadoRaw === "finished" ? "finalizado" : "programado";

  const golesLocal = entry.goles_local ?? entry.golesLocal;
  const golesVisitante = entry.goles_visitante ?? entry.golesVisitante;

  const goleadoresRaw = entry.goleadores ?? entry.goals;
  const goleadores = Array.isArray(goleadoresRaw)
    ? goleadoresRaw.map(parseGoal).filter((goal): goal is JornadaRoundJsonGol => goal !== null)
    : undefined;

  return {
    id: id || `partido-${index + 1}`,
    fecha,
    hora: typeof entry.hora === "string" ? entry.hora.trim() || undefined : undefined,
    local_id: localId,
    local,
    visitante_id: visitanteId,
    visitante,
    estado,
    goles_local:
      golesLocal !== undefined && golesLocal !== null && golesLocal !== ""
        ? Number(golesLocal)
        : undefined,
    goles_visitante:
      golesVisitante !== undefined && golesVisitante !== null && golesVisitante !== ""
        ? Number(golesVisitante)
        : undefined,
    goleadores,
  };
}

export function serializeJornadaRoundJson(
  fixtures: JornadaFixture[],
  gender: PrimerEquipoGender,
  grupo: RfefGrupoId,
  getOverride: (key: string) => unknown,
  roundNumber?: number,
): JornadaRoundJsonPayload {
  const partidos = fixtures.map((fixture) => {
    const goals = readMatchGoalsOverride(getOverride, gender, fixture.id)?.goals ?? [];
    const partido: JornadaRoundJsonPartido = {
      id: fixture.id,
      fecha: spainDateInputValue(fixture.date),
      local_id: fixture.homeTeamId,
      local: fixture.homeTeamName,
      visitante_id: fixture.awayTeamId,
      visitante: fixture.awayTeamName,
      estado: fixture.status === "finished" ? "finalizado" : "programado",
    };

    const hora = fixture.kickoffTime ?? spainTimeInputValue(fixture.date);
    if (hora && fixture.status !== "finished") {
      partido.hora = hora;
    }

    if (fixture.status === "finished") {
      partido.goles_local = fixture.homeScore ?? 0;
      partido.goles_visitante = fixture.awayScore ?? 0;
    }

    if (goals.length > 0) {
      partido.goleadores = goals.map(serializeGoal);
    }

    return partido;
  });

  return {
    jornada: roundNumber,
    grupo,
    partidos,
  };
}

export function parseJornadaRoundJson(input: string): ParseJornadaRoundJsonResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "El JSON está vacío." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { ok: false, error: "JSON inválido: no se pudo analizar." };
  }

  if (!parsed || typeof parsed !== "object") {
    return { ok: false, error: "El JSON debe ser un objeto con la clave partidos." };
  }

  const payload = parsed as Record<string, unknown>;
  const partidosRaw = payload.partidos ?? payload.matches;
  if (!Array.isArray(partidosRaw) || partidosRaw.length === 0) {
    return { ok: false, error: "Incluye al menos un partido en partidos." };
  }

  const partidos = partidosRaw
    .map((partido, index) => parsePartido(partido, index))
    .filter((partido): partido is JornadaRoundJsonPartido => partido !== null);

  if (partidos.length === 0) {
    return { ok: false, error: "Ningún partido tiene los campos mínimos (fecha, local, visitante)." };
  }

  const grupoRaw = payload.grupo ?? payload.group;
  const grupo = grupoRaw === "2" || grupoRaw === 2 ? "2" : "1";

  const data: JornadaRoundJsonPayload = {
    jornada: typeof payload.jornada === "number" || typeof payload.jornada === "string" ? payload.jornada : undefined,
    grupo,
    partidos,
  };

  const withGoals = partidos.filter((partido) => (partido.goleadores?.length ?? 0) > 0).length;
  const summary = `${partidos.length} partido(s)${withGoals > 0 ? `, ${withGoals} con goleadores` : ""}`;

  return { ok: true, data, summary };
}

export type ApplyJornadaRoundJsonOptions = {
  fixtures: JornadaFixture[];
  payload: JornadaRoundJsonPayload;
  gender: PrimerEquipoGender;
  mergeSaveValue: <T extends Record<string, unknown>>(key: string, patch: Partial<T>) => void;
};

export function applyJornadaRoundJson({
  fixtures,
  payload,
  gender,
  mergeSaveValue,
}: ApplyJornadaRoundJsonOptions): { applied: number; goalsApplied: number } {
  const fixtureById = new Map(fixtures.map((fixture) => [fixture.id, fixture]));
  let applied = 0;
  let goalsApplied = 0;

  for (const partido of payload.partidos) {
    const fixture = fixtureById.get(partido.id);
    if (!fixture) continue;

    const dateIso = partido.hora
      ? mergeSpainDateAndTime(fixture.date, partido.fecha, partido.hora)
      : mergeSpainDateAndTime(fixture.date, partido.fecha, spainTimeInputValue(fixture.date) || "00:00");

    const resultPatch: Record<string, unknown> = {
      date: dateIso,
      homeTeamId: partido.local_id || fixture.homeTeamId,
      homeTeamName: partido.local,
      awayTeamId: partido.visitante_id || fixture.awayTeamId,
      awayTeamName: partido.visitante,
      status: partido.estado === "finalizado" ? "finished" : "scheduled",
    };

    if (partido.estado === "finalizado") {
      resultPatch.homeScore = partido.goles_local ?? 0;
      resultPatch.awayScore = partido.goles_visitante ?? 0;
      resultPatch.kickoffTime = undefined;
    } else {
      resultPatch.homeScore = undefined;
      resultPatch.awayScore = undefined;
      if (partido.hora) {
        resultPatch.kickoffTime = partido.hora;
      }
    }

    mergeSaveValue(matchResultOverrideKey(gender, fixture.id), resultPatch);
    applied += 1;

    if (partido.goleadores && partido.goleadores.length > 0) {
      const goals: MatchGoalEntry[] = partido.goleadores.map((goal) => ({
        teamSide: ladoToTeamSide(goal.lado),
        playerKey: goal.jugador === "pp" ? OWN_GOAL_PLAYER_KEY : goal.jugador,
        minute: goal.minuto,
      }));
      mergeSaveValue(matchGoalsOverrideKey(gender, fixture.id), { goals });
      goalsApplied += 1;
    }
  }

  return { applied, goalsApplied };
}
