"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { JornadaSelector } from "@/components/JornadaSelector";
import { PageHero } from "@/components/PageHero";
import { PredictionForm } from "@/components/PredictionForm";
import { QuinielaHowItWorks } from "@/components/QuinielaHowItWorks";
import { CURRENT_QUINIELA_ROUND, matchdays } from "@/data/mock";
import {
  getMatchdayByRound,
  hasFirstMatchStarted,
  isMatchdayComplete,
  sortQuinielaMatches,
} from "@/lib/quiniela";
import { loadPredictions, loadSavedRounds, savePredictions, saveRoundAsSaved } from "@/lib/storage";
import type { Prediction } from "@/types";

export default function MiQuinielaPage() {
  const [round, setRound] = useState(CURRENT_QUINIELA_ROUND);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [savedRounds, setSavedRounds] = useState<Record<number, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPredictions(loadPredictions());
      setSavedRounds(loadSavedRounds());
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const selectedMatchday = useMemo(() => getMatchdayByRound(round), [round]);
  const orderedMatches = useMemo(
    () => sortQuinielaMatches(selectedMatchday.matches),
    [selectedMatchday.matches],
  );
  const isSaved = Boolean(savedRounds[round]);
  const isLocked = hasFirstMatchStarted(selectedMatchday);
  const readOnly = isLocked || (isSaved && !isEditing);
  const canEdit = isSaved && !isLocked;
  const canSave = !isLocked && (!isSaved || isEditing);

  const updatePrediction = useCallback((prediction: Prediction) => {
    setPredictions((current) => {
      const next = { ...current, [prediction.matchId]: prediction };
      if (!isSaved || isEditing) {
        savePredictions(next);
      }
      return next;
    });
  }, [isSaved, isEditing]);

  const handleSave = () => {
    if (!isMatchdayComplete(selectedMatchday, predictions)) {
      window.alert("Completa los 10 partidos (signo 1-X-2 y porra del Aviles si aplica) antes de guardar.");
      return;
    }
    savePredictions(predictions);
    saveRoundAsSaved(round);
    setSavedRounds((current) => ({ ...current, [round]: new Date().toISOString() }));
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (isLocked) return;
    setIsEditing(true);
  };

  const handleRoundChange = (nextRound: number) => {
    setRound(nextRound);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Quiniela"
        title="Mi quiniela"
        description="Rellena la quiniela de la jornada. Al guardar queda bloqueada hasta que pulses editar. Cuando empiece el primer partido ya no podras cambiarla."
      />
      <QuinielaHowItWorks />
      <JornadaSelector
        value={round}
        total={matchdays.length}
        currentRound={CURRENT_QUINIELA_ROUND}
        onChange={handleRoundChange}
      />

      {hydrated && isLocked && (
        <p className="rounded-2xl border border-[#981915]/30 bg-[#981915]/10 px-4 py-3 text-sm font-bold text-[#981915]">
          La jornada {round} ya ha empezado: tu quiniela queda cerrada.
        </p>
      )}
      {hydrated && isSaved && !isEditing && !isLocked && (
        <p className="rounded-2xl border border-[#214C9B]/20 bg-blue-50 px-4 py-3 text-sm font-bold text-[#214C9B]">
          Quiniela guardada. Pulsa Editar si quieres modificar algo antes del pitido inicial.
        </p>
      )}

      <Card eyebrow={`Jornada ${selectedMatchday.round}`}>
        <div className="space-y-4">
          {orderedMatches.map((match) => (
            <PredictionForm
              key={match.id}
              match={match}
              prediction={predictions[match.id]}
              readOnly={readOnly}
              onChange={updatePrediction}
            />
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-[#214C9B]/15 pt-5">
          {canSave && (
            <button
              type="button"
              onClick={handleSave}
              className="rounded-2xl bg-[#214C9B] px-6 py-3 text-sm font-extrabold uppercase text-white transition hover:bg-[#173a78]"
            >
              Guardar
            </button>
          )}
          {canEdit && (
            <button
              type="button"
              onClick={handleEdit}
              disabled={isEditing}
              className="rounded-2xl border border-[#214C9B]/30 bg-white px-6 py-3 text-sm font-extrabold uppercase text-[#214C9B] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Editar
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
