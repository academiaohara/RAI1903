"use client";

import { useCallback, useMemo, useState } from "react";
import { CanteraJornadaMatchesByDay } from "@/components/cantera/CanteraJornadaMatchesByDay";
import { useEditedCanteraJornadasDataset } from "@/components/cantera/useEditedCanteraJornadasDataset";
import { PublishCanteraFixturesButton } from "@/components/editor/PublishCanteraFixturesButton";
import { Card } from "@/components/Card";
import { JornadaRoundCarousel } from "@/components/jornadas/JornadaRoundCarousel";
import { buildCanteraJornadasDataset, buildCanteraJornadasDatasetFromMatches } from "@/lib/cantera-jornadas-data";
import type { CanteraCmsScope } from "@/lib/cantera/cantera-cms";
import type { Match } from "@/types";
import { getCanteraPrimaryAvilesTeamId, type CanteraTeamId } from "@/lib/cantera-data";
import type { JornadaRoundId } from "@/types/jornadas";

type CanteraJornadasViewProps = {
  teamId: CanteraTeamId;
  filialMatches?: Match[];
  clubTeamId?: string;
  cmsScope: CanteraCmsScope;
};

export function CanteraJornadasView({
  teamId,
  filialMatches,
  clubTeamId,
  cmsScope,
}: CanteraJornadasViewProps) {
  const resolvedClubTeamId = clubTeamId ?? getCanteraPrimaryAvilesTeamId(teamId);
  const baseDataset = useMemo(() => {
    if (filialMatches) {
      return buildCanteraJornadasDatasetFromMatches(teamId, filialMatches, resolvedClubTeamId);
    }
    return buildCanteraJornadasDataset(teamId, resolvedClubTeamId);
  }, [filialMatches, resolvedClubTeamId, teamId]);
  const dataset = useEditedCanteraJornadasDataset(baseDataset, cmsScope);
  const [manualRoundId, setManualRoundId] = useState<JornadaRoundId | null>(null);
  const selectedRoundId = manualRoundId ?? dataset.currentRoundId;

  const handleSelectRound = useCallback((roundId: JornadaRoundId) => {
    setManualRoundId(roundId);
  }, []);

  const roundData = dataset.getRound(selectedRoundId);
  const { summary } = roundData;
  const matches = roundData.matchesByGrupo["1"];

  const title = `Jornada ${summary.roundNumber}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <JornadaRoundCarousel
          rounds={dataset.rounds}
          selectedId={selectedRoundId}
          onSelect={handleSelectRound}
        />
        <PublishCanteraFixturesButton scope={cmsScope} />
      </div>

      <Card eyebrow="Resultados" title={title} borderlessHeader>
        <CanteraJornadaMatchesByDay
          fixtures={matches}
          highlightTeamId={resolvedClubTeamId}
          scope={cmsScope}
        />
      </Card>
    </div>
  );
}
