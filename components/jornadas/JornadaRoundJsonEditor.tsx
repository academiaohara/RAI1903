"use client";

import { MatchJsonPasteSection } from "@/components/match-center/MatchJsonPasteSection";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import {
  applyJornadaRoundJson,
  parseJornadaRoundJson,
  serializeJornadaRoundJson,
  type JornadaRoundJsonPayload,
} from "@/lib/jornada-round-json";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { RfefGrupoId } from "@/lib/rfef-grupos";
import type { JornadaFixture } from "@/types/jornadas";
import { useMemo } from "react";

type JornadaRoundJsonEditorProps = {
  fixtures: JornadaFixture[];
  gender: PrimerEquipoGender;
  grupo: RfefGrupoId;
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
      "goles_visitante": 1,
      "goleadores": [
        { "lado": "local", "jugador": "10", "minuto": 23 },
        { "lado": "visitante", "jugador": "pp", "minuto": 45 }
      ]
    }
  ]
}`;

export function JornadaRoundJsonEditor({
  fixtures,
  gender,
  grupo,
  roundNumber,
  roundLabel,
}: JornadaRoundJsonEditorProps) {
  const { canEdit, editMode, getOverride, mergeSaveValue } = useInlineEditing();

  const currentData = useMemo(
    () => serializeJornadaRoundJson(fixtures, gender, grupo, getOverride, roundNumber),
    [fixtures, gender, grupo, getOverride, roundNumber],
  );

  if (!canEdit || !editMode) return null;

  const handleImport = (payload: JornadaRoundJsonPayload) => {
    applyJornadaRoundJson({
      fixtures,
      payload,
      gender,
      mergeSaveValue,
    });
  };

  return (
    <MatchJsonPasteSection<JornadaRoundJsonPayload>
      title={`Editar jornada JSON · ${roundLabel}`}
      hint="Edita los partidos de la jornada actual. Incluye goleadores con lado local/visitante y jugador (dorsal o pp). Los cambios se guardan como edición en línea."
      applyLabel="Aplicar a la jornada"
      placeholder={PLACEHOLDER}
      parse={parseJornadaRoundJson}
      onImport={handleImport}
      serialize={(data) => JSON.stringify(data, null, 2)}
      currentData={currentData}
    />
  );
}
