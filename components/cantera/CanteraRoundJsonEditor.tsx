"use client";

import { useMemo } from "react";
import { MatchJsonPasteSection } from "@/components/match-center/MatchJsonPasteSection";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import type { CanteraCmsScope } from "@/lib/cantera/cantera-cms";
import { canteraMatchResultOverrideKey } from "@/lib/fixture-inline-keys";
import {
  parseJornadaRoundJson,
  type JornadaRoundJsonPartido,
  type JornadaRoundJsonPayload,
} from "@/lib/jornada-round-json";
import {
  mergeSpainDateAndTime,
  spainDateInputValue,
  spainTimeInputValue,
} from "@/lib/match-kickoff-time";
import type { JornadaFixture } from "@/types/jornadas";

type CanteraRoundJsonEditorProps = {
  fixtures: JornadaFixture[];
  scope: CanteraCmsScope;
  roundNumber?: number;
  roundLabel: string;
};

const PLACEHOLDER = `{
  "jornada": 1,
  "grupo": "1",
  "partidos": [
    {
      "id": "match-id",
      "fecha": "2026-01-10",
      "hora": "18:00",
      "local_id": "team-home",
      "local": "Equipo local",
      "visitante_id": "team-away",
      "visitante": "Equipo visitante",
      "estado": "finalizado",
      "goles_local": 2,
      "goles_visitante": 1
    }
  ]
}`;

function serializeRound(fixtures: JornadaFixture[], roundNumber?: number): JornadaRoundJsonPayload {
  const partidos = fixtures.map((fixture) => {
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
    if (hora && fixture.status !== "finished") partido.hora = hora;
    if (fixture.status === "finished") {
      partido.goles_local = fixture.homeScore ?? 0;
      partido.goles_visitante = fixture.awayScore ?? 0;
    }
    return partido;
  });
  return { jornada: roundNumber, grupo: "1", partidos };
}

/** Editor JSON de la jornada visible en filial/juvenil, abierto con los datos actuales. */
export function CanteraRoundJsonEditor({
  fixtures,
  scope,
  roundNumber,
  roundLabel,
}: CanteraRoundJsonEditorProps) {
  const { canEdit, editMode, mergeSaveValue } = useInlineEditing();
  const currentData = useMemo(() => serializeRound(fixtures, roundNumber), [fixtures, roundNumber]);

  if (!canEdit || !editMode) return null;

  const handleImport = (payload: JornadaRoundJsonPayload) => {
    const fixtureById = new Map(fixtures.map((fixture) => [fixture.id, fixture]));
    for (const partido of payload.partidos) {
      const fixture = fixtureById.get(partido.id);
      if (!fixture) continue;
      const finished = partido.estado === "finalizado";
      const patch: Record<string, unknown> = {
        date: mergeSpainDateAndTime(
          fixture.date,
          partido.fecha,
          partido.hora ?? (spainTimeInputValue(fixture.date) || "00:00"),
        ),
        homeTeamId: partido.local_id || fixture.homeTeamId,
        homeTeamName: partido.local,
        awayTeamId: partido.visitante_id || fixture.awayTeamId,
        awayTeamName: partido.visitante,
        status: finished ? "finished" : "scheduled",
        homeScore: finished ? (partido.goles_local ?? 0) : undefined,
        awayScore: finished ? (partido.goles_visitante ?? 0) : undefined,
        kickoffTime: finished ? undefined : partido.hora,
      };
      mergeSaveValue(canteraMatchResultOverrideKey(scope, fixture.id), patch);
    }
  };

  return (
    <MatchJsonPasteSection<JornadaRoundJsonPayload>
      title={`Editar jornada JSON · ${roundLabel}`}
      hint="Edita los partidos de la jornada actual (fecha, hora, equipos, estado y goles). Los cambios se guardan como edición en línea."
      applyLabel="Aplicar a la jornada"
      placeholder={PLACEHOLDER}
      parse={parseJornadaRoundJson}
      onImport={handleImport}
      serialize={(data) => JSON.stringify(data, null, 2)}
      currentData={currentData}
      defaultOpen
    />
  );
}
