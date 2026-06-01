"use client";

import { Card } from "@/components/Card";
import { JornadaMatchRow } from "@/components/jornadas/JornadaMatchRow";
import { JornadaRoundCarousel } from "@/components/jornadas/JornadaRoundCarousel";
import { JornadasGrupoSwitcher } from "@/components/jornadas/JornadasGrupoSwitcher";
import { PlayoffAscensoGuia } from "@/components/jornadas/PlayoffAscensoGuia";
import { useSeason } from "@/components/season/SeasonProvider";
import { buildJornadasDataset } from "@/lib/jornadas-data";
import { getRaiTeamId } from "@/lib/fixtures";
import { leagueRoundForQualifyingStandings } from "@/lib/playoff-jornadas";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { RfefGrupoId } from "@/lib/rfef-grupos";
import type { JornadaFixture, JornadaRoundId } from "@/types/jornadas";
import { useCallback, useMemo, useState } from "react";

type JornadasViewProps = {
  gender: PrimerEquipoGender;
};

function partitionMatches(matches: JornadaFixture[]) {
  const rai = matches.filter((m) => m.involvesRai);
  const rest = matches.filter((m) => !m.involvesRai);
  return { rai, rest };
}

export function JornadasView({ gender }: JornadasViewProps) {
  const { getFixtureSource } = useSeason();
  const dataset = useMemo(
    () => buildJornadasDataset(gender, getFixtureSource(gender)),
    [gender, getFixtureSource],
  );
  const raiTeamId = getRaiTeamId(gender);
  const [selectedRoundId, setSelectedRoundId] = useState<JornadaRoundId>(dataset.currentRoundId);
  const [lastLeagueQualifyingRound, setLastLeagueQualifyingRound] = useState(
    dataset.definitiveQualifyingLeagueRound,
  );
  const [grupo, setGrupo] = useState<RfefGrupoId>("1");

  const qualifyingLeagueRound = useMemo(() => {
    const summary = dataset.getRound(selectedRoundId).summary;
    if (summary.kind === "league" && summary.roundNumber) {
      return leagueRoundForQualifyingStandings(summary.roundNumber);
    }
    return lastLeagueQualifyingRound;
  }, [dataset, lastLeagueQualifyingRound, selectedRoundId]);

  const handleSelectRound = useCallback(
    (roundId: JornadaRoundId) => {
      setSelectedRoundId(roundId);
      const summary = dataset.getRound(roundId).summary;
      if (summary.kind === "league" && summary.roundNumber) {
        setLastLeagueQualifyingRound(leagueRoundForQualifyingStandings(summary.roundNumber));
      }
    },
    [dataset],
  );

  const roundData = dataset.getRound(selectedRoundId, { qualifyingLeagueRound });
  const { summary } = roundData;
  const grupoMatches =
    summary.kind === "playoff"
      ? roundData.matchesByGrupo["1"]
      : roundData.matchesByGrupo[grupo];
  const { rai: raiMatches, rest: otherMatches } = partitionMatches(grupoMatches);
  const showGrupoSwitcher = gender === "masculino" && summary.kind === "league";

  const title =
    summary.kind === "playoff"
      ? `Playoff de ascenso · ${summary.label}${summary.isProvisional ? " (provisional)" : ""}`
      : `Jornada ${summary.roundNumber}`;

  const showPlayoffGuia = gender === "masculino" && summary.kind === "playoff";
  const showCrests = gender !== "femenino";

  return (
    <div className="space-y-6">
      <JornadaRoundCarousel
        rounds={dataset.rounds}
        selectedId={selectedRoundId}
        onSelect={handleSelectRound}
        showCrests={showCrests}
      />

      {showPlayoffGuia && <PlayoffAscensoGuia isProvisional={summary.isProvisional} />}

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
                gender={gender}
                showCrests={showCrests}
              />
            ))}
          </div>
        )}

        {summary.kind === "playoff" && summary.isProvisional && (
          <p className="text-sm font-bold text-slate-600">
            Cruces calculados según la clasificación tras la jornada de liga que tenías seleccionada. Al cerrar
            la temporada se muestran los equipos definitivos.
          </p>
        )}

        {summary.kind === "playoff" && raiMatches.length === 0 && otherMatches.length === 0 && (
          <p className="text-sm font-bold text-slate-600">
            No hay partidos del Real Avilés en esta fase del playoff de ascenso.
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
                  <JornadaMatchRow
                    key={fixture.id}
                    fixture={fixture}
                    highlightTeamId={raiTeamId}
                    gender={gender}
                    showCrests={showCrests}
                  />
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
