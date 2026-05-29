"use client";

import { Card } from "@/components/Card";
import { JornadaMatchRow } from "@/components/jornadas/JornadaMatchRow";
import { JornadaRoundCarousel } from "@/components/jornadas/JornadaRoundCarousel";
import { JornadasGrupoSwitcher } from "@/components/jornadas/JornadasGrupoSwitcher";
import { buildJornadasDataset } from "@/lib/jornadas-data";
import { getRaiTeamId } from "@/lib/fixtures";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { RfefGrupoId } from "@/lib/rfef-grupos";
import type { JornadaFixture, JornadaRoundId } from "@/types/jornadas";
import { useMemo, useState } from "react";

type JornadasViewProps = {
  gender: PrimerEquipoGender;
};

function partitionMatches(matches: JornadaFixture[]) {
  const rai = matches.filter((m) => m.involvesRai);
  const rest = matches.filter((m) => !m.involvesRai);
  return { rai, rest };
}

export function JornadasView({ gender }: JornadasViewProps) {
  const dataset = useMemo(() => buildJornadasDataset(gender), [gender]);
  const raiTeamId = getRaiTeamId(gender);
  const [selectedRoundId, setSelectedRoundId] = useState<JornadaRoundId>(dataset.currentRoundId);
  const [grupo, setGrupo] = useState<RfefGrupoId>("1");

  const roundData = dataset.getRound(selectedRoundId);
  const { summary } = roundData;
  const grupoMatches = roundData.matchesByGrupo[grupo];
  const { rai: raiMatches, rest: otherMatches } = partitionMatches(grupoMatches);
  const showGrupoSwitcher = gender === "masculino" && summary.kind === "league";

  const title =
    summary.kind === "playoff"
      ? `Playoff de ascenso · ${summary.label}`
      : `Jornada ${summary.roundNumber}`;

  return (
    <div className="space-y-6">
      <JornadaRoundCarousel
        rounds={dataset.rounds}
        selectedId={selectedRoundId}
        onSelect={setSelectedRoundId}
      />

      <Card eyebrow="Resultados" title={title} borderlessHeader>
        {raiMatches.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-normal text-[#981915]">Real Avilés</p>
            {raiMatches.map((fixture) => (
              <JornadaMatchRow
                key={fixture.id}
                fixture={fixture}
                highlighted
                highlightTeamId={raiTeamId}
              />
            ))}
          </div>
        )}

        {summary.kind === "playoff" && raiMatches.length === 0 && (
          <p className="text-sm font-bold text-slate-600">
            Los cruces del playoff de ascenso se publicarán cuando estén confirmados. La estructura de datos
            ya está preparada para cargarlos desde API o JSON local.
          </p>
        )}

        {(otherMatches.length > 0 || showGrupoSwitcher) && (
          <div className={raiMatches.length > 0 ? "mt-8 space-y-4" : "space-y-4"}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-bold uppercase tracking-normal text-[#214C9B]">
                Resto de la jornada
              </p>
              {showGrupoSwitcher && <JornadasGrupoSwitcher value={grupo} onChange={setGrupo} />}
            </div>

            {otherMatches.length > 0 ? (
              <div className="space-y-2">
                {otherMatches.map((fixture) => (
                  <JornadaMatchRow key={fixture.id} fixture={fixture} highlightTeamId={raiTeamId} />
                ))}
              </div>
            ) : (
              <p className="text-sm font-bold text-slate-500">Sin partidos en este grupo para la jornada seleccionada.</p>
            )}
          </div>
        )}

        {summary.kind === "league" && raiMatches.length === 0 && otherMatches.length === 0 && (
          <p className="text-sm font-bold text-slate-500">No hay partidos disponibles para esta jornada.</p>
        )}
      </Card>
    </div>
  );
}
