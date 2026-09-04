"use client";

import { Card } from "@/components/Card";
import { FemeninoPageEditor } from "@/components/editor/FemeninoPageEditor";
import { JornadaMatchesByDay } from "@/components/jornadas/JornadaMatchesByDay";
import { JornadaRoundJsonEditor } from "@/components/jornadas/JornadaRoundJsonEditor";
import { JornadaRoundCarousel } from "@/components/jornadas/JornadaRoundCarousel";
import { JornadasGrupoSwitcher } from "@/components/jornadas/JornadasGrupoSwitcher";
import { useJornadaRoundSelection } from "@/hooks/useJornadaRoundSelection";
import { useEditedJornadasDataset } from "@/components/jornadas/useEditedJornadasDataset";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { SectionUnderConstructionGate } from "@/components/season/SectionUnderConstructionGate";
import { useSeason } from "@/components/season/SeasonProvider";
import { hasMultipleGrupos, resolvePrimerEquipoClubTeamId } from "@/lib/cms/competition-config-bundle";
import { buildJornadasDataset, groupFixturesByCalendarDay, jornadaSectionTitle } from "@/lib/jornadas-data";
import { getRaiTeamId } from "@/lib/fixtures";
import { resolveClubTeamIds } from "@/lib/season/club-team-ids";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { RfefGrupoId } from "@/lib/rfef-grupos";
import { useMemo, useState } from "react";

type JornadasViewProps = {
  gender: PrimerEquipoGender;
};

export function JornadasView({ gender }: JornadasViewProps) {
  const { getEnrichedFixtureSource, getCompetitionConfig, bundles } = useSeason();
  const { getValue } = useInlineEditing();
  const competitionConfig = useMemo(() => getCompetitionConfig(gender), [gender, getCompetitionConfig]);
  const fixtureSource = useMemo(() => getEnrichedFixtureSource(gender), [gender, getEnrichedFixtureSource]);
  const clubTeamIds = useMemo(() => {
    if (gender === "femenino") {
      return resolveClubTeamIds(bundles, gender, "1", fixtureSource.matchdaysFemenino);
    }
    return [
      ...new Set([
        ...resolveClubTeamIds(bundles, gender, "1", fixtureSource.matchdays),
        ...resolveClubTeamIds(bundles, gender, "2", fixtureSource.matchdaysGrupo2),
      ]),
    ];
  }, [bundles, fixtureSource, gender]);
  const baseDataset = useMemo(
    () => buildJornadasDataset(gender, fixtureSource, clubTeamIds),
    [clubTeamIds, fixtureSource, gender],
  );
  const dataset = useEditedJornadasDataset(baseDataset, gender, clubTeamIds);
  const totalRounds = useMemo(() => {
    if (dataset.rounds.length === 0) return 38;
    return Math.max(...dataset.rounds.map((round) => round.roundNumber ?? 1));
  }, [dataset.rounds]);
  const { selectedRoundId, selectRound } = useJornadaRoundSelection(
    dataset.matchdays,
    totalRounds,
    dataset.currentRoundId,
  );
  const raiTeamId =
    gender === "femenino" ? resolvePrimerEquipoClubTeamId(bundles, gender) : getRaiTeamId(gender);
  const [grupo, setGrupo] = useState<RfefGrupoId>("1");

  const roundData = dataset.getRound(selectedRoundId);
  const { summary } = roundData;
  const grupoMatches = roundData.matchesByGrupo[grupo];
  const matchesByDay = groupFixturesByCalendarDay(grupoMatches);
  const showGrupoSwitcher =
    gender === "masculino" && summary.kind === "league" && hasMultipleGrupos(competitionConfig);

  const customLabel = getValue(`jornada-round:${summary.id}:label`, summary.label);
  const title = jornadaSectionTitle(summary, customLabel === summary.label ? undefined : customLabel);
  return (
    <SectionUnderConstructionGate scope={gender} section="jornadas">
    <div className="space-y-6">
      {gender === "femenino" ? <FemeninoPageEditor /> : null}
      <JornadaRoundJsonEditor
        fixtures={grupoMatches}
        gender={gender}
        grupo={grupo}
        roundNumber={summary.roundNumber}
        roundLabel={title}
      />
      <JornadaRoundCarousel
        rounds={dataset.rounds}
        selectedId={selectedRoundId}
        onSelect={selectRound}
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
