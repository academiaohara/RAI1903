"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { JornadaSelector } from "@/components/JornadaSelector";
import { PageHero } from "@/components/PageHero";
import { PredictionForm } from "@/components/PredictionForm";
import { QuinielaRankingList } from "@/components/quiniela/QuinielaRankingList";
import { QuinielaViewToggle } from "@/components/QuinielaViewToggle";
import { useQuinielaRoundRanking } from "@/hooks/useQuinielaRoundRanking";
import { useQuinielaSeason } from "@/hooks/useQuinielaSeason";
import type { CompetitionSeasonId } from "@/data/mock";
import {
  getMatchdayByRound,
  hasFirstMatchStarted,
  sortQuinielaMatches,
} from "@/lib/quiniela";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Matchday } from "@/types";

type ResultadoView = "quiniela" | "ranking";

type ResultadoBodyProps = {
  seasonId: CompetitionSeasonId;
  matchdays: Matchday[];
  currentRound: number;
  totalRounds: number;
};

function ResultadoBody({ seasonId, matchdays, currentRound, totalRounds }: ResultadoBodyProps) {
  const [round, setRound] = useState(currentRound);
  const [view, setView] = useState<ResultadoView>("quiniela");

  const selectedMatchday = useMemo(() => getMatchdayByRound(matchdays, round), [matchdays, round]);
  const orderedMatches = useMemo(
    () => sortQuinielaMatches(selectedMatchday.matches),
    [selectedMatchday.matches],
  );
  const hasMatchesForRound = selectedMatchday.matches.length > 0;
  const started = hasFirstMatchStarted(selectedMatchday);
  const { entries: rankingEntries, loading: rankingLoading } = useQuinielaRoundRanking(
    seasonId,
    selectedMatchday,
  );

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
          className="mb-5"
        />

        {view === "quiniela" ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Signos 1-X-2 y goles del Avilés oficiales de la jornada. Las casillas con resultado aparecen en granate.
            </p>
            {!hasMatchesForRound && (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
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
        ) : (
          <>
            <QuinielaRankingList
              entries={rankingEntries}
              showHits={started}
              emptyMessage={
                isSupabaseConfigured()
                  ? "Nadie ha guardado la quiniela de esta jornada todavía."
                  : "Conecta Supabase e inicia sesión para ver el ranking de participantes."
              }
            />

            {!started && rankingEntries.length > 0 && (
              <p className="mt-4 text-sm text-slate-500">
                Todos los participantes aparecen con 0 puntos hasta que empiece el primer partido de la jornada.
              </p>
            )}
          </>
        )}
      </Card>
    </>
  );
}

export default function QuinielaResultadoPage() {
  const { matchdays, currentRound, totalRounds, seasonId } = useQuinielaSeason();

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Quiniela"
        title="Resultado"
        description="Consulta el resultado oficial de la jornada del Grupo I o la clasificacion de quienes enviaron pronostico."
      />
      <ResultadoBody
        key={seasonId}
        seasonId={seasonId}
        matchdays={matchdays}
        currentRound={currentRound}
        totalRounds={totalRounds}
      />
    </div>
  );
}
