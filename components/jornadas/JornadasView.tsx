"use client";

import { Card } from "@/components/Card";
import { JornadaMatchesByDay } from "@/components/jornadas/JornadaMatchesByDay";
import { JornadaRoundCarousel } from "@/components/jornadas/JornadaRoundCarousel";
import { JornadasGrupoSwitcher } from "@/components/jornadas/JornadasGrupoSwitcher";
import { useEditedJornadasDataset } from "@/components/jornadas/useEditedJornadasDataset";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { SectionUnderConstructionGate } from "@/components/season/SectionUnderConstructionGate";
import { useSeason } from "@/components/season/SeasonProvider";
import { hasMultipleGrupos } from "@/lib/cms/competition-config-bundle";
import { buildJornadasDataset, groupFixturesByCalendarDay, jornadaSectionTitle } from "@/lib/jornadas-data";
import { getRaiTeamId } from "@/lib/fixtures";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { RfefGrupoId } from "@/lib/rfef-grupos";
import type { JornadaRoundId } from "@/types/jornadas";
import { useCallback, useMemo, useState } from "react";

type JornadasViewProps = {
  gender: PrimerEquipoGender;
};

export function JornadasView({ gender }: JornadasViewProps) {
  const { getEnrichedFixtureSource, getCompetitionConfig } = useSeason();
  const { getValue } = useInlineEditing();
  const competitionConfig = useMemo(() => getCompetitionConfig(gender), [gender, getCompetitionConfig]);
  const baseDataset = useMemo(
    () => buildJornadasDataset(gender, getEnrichedFixtureSource(gender)),
    [gender, getEnrichedFixtureSource],
  );
  const dataset = useEditedJornadasDataset(baseDataset, gender);
  const raiTeamId = getRaiTeamId(gender);
  const [manualRoundId, setManualRoundId] = useState<JornadaRoundId | null>(null);
  const selectedRoundId = manualRoundId ?? dataset.currentRoundId;
  const [grupo, setGrupo] = useState<RfefGrupoId>("1");

  const handleSelectRound = useCallback((roundId: JornadaRoundId) => {
    setManualRoundId(roundId);
  }, []);

  const roundData = dataset.getRound(selectedRoundId);
  const { summary } = roundData;
  const grupoMatches = roundData.matchesByGrupo[grupo];
  const matchesByDay = groupFixturesByCalendarDay(grupoMatches);
  const showGrupoSwitcher =
    gender === "masculino" && summary.kind === "league" && hasMultipleGrupos(competitionConfig);

  const customLabel = getValue(`jornada-round:${summary.id}:label`, summary.label);
  const title = jornadaSectionTitle(summary, customLabel === summary.label ? undefined : customLabel);
  const showCrests = gender !== "femenino";

  return (
    <SectionUnderConstructionGate scope={gender} section="jornadas">
    <div className="space-y-6">
      <JornadaRoundCarousel
        rounds={dataset.rounds}
        selectedId={selectedRoundId}
        onSelect={handleSelectRound}
        showCrests={showCrests}
        gender={gender}
      />

      <Card
        eyebrow="Resultados"
        title={title}
        borderlessHeader
        action={
          showGrupoSwitcher ? (
            <JornadasGrupoSwitcher value={grupo} onChange={setGrupo} />
          ) : undefined
        }
      >
        {matchesByDay.length > 0 ? (
          <div className="space-y-4">
            <JornadaMatchesByDay
              groups={matchesByDay}
              highlightTeamId={raiTeamId}
              gender={gender}
              showCrests={showCrests}
              grupo={grupo}
            />
          </div>
        ) : (
          <p className="text-sm font-bold text-slate-600">Sin partidos en esta jornada.</p>
        )}
      </Card>
    </div>
    </SectionUnderConstructionGate>
  );
}
