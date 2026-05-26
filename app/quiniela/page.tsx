"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { JornadaSelector } from "@/components/JornadaSelector";
import { MatchCard } from "@/components/MatchCard";
import { PageHero } from "@/components/PageHero";
import { PredictionForm } from "@/components/PredictionForm";
import { SectionTabs } from "@/components/SectionTabs";
import { matchdayResult, matchdays, quinielaRanking } from "@/data/mock";
import { loadPredictions, savePredictions } from "@/lib/storage";
import type { Prediction } from "@/types";

const tabs = [
  { href: "#pronosticos", label: "Pronosticos" },
  { href: "#resultado", label: "Resultado" },
  { href: "#ranking", label: "Ranking" },
];

export default function QuinielaPage() {
  const [round, setRound] = useState(10);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});

  useEffect(() => {
    const timer = window.setTimeout(() => setPredictions(loadPredictions()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const selectedMatchday = useMemo(() => matchdays.find((matchday) => matchday.round === round) ?? matchdays[0], [round]);
  const currentRoundPredictions = selectedMatchday.matches.map((match) => predictions[match.id]).filter(Boolean);

  const updatePrediction = (prediction: Prediction) => {
    setPredictions((current) => {
      const next = { ...current, [prediction.matchId]: prediction };
      savePredictions(next);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <PageHero eyebrow="Quiniela" title="Pronosticos de la grada" description="Predicciones de usuarios, resultado de jornada y ranking mock. Hoy guarda en localStorage; manana puede persistir en Supabase." />
      <SectionTabs tabs={tabs} />

      <section id="pronosticos" className="space-y-6 scroll-mt-28">
        <JornadaSelector value={round} total={matchdays.length} onChange={setRound} />

        <div className="grid gap-6 xl:grid-cols-[1fr_0.38fr]">
          <Card eyebrow={`Jornada ${selectedMatchday.round}`} title="Pronosticos de usuarios">
            <div className="space-y-4">
              {selectedMatchday.matches.map((match) => (
                <PredictionForm key={match.id} match={match} prediction={predictions[match.id]} onChange={updatePrediction} />
              ))}
            </div>
          </Card>

          <Card eyebrow="Estado local" title="Resumen de tu quiniela">
            <div className="space-y-3">
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Pronosticos en jornada</p>
                <p className="mt-2 text-4xl font-black text-[#981915]">{currentRoundPredictions.length}/10</p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Total guardado</p>
                <p className="mt-2 text-4xl font-black text-[#214C9B]">{Object.keys(predictions).length}</p>
              </div>
              {currentRoundPredictions.length > 0 ? (
                <div className="space-y-2">
                  {currentRoundPredictions.map((prediction) => {
                    const match = selectedMatchday.matches.find((item) => item.id === prediction.matchId);
                    return (
                      <div key={prediction.matchId} className="rounded-2xl border border-[#981915]/20 bg-white p-3 text-sm text-slate-600">
                        <strong className="text-slate-900">{match?.homeTeam} - {match?.awayTeam}</strong>
                        <span className="mt-1 block">Signo: {prediction.outcome ?? "sin seleccionar"}</span>
                        {prediction.exactScore && <span className="block">Marcador: {prediction.exactScore.home}-{prediction.exactScore.away}</span>}
                        {prediction.scorers.length > 0 && <span className="block">Goleadores: {prediction.scorers.join(", ")}</span>}
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-sm leading-6 text-slate-400">Aun no hay pronosticos en esta jornada.</p>}
            </div>
          </Card>
        </div>
      </section>

      <section id="resultado" className="scroll-mt-28">
        <Card eyebrow={`Jornada ${matchdayResult.round}`} title="Resultado de la jornada">
          <div className="grid gap-5 lg:grid-cols-[1fr_0.7fr]">
            {matchdayResult.highlightedMatch && <MatchCard match={matchdayResult.highlightedMatch} />}
            <div className="grid grid-cols-3 gap-3">
              {[["Puntos", matchdayResult.pointsAvailable], ["Media", matchdayResult.averagePoints], ["Ganador", matchdayResult.bestUser.user]].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-[#214C9B]/20 bg-blue-50 p-4 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
                  <p className="mt-2 text-2xl font-black text-[#214C9B]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section id="ranking" className="scroll-mt-28">
        <Card eyebrow="Ranking" title="Clasificacion de usuarios">
          <div className="space-y-3">
            {quinielaRanking.map((row, index) => (
              <div key={row.user} className="grid items-center gap-3 rounded-2xl border border-[#981915]/20 bg-white p-4 text-sm sm:grid-cols-[auto_1fr_auto_auto_auto]">
                <Badge tone={index === 0 ? "red" : "blue"}>{index + 1}</Badge>
                <p className="font-black uppercase text-[#981915]">{row.user}</p>
                <span>{row.points} pts</span>
                <span>{row.hits} aciertos</span>
                <span>{row.exactScores} exactos</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
