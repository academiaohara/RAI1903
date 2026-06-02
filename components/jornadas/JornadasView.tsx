"use client";

import { Card } from "@/components/Card";
import { JornadaMatchesByDay } from "@/components/jornadas/JornadaMatchesByDay";
import { JornadaRoundCarousel } from "@/components/jornadas/JornadaRoundCarousel";
import { JornadasGrupoSwitcher } from "@/components/jornadas/JornadasGrupoSwitcher";
import { PlayoffAscensoGuia } from "@/components/jornadas/PlayoffAscensoGuia";
import { useSeason } from "@/components/season/SeasonProvider";
import { hasMultipleGrupos } from "@/lib/cms/competition-config-bundle";
import { buildJornadasDataset, groupFixturesByCalendarDay } from "@/lib/jornadas-data";
import { getRaiTeamId } from "@/lib/fixtures";
import { leagueRoundForQualifyingStandings } from "@/lib/playoff-jornadas";
import type { PrimerEquipoGender } from "@/lib/primer-equipo";
import type { RfefGrupoId } from "@/lib/rfef-grupos";
import type { JornadaRoundId } from "@/types/jornadas";
import { useCallback, useMemo, useState } from "react";

type JornadasViewProps = {
  gender: PrimerEquipoGender;
};

export function JornadasView({ gender }: JornadasViewProps) {
  const { getEnrichedFixtureSource, getCompetitionConfig } = useSeason();
  const competitionConfig = useMemo(() => getCompetitionConfig(gender), [gender, getCompetitionConfig]);
  const dataset = useMemo(
    () =>
      buildJornadasDataset(gender, getEnrichedFixtureSource(gender), {
        hasPlayoff: competitionConfig.hasPlayoff,
      }),
    [gender, getEnrichedFixtureSource, competitionConfig.hasPlayoff],
  );
  const raiTeamId = getRaiTeamId(gender);
  const [manualRoundId, setManualRoundId] = useState<JornadaRoundId | null>(null);
  const selectedRoundId = manualRoundId ?? dataset.currentRoundId;
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
      setManualRoundId(roundId);
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
  const matchesByDay = useMemo(() => groupFixturesByCalendarDay(grupoMatches), [grupoMatches]);
  const raiMatches = useMemo(() => grupoMatches.filter((match) => match.involvesRai), [grupoMatches]);
  const showGrupoSwitcher =
    gender === "masculino" && summary.kind === "league" && hasMultipleGrupos(competitionConfig);

  const title =
    summary.kind === "playoff"
      ? `Playoff de ascenso · ${summary.label}${summary.isProvisional ? " (provisional)" : ""}`
      : `Jornada ${summary.roundNumber}`;

  const showPlayoffGuia =
    gender === "masculino" && summary.kind === "playoff" && competitionConfig.hasPlayoff;
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
        {summary.kind === "playoff" && summary.isProvisional && (
          <p className="mb-6 text-sm font-bold text-slate-600">
            Cruces calculados según la clasificación tras la jornada de liga que tenías seleccionada. Al cerrar
            la temporada se muestran los equipos definitivos.
          </p>
        )}

        {summary.kind === "playoff" && raiMatches.length === 0 && matchesByDay.length === 0 && (
          <p className="text-sm font-bold text-slate-600">
            No hay partidos del Real Avilés en esta fase del playoff de ascenso.
          </p>
        )}

        {(matchesByDay.length > 0 || showGrupoSwitcher) && (
          <div className="space-y-4">
            {showGrupoSwitcher && (
              <div className="flex justify-end">
                <JornadasGrupoSwitcher value={grupo} onChange={setGrupo} />
              </div>
            )}

            <JornadaMatchesByDay
              groups={matchesByDay}
              highlightTeamId={raiTeamId}
              gender={gender}
              showCrests={showCrests}
              grupo={grupo}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
