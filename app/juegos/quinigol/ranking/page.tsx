"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { JornadaSelector } from "@/components/JornadaSelector";
import { PageHero } from "@/components/PageHero";
import { QuinigolRankingList } from "@/components/quinigol/QuinigolRankingList";
import { QuinielaViewToggle } from "@/components/QuinielaViewToggle";
import { useQuinigolRoundRanking, useQuinigolSeasonRanking } from "@/hooks/useGameRankings";
import { useQuinielaSeason } from "@/hooks/useQuinielaSeason";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getMatchdayByRound } from "@/lib/quiniela";

export default function QuinigolRankingPage() {
  const { seasonId, matchdays, currentRound, totalRounds } = useQuinielaSeason();
  const [round, setRound] = useState(currentRound);
  const [scope, setScope] = useState<"round" | "season">("round");
  const matchday = useMemo(() => getMatchdayByRound(matchdays, round), [matchdays, round]);
  const roundRanking = useQuinigolRoundRanking(seasonId, matchday);
  const seasonRanking = useQuinigolSeasonRanking(seasonId, round);
  const ranking = scope === "round" ? roundRanking : seasonRanking;
  const { entries, loading, countPoints, error } = ranking;

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="RAIGol"
        title="Ranking"
        description="Consulta la clasificación de cada jornada o la clasificación acumulada hasta la jornada seleccionada."
      />
      <JornadaSelector value={round} total={totalRounds} currentRound={currentRound} onChange={setRound} />
      <Card eyebrow={`Jornada ${round}`} title={scope === "round" ? "Clasificación de la jornada" : `Clasificación global hasta J${round}`}>
        <QuinielaViewToggle
          value={scope}
          onChange={setScope}
          layoutId="quinigol-ranking-scope"
          options={[
            { id: "round", label: `Jornada ${round}` },
            { id: "season", label: `Global hasta J${round}` },
          ]}
          className="mb-4"
        />
        {loading ? (
          <p className="text-sm text-slate-500">Cargando clasificación…</p>
        ) : error ? (
          <p className="text-sm font-semibold text-[#981915]">{error}</p>
        ) : (
          <>
            <QuinigolRankingList
            entries={entries}
            seasonId={seasonId}
            matchdays={matchdays}
            totalRounds={totalRounds}
            currentRound={currentRound}
            initialModalRound={round}
            emptyMessage={
              isSupabaseConfigured()
                ? `Aún no hay quinigoles puntuables hasta la jornada ${round}.`
                : "Conecta Supabase e inicia sesión para ver la clasificación."
            }
          />
          {!countPoints && entries.length > 0 && (
            <p className="mt-3 text-xs text-slate-500 sm:mt-4 sm:text-sm">
              Los puntos se publican cuando empiece la primera jornada disputada o haya resultados oficiales cargados.
            </p>
          )}
          </>
        )}
      </Card>
    </div>
  );
}
