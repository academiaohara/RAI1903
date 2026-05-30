"use client";

import { useCallback, useMemo, useState } from "react";
import { CanteraJornadaMatchRow } from "@/components/cantera/CanteraJornadaMatchRow";
import { Card } from "@/components/Card";
import { JornadaRoundCarousel } from "@/components/jornadas/JornadaRoundCarousel";
import { buildCanteraJornadasDataset } from "@/lib/cantera-jornadas-data";
import { getCanteraPrimaryAvilesTeamId, type CanteraTeamId } from "@/lib/cantera-data";
import type { JornadaFixture, JornadaRoundId } from "@/types/jornadas";

type CanteraJornadasViewProps = {
  teamId: CanteraTeamId;
};

function partitionMatches(matches: JornadaFixture[], clubTeamId: string) {
  const club = matches.filter((m) => m.homeTeamId === clubTeamId || m.awayTeamId === clubTeamId);
  const rest = matches.filter((m) => m.homeTeamId !== clubTeamId && m.awayTeamId !== clubTeamId);
  return { club, rest };
}

export function CanteraJornadasView({ teamId }: CanteraJornadasViewProps) {
  const dataset = useMemo(() => buildCanteraJornadasDataset(teamId), [teamId]);
  const clubTeamId = getCanteraPrimaryAvilesTeamId(teamId);
  const [selectedRoundId, setSelectedRoundId] = useState<JornadaRoundId>(dataset.currentRoundId);

  const handleSelectRound = useCallback((roundId: JornadaRoundId) => {
    setSelectedRoundId(roundId);
  }, []);

  const roundData = dataset.getRound(selectedRoundId);
  const { summary } = roundData;
  const matches = roundData.matchesByGrupo["1"];
  const { club: clubMatches, rest: otherMatches } = partitionMatches(matches, clubTeamId);

  const title = `Jornada ${summary.roundNumber}`;

  return (
    <div className="space-y-6">
      <JornadaRoundCarousel
        rounds={dataset.rounds}
        selectedId={selectedRoundId}
        onSelect={handleSelectRound}
        showCrests={false}
      />

      <Card eyebrow="Resultados" title={title} borderlessHeader>
        {clubMatches.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-normal text-[#981915]">Real Avilés</p>
            {clubMatches.map((fixture) => (
              <CanteraJornadaMatchRow
                key={fixture.id}
                fixture={fixture}
                highlighted
                highlightTeamId={clubTeamId}
              />
            ))}
          </div>
        )}

        {otherMatches.length > 0 && (
          <div className={clubMatches.length > 0 ? "mt-8 space-y-4" : "space-y-4"}>
            <p className="text-xs font-bold uppercase tracking-normal text-[#214C9B]">Resto de la jornada</p>
            <div className="space-y-2">
              {otherMatches.map((fixture) => (
                <CanteraJornadaMatchRow key={fixture.id} fixture={fixture} />
              ))}
            </div>
          </div>
        )}

        {clubMatches.length === 0 && otherMatches.length === 0 && (
          <p className="text-sm font-bold text-slate-500">No hay partidos disponibles para esta jornada.</p>
        )}
      </Card>
    </div>
  );
}
