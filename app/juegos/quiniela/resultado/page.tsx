"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { JornadaSelector } from "@/components/JornadaSelector";
import { PageHero } from "@/components/PageHero";
import { PredictionForm } from "@/components/PredictionForm";
import { QuinielaRankingList } from "@/components/quiniela/QuinielaRankingList";
import { QuinielaViewToggle } from "@/components/QuinielaViewToggle";
import { useSeason } from "@/components/season/SeasonProvider";
import { useQuinielaRoundRanking } from "@/hooks/useQuinielaRoundRanking";
import { useQuinielaSeason } from "@/hooks/useQuinielaSeason";
import type { CompetitionSeasonId } from "@/data/mock";
import { getMatchdayByRound, sortQuinielaMatches } from "@/lib/quiniela";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Matchday } from "@/types";

type ResultadoView = "quiniela" | "ranking";

type ResultadoBodyProps = {
  seasonId: CompetitionSeasonId;
  matchdays: Matchday[];
  teams: ReturnType<typeof useQuinielaSeason>["teams"];
  seasonLabel: string;
  competitionLabel: string;
  currentRound: number;
  totalRounds: number;
};

function ResultadoBody({
  seasonId,
  matchdays,
  teams,
  seasonLabel,
  competitionLabel,
  currentRound,
  totalRounds,
}: ResultadoBodyProps) {
  const [round, setRound] = useState(currentRound);
  const [view, setView] = useState<ResultadoView>("quiniela");

  const selectedMatchday = useMemo(() => getMatchdayByRound(matchdays, round), [matchdays, round]);
  const orderedMatches = useMemo(
    () => sortQuinielaMatches(selectedMatchday.matches),
    [selectedMatchday.matches],
  );
  const hasMatchesForRound = selectedMatchday.matches.length > 0;
  const { entries: rankingEntries, loading: rankingLoading, countPoints, error: rankingError } =
    useQuinielaRoundRanking(seasonId, selectedMatchday);
  const started = countPoints;

  return (
    <>
      <JornadaSelector
        value={round}
        total={totalRounds}
        currentRound={currentRound}
        onChange={setRound}
      />

      <Card eyebrow={`Jornada ${round}`} title="Resultado de la jornada">
        <QuinielaViewToggle
          value={view}
          onChange={setView}
          layoutId="quiniela-resultado-view"
          options={[
            { id: "quiniela", label: "Resultado quiniela" },
            { id: "ranking", label: "Ranking jornada" },
          ]}
          className="mb-3 sm:mb-5"
        />

        {view === "quiniela" ? (
          <div className="space-y-4">
            <p className="text-xs leading-5 text-slate-600 sm:text-sm">
              Signos 1-X-2 y goles del Avilés oficiales de la jornada. Las casillas con resultado aparecen en granate.
            </p>
            {!hasMatchesForRound && (
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
                No hay partidos del Grupo I configurados para la jornada {round}.
              </p>
            )}
            {orderedMatches.map((match) => (
              <PredictionForm
                key={match.id}
                match={match}
                mode="results"
                readOnly
                onChange={() => undefined}
              />
            ))}
          </div>
        ) : rankingLoading ? (
          <p className="text-sm text-slate-500">Cargando participantes…</p>
        ) : rankingError ? (
          <p className="text-sm font-semibold text-[#981915]">{rankingError}</p>
        ) : (
          <>
            <QuinielaRankingList
              entries={rankingEntries}
              seasonId={seasonId}
              matchdays={matchdays}
              teams={teams}
              seasonLabel={seasonLabel}
              competitionLabel={competitionLabel}
              totalRounds={totalRounds}
              currentRound={currentRound}
              initialModalRound={round}
              emptyMessage={
                isSupabaseConfigured()
                  ? "Nadie ha guardado la quiniela de esta jornada todavía."
                  : "Conecta Supabase e inicia sesión para ver el ranking de participantes."
              }
            />

            {!started && rankingEntries.length > 0 && (
              <p className="mt-3 text-xs text-slate-500 sm:mt-4 sm:text-sm">
                Los puntos se publican cuando empiece la jornada o haya resultados oficiales cargados en el
                calendario.
              </p>
            )}
          </>
        )}
      </Card>
    </>
  );
}

export default function QuinielaResultadoPage() {
  const { viewedSeason, getCompetitionConfig } = useSeason();
  const { matchdays, teams, currentRound, totalRounds, seasonId } = useQuinielaSeason();
  const competitionLabel = getCompetitionConfig("masculino").ligaLabel ?? "1ª RFEF — Grupo 1";

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="RAIniela"
        title="Resultado"
        description="Consulta el resultado oficial de la jornada del Grupo I o la clasificacion de quienes enviaron pronostico."
      />
      <ResultadoBody
        key={seasonId}
        seasonId={seasonId}
        matchdays={matchdays}
        teams={teams}
        seasonLabel={viewedSeason.label}
        competitionLabel={competitionLabel}
        currentRound={currentRound}
        totalRounds={totalRounds}
      />
    </div>
  );
}
