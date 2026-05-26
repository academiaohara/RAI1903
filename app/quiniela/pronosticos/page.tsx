"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { JornadaSelector } from "@/components/JornadaSelector";
import { PageHero } from "@/components/PageHero";
import { PredictionForm } from "@/components/PredictionForm";
import { SectionTabs } from "@/components/SectionTabs";
import { matchdays } from "@/data/mock";
import { loadPredictions, savePredictions } from "@/lib/storage";
import type { Prediction } from "@/types";

const tabs = [
  { href: "/quiniela/pronosticos", label: "Pronosticos" },
  { href: "/quiniela/resultado", label: "Resultado" },
  { href: "/quiniela/ranking", label: "Ranking" },
];

export default function QuinielaPronosticosPage() {
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
      <PageHero eyebrow="Quiniela" title="Pronosticos" description="Predicciones de usuarios guardadas en localStorage." />
      <SectionTabs tabs={tabs} />
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
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-bold uppercase tracking-normal text-slate-500">Pronosticos en jornada</p>
              <p className="mt-2 text-4xl font-extrabold text-[#214C9B]">{currentRoundPredictions.length}/10</p>
            </div>
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
              <p className="text-xs font-bold uppercase tracking-normal text-slate-500">Total guardado</p>
              <p className="mt-2 text-4xl font-extrabold text-[#981915]">{Object.keys(predictions).length}</p>
            </div>
            {currentRoundPredictions.length > 0 ? (
              <div className="space-y-2">
                {currentRoundPredictions.map((prediction) => {
                  const match = selectedMatchday.matches.find((item) => item.id === prediction.matchId);
                  return (
                    <div key={prediction.matchId} className="rounded-2xl border border-[#214C9B]/20 bg-white p-3 text-sm text-slate-600">
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
    </div>
  );
}
