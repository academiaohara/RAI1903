"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDialog } from "@/components/AppDialogProvider";
import { Card } from "@/components/Card";
import { JornadaSelector } from "@/components/JornadaSelector";
import { PageHero } from "@/components/PageHero";
import { QuinigolMatchForm } from "@/components/quinigol/QuinigolMatchForm";
import { bebasNeue } from "@/lib/fonts";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { useQuinielaSeason } from "@/hooks/useQuinielaSeason";
import type { CompetitionSeasonId } from "@/data/mock";
import {
  countQuinigolHits,
  isQuinigolMatchdayComplete,
  scoreQuinigolMatchday,
  type QuinigolPrediction,
} from "@/lib/quinigol";
import { getMatchdayByRound, countFinishedMatches, hasFirstMatchStarted, isMatchdayFullyFinished } from "@/lib/quiniela";
import { loadQuinigolState, quinigolRequiresAuth, saveQuinigolPredictions, saveQuinigolRound } from "@/lib/quinigol-storage";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Matchday } from "@/types";
import type { User } from "@supabase/supabase-js";

type QuinigolBodyProps = {
  seasonId: CompetitionSeasonId;
  matchdays: Matchday[];
  currentRound: number;
  totalRounds: number;
  bundlesLoading: boolean;
};

