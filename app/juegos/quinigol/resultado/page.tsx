"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { JornadaSelector } from "@/components/JornadaSelector";
import { PageHero } from "@/components/PageHero";
import { QuinigolRankingList } from "@/components/quinigol/QuinigolRankingList";
import { QuinigolMatchForm } from "@/components/quinigol/QuinigolMatchForm";
import { QuinielaViewToggle } from "@/components/QuinielaViewToggle";
import { useSeason } from "@/components/season/SeasonProvider";
import { useQuinigolRoundRanking } from "@/hooks/useGameRankings";
import { useGameJornadaRound } from "@/hooks/useGameJornadaRound";
import { useQuinielaSeason } from "@/hooks/useQuinielaSeason";
import type { CompetitionSeasonId } from "@/data/mock";
import { getMatchdayByRound } from "@/lib/quiniela";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Matchday } from "@/types";

type ResultadoView = "quinigol" | "ranking";

function QuinigolResultadoBody({
  seasonId,
  matchdays,
  teams,
  seasonLabel,
  competitionLabel,
  currentRound,
  totalRounds,
}: {
  seasonId: CompetitionSeasonId;
  matchdays: Matchday[];
  teams: ReturnType<typeof useQuinielaSeason>["teams"];
  seasonLabel: string;
  competitionLabel: string;
  currentRound: number;
  totalRounds: number;
}) {
  const { round, setRound } = useGameJornadaRound(matchdays, totalRounds, currentRound);
  const [view, setView] = useState<ResultadoView>("quinigol");
  const selectedMatchday = useMemo(() => getMatchdayByRound(matchdays, round), [matchdays, round]);
  const { entries, loading, countPoints, error } = useQuinigolRoundRanking(seasonId, selectedMatchday);

  return (
    <>
      <JornadaSelector value={round} total={totalRounds} currentRound={currentRound} onChange={setRound} />
      <Card eyebrow={`Jornada ${round}`} title="Resultado de la jornada">
        <QuinielaViewToggle
          value={view}
          onChange={setView}
          layoutId="quinigol-resultado-view"
          options={[
            { id: "quinigol", label: "Resultado quinigol" },
            { id: "ranking", label: "Ranking jornada" },
          ]}
          className="mb-3 sm:mb-5"
        />

        {view === "quinigol" ? (
          <div className="space-y-4">
            <p className="text-xs leading-5 text-slate-600 sm:text-sm">
              Resultados oficiales en formato 0-1-2-M. Las casillas con resultado aparecen en granate.
            </p>
            {selectedMatchday.matches.map((match) => (
              <QuinigolMatchForm key={match.id} match={match} mode="results" readOnly onChange={() => undefined} />
            ))}
          </div>
        ) : loading ? (
          <p className="text-sm text-slate-500">Cargando participantes…</p>
        ) : error ? (
          <p className="text-sm font-semibold text-[#981915]">{error}</p>
        ) : (
          <>
            <QuinigolRankingList
              entries={entries}
              countPoints={countPoints}
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
                  ? "Nadie ha guardado el quinigol de esta jornada todavía."
                  : "Conecta Supabase e inicia sesión para ver el ranking."
              }
            />
            {!countPoints && entries.length > 0 && (
              <p className="mt-3 text-xs text-slate-500 sm:mt-4 sm:text-sm">
                Los puntos se publican cuando empiece la jornada o haya resultados oficiales cargados.
              </p>
            )}
          </>
        )}
      </Card>
    </>
  );
}

export default function QuinigolResultadoPage() {
  const { viewedSeason, getCompetitionConfig } = useSeason();
  const { matchdays, teams, currentRound, totalRounds, seasonId } = useQuinielaSeason();
  const competitionLabel = getCompetitionConfig("masculino").ligaLabel ?? "1ª RFEF — Grupo 1";

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="RAIGol"
        title="Resultado"
        description="Consulta los resultados oficiales en formato quinigol o el ranking de la jornada."
      />
      <QuinigolResultadoBody
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