function QuinigolBody({ seasonId, matchdays, currentRound, totalRounds, bundlesLoading }: QuinigolBodyProps) {
  const { alert } = useAppDialog();
  const { canEdit: isCmsEditor } = useInlineEditing();
  const [round, setRound] = useState(currentRound);
  const [predictions, setPredictions] = useState<Record<string, QuinigolPrediction>>({});
  const [savedRounds, setSavedRounds] = useState<Record<number, string>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async (user: User | null) => {
      const state = await loadQuinigolState(user?.id ?? null, seasonId);
      if (cancelled) return;
      setPredictions(state.predictions);
      setSavedRounds(state.savedRounds);
      setUserId(user?.id ?? null);
      setIsEditing(false);
      setHydrated(true);
    };

    if (!isSupabaseConfigured()) {
      void hydrate(null);
      return () => {
        cancelled = true;
      };
    }

    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => void hydrate(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void hydrate(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [seasonId]);

  const selectedMatchday = useMemo(() => getMatchdayByRound(matchdays, round), [matchdays, round]);
  const hasMatchesForRound = selectedMatchday.matches.length > 0;
  const isSaved = Boolean(savedRounds[round]);
  const isLocked = hasFirstMatchStarted(selectedMatchday);
  const readOnly = isLocked || (isSaved && !isEditing);
  const canEdit = isSaved && !isLocked;
  const canSave = !isLocked && (!isSaved || isEditing);
  const saveDisabled = quinigolRequiresAuth() && !userId;
  const finishedMatches = countFinishedMatches(selectedMatchday);
  const jornadaFinalizada = isMatchdayFullyFinished(selectedMatchday);
  const hits = countQuinigolHits(selectedMatchday, predictions);
  const matchdayPoints = useMemo(
    () => scoreQuinigolMatchday(selectedMatchday, predictions),
    [selectedMatchday, predictions],
  );
  const needsLogin = quinigolRequiresAuth() && hydrated && !userId;
  const showCompare = readOnly && (isLocked || finishedMatches > 0);
  const showScore = hydrated && finishedMatches > 0;

  const updatePrediction = useCallback(
    (prediction: QuinigolPrediction) => {
      setPredictions((current) => {
        const next = { ...current, [prediction.matchId]: prediction };
        if (!isSaved || isEditing) {
          void saveQuinigolPredictions(userId, next, seasonId);
        }
        return next;
      });
    },
    [isSaved, isEditing, userId, seasonId],
  );

  const handleSave = async () => {
    if (!isQuinigolMatchdayComplete(selectedMatchday, predictions)) {
      await alert("Completa el resultado 0-1-2-M de todos los partidos antes de guardar.");
      return;
    }
    void saveQuinigolPredictions(userId, predictions, seasonId);
    void saveQuinigolRound(userId, round, seasonId);
    setSavedRounds((current) => ({ ...current, [round]: new Date().toISOString() }));
    setIsEditing(false);
  };

  return (
    <>
      <JornadaSelector
        value={round}
        total={totalRounds}
        currentRound={currentRound}
        onChange={(nextRound) => {
          setRound(nextRound);
          setIsEditing(false);
        }}
      />

      {needsLogin && (
        <p className="rounded-xl border border-[#214C9B]/25 bg-blue-50 px-3 py-2 text-xs font-bold text-[#214C9B] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
          Inicia sesión para guardar tu quinigol en Supabase y aparecer en el ranking.
        </p>
      )}

      {hydrated && !isSaved && !isLocked && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
          Rellena el quinigol de la jornada {round} (0-1-2-M por equipo) y pulsa Guardar antes del pitido inicial.
        </p>
      )}

      {hydrated && isLocked && (
        <p className="rounded-xl border border-[#981915]/30 bg-[#981915]/10 px-3 py-2 text-xs font-bold text-[#981915] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
          La jornada {round} ya ha empezado: tu quinigol queda cerrado.
        </p>
      )}

      {hydrated && isSaved && !isLocked && !isEditing && (
        <p className="rounded-xl border border-[#214C9B]/20 bg-blue-50 px-3 py-2 text-xs font-bold text-[#214C9B] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
          Quinigol guardado. Pulsa Editar si quieres modificar algo antes del pitido inicial.
        </p>
      )}

      {hydrated && jornadaFinalizada && (
        <p className="rounded-xl border border-[#981915]/30 bg-[#981915]/10 px-3 py-2 text-xs font-bold text-[#981915] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
          La jornada {round} está finalizada.
        </p>
      )}

      <Card
        eyebrow={`Jornada ${selectedMatchday.round}`}
        title="Tu quinigol"
        action={
          showScore ? (
            <div
              className="flex min-w-[4.5rem] flex-col items-center rounded-2xl border border-[#214C9B]/15 bg-slate-50/80 px-3 py-2 text-center sm:min-w-[5.5rem] sm:px-4 sm:py-2.5"
              aria-label={`Puntuación de la jornada: ${matchdayPoints} puntos`}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#981915] sm:text-xs">Puntos</p>
              <p
                className={`${bebasNeue.className} text-[1.35rem] font-normal leading-[0.9] tracking-[0.25px] text-[#214C9B] tabular-nums sm:text-[64px] sm:tracking-[1px] lg:text-[72px]`}
              >
                {matchdayPoints}
              </p>
            </div>
          ) : undefined
        }
      >
        {!bundlesLoading && !hasMatchesForRound && (
          <p className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 sm:mb-4 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
            {isCmsEditor
              ? `No hay partidos del Grupo I configurados para la jornada ${round}.`
              : `No hay partidos del Grupo I disponibles para la jornada ${round}.`}
          </p>
        )}

        {hydrated && isSaved && finishedMatches > 0 && (
          <p className="mb-3 text-xs font-bold text-slate-700 sm:mb-4 sm:text-sm">
            Aciertos: <span className="text-[#214C9B]">{hits}</span> de {finishedMatches}
          </p>
        )}

        <div className="space-y-2.5 sm:space-y-4">
          {selectedMatchday.matches.map((match) => (
            <QuinigolMatchForm
              key={match.id}
              match={match}
              prediction={predictions[match.id]}
              readOnly={readOnly}
              mode={showCompare ? "compare" : "edit"}
              onChange={updatePrediction}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-[#214C9B]/15 pt-3 sm:mt-6 sm:gap-3 sm:pt-5">
          {canSave && (
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saveDisabled}
              className="rounded-xl bg-[#214C9B] px-4 py-2.5 text-xs font-extrabold uppercase text-white transition hover:bg-[#173a78] disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-2xl sm:px-6 sm:py-3 sm:text-sm"
            >
              Guardar
            </button>
          )}
          {canEdit && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={isEditing}
              className="rounded-xl border border-[#214C9B]/30 bg-white px-4 py-2.5 text-xs font-extrabold uppercase text-[#214C9B] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-2xl sm:px-6 sm:py-3 sm:text-sm"
            >
              Editar
            </button>
          )}
        </div>
      </Card>
    </>
  );
}

export default function QuinigolPronosticosPage() {
  const { matchdays, currentRound, totalRounds, seasonId, bundlesLoading } = useQuinielaSeason();

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Quinigol"
        title="Pronósticos"
        description="Marca el resultado de cada partido con 0, 1, 2 o M (3 o más goles) por equipo. Un punto por acierto. Cierra antes del primer partido de la jornada."
      />
      {bundlesLoading ? <p className="text-sm font-bold text-slate-500">Cargando partidos…</p> : null}
      <QuinigolBody
        key={seasonId}
        seasonId={seasonId}
        matchdays={matchdays}
        currentRound={currentRound}
        totalRounds={totalRounds}
        bundlesLoading={bundlesLoading}
      />
    </div>
  );
}
