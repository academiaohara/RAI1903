"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDialog } from "@/components/AppDialogProvider";
import { Card } from "@/components/Card";
import { JornadaSelector } from "@/components/JornadaSelector";
import { PageHero } from "@/components/PageHero";
import { QuinielaTicket } from "@/components/juegos/GameTicket";
import { useInlineEditing } from "@/components/inline-editing/InlineEditingProvider";
import { QuinielaHowItWorks } from "@/components/QuinielaHowItWorks";
import { useSeason } from "@/components/season/SeasonProvider";
import { useQuinielaSeason } from "@/hooks/useQuinielaSeason";
import { buildQuinielaScoringContext, getSupportedTeamSquad, scoringOptionsForMatch } from "@/lib/quiniela/scoring-context";
import { quinielaRequiresAuth } from "@/lib/quiniela-storage";
import { loadSupportedTeamId, saveSupportedTeamId } from "@/lib/quiniela-supported-team";
import { SupportedTeamLastMatch, SupportedTeamPicker } from "@/components/quiniela/SupportedTeamSection";
import type { CompetitionSeasonId } from "@/data/mock";
import {
  countFinishedMatches,
  countOutcomeHits,
  getMatchdayByRound,
  scoreMatchdayPoints,
  hasFirstMatchStarted,
  isMatchdayComplete,
  isMatchdayFullyFinished,
  isScorerPredictionCorrect,
  isFeaturedTeamMatch,
  sortQuinielaMatches,
  shouldCountQuinielaPoints,
} from "@/lib/quiniela";
import { loadQuinielaState, saveQuinielaPredictions, saveQuinielaRound } from "@/lib/quiniela-storage";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { resolveUserHandle } from "@/lib/auth/profile";
import { getTeamById } from "@/lib/quiniela";
import {
  isValidQuinielaScorerSelection,
  withResolvedScorer,
} from "@/lib/quiniela-scorer";
import type { Matchday, Prediction } from "@/types";
import type { User } from "@supabase/supabase-js";

type PronosticosBodyProps = {
  seasonId: CompetitionSeasonId;
  matchdays: Matchday[];
  teams: ReturnType<typeof useQuinielaSeason>["teams"];
  currentRound: number;
  totalRounds: number;
  bundlesLoading: boolean;
  onFeaturedTeamNameChange?: (name: string) => void;
};

function PronosticosBody({
  seasonId,
  matchdays,
  teams,
  currentRound,
  totalRounds,
  bundlesLoading,
  onFeaturedTeamNameChange,
}: PronosticosBodyProps) {
  const { alert } = useAppDialog();
  const { bundles, viewedSeason, getCompetitionConfig } = useSeason();
  const { canEdit: isCmsEditor, getOverride } = useInlineEditing();
  const [supportedTeamId, setSupportedTeamId] = useState<string | null>(null);
  const scoringContext = useMemo(
    () =>
      buildQuinielaScoringContext(
        bundles,
        matchdays,
        supportedTeamId ?? undefined,
        getOverride,
      ),
    [bundles, getOverride, matchdays, supportedTeamId],
  );
  const [round, setRound] = useState(currentRound);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [savedRounds, setSavedRounds] = useState<Record<number, string>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [userHandle, setUserHandle] = useState("@usuario");
  const [isEditing, setIsEditing] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async (user: User | null) => {
      const state = await loadQuinielaState(user?.id ?? null, seasonId);
      if (cancelled) return;
      setPredictions(state.predictions);
      setSavedRounds(state.savedRounds);
      setUserId(user?.id ?? null);
      setUserHandle(user ? await resolveUserHandle(user) : "@usuario");
      const hasSaved =
        Object.keys(state.savedRounds).length > 0 || Object.keys(state.predictions).length > 0;
      const teamId = await loadSupportedTeamId(user?.id ?? null, { hasSavedQuiniela: hasSaved });
      setSupportedTeamId(teamId);
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
  const orderedMatches = useMemo(
    () => sortQuinielaMatches(selectedMatchday.matches, supportedTeamId ?? undefined),
    [selectedMatchday.matches, supportedTeamId],
  );
  const hasMatchesForRound = selectedMatchday.matches.length > 0;
  const isSaved = Boolean(savedRounds[round]);
  const isLocked = hasFirstMatchStarted(selectedMatchday);
  const readOnly = isLocked || (isSaved && !isEditing);
  const canEdit = isSaved && !isLocked;
  const canSave = !isLocked && (!isSaved || isEditing);
  const saveDisabled = quinielaRequiresAuth() && !userId;
  const needsLogin = quinielaRequiresAuth() && hydrated && !userId;
  const finishedMatches = countFinishedMatches(selectedMatchday);
  const jornadaFinalizada = isMatchdayFullyFinished(selectedMatchday);
  const hits = countOutcomeHits(selectedMatchday, predictions);
  const matchdayPoints = useMemo(
    () =>
      scoreMatchdayPoints(selectedMatchday, predictions, (match) =>
        scoringOptionsForMatch(scoringContext, match),
      ),
    [selectedMatchday, predictions, scoringContext],
  );
  const showScore = hydrated && shouldCountQuinielaPoints(selectedMatchday);
  const scorerCorrectByMatch = useMemo(
    () =>
      Object.fromEntries(
        selectedMatchday.matches
          .filter((match) => match.status === "finished" && isFeaturedTeamMatch(match, supportedTeamId ?? "") && (predictions[match.id]?.scorerId || predictions[match.id]?.scorer))
          .map((match) => [
            match.id,
            isScorerPredictionCorrect(
              match,
              predictions[match.id]!,
              scoringOptionsForMatch(scoringContext, match),
            ),
          ]),
      ),
    [predictions, scoringContext, selectedMatchday.matches, supportedTeamId],
  );
  const featuredSquad = useMemo(() => getSupportedTeamSquad(scoringContext), [scoringContext]);
  const statusBanner = useMemo(() => {
    if (jornadaFinalizada) return "finished" as const;
    if (isLocked) return "locked" as const;
    if (isSaved && !isEditing) return "saved" as const;
    if (!isSaved) return "unsaved" as const;
    return null;
  }, [jornadaFinalizada, isLocked, isSaved, isEditing]);

  const updatePrediction = useCallback(
    (prediction: Prediction) => {
      setPredictions((current) => {
        const next = { ...current, [prediction.matchId]: prediction };
        if (!isSaved || isEditing) {
          void saveQuinielaPredictions(userId, next, seasonId);
        }
        return next;
      });
    },
    [isSaved, isEditing, userId, seasonId],
  );

  const handleSave = async () => {
    if (quinielaRequiresAuth() && !userId) {
      await alert("Inicia sesión para guardar tu quiniela y aparecer en el ranking.");
      return;
    }
    if (!isMatchdayComplete(selectedMatchday, predictions, supportedTeamId ?? undefined)) {
      await alert("Completa los 10 partidos (signo 1-X-2 y porra de tu equipo si aplica) antes de guardar.");
      return;
    }
    const normalizedPredictions = Object.fromEntries(
      Object.entries(predictions).map(([matchId, prediction]) => [
        matchId,
        withResolvedScorer(featuredSquad, prediction),
      ]),
    );
    const hasInvalidScorer = selectedMatchday.matches.some((match) => {
      if (!isFeaturedTeamMatch(match, supportedTeamId ?? "")) return false;
      const prediction = normalizedPredictions[match.id];
      return !isValidQuinielaScorerSelection(featuredSquad, prediction?.scorerId, prediction?.scorer);
    });
    if (hasInvalidScorer) {
      await alert("Selecciona el goleador de tu equipo en la lista de la plantilla.");
      return;
    }
    setPredictions(normalizedPredictions);
    void saveQuinielaPredictions(userId, normalizedPredictions, seasonId);
    void saveQuinielaRound(userId, round, seasonId);
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

  const handleSupportedTeamChange = (teamId: string) => {
    setSupportedTeamId(teamId);
    void saveSupportedTeamId(userId, teamId);
  };

  const featuredTeam = useMemo(
    () => (supportedTeamId ? getTeamById(supportedTeamId, teams) : null),
    [supportedTeamId, teams],
  );
  const featuredTeamName = featuredTeam?.name ?? "Real Avilés Industrial";

  useEffect(() => {
    onFeaturedTeamNameChange?.(featuredTeamName);
  }, [featuredTeamName, onFeaturedTeamNameChange]);

  return (
    <>
      {hydrated && supportedTeamId ? (
        <div className="space-y-4">
          <SupportedTeamPicker
            teams={teams}
            value={supportedTeamId}
            onChange={handleSupportedTeamChange}
            disabled={isLocked && isSaved && !isEditing}
          />
          <SupportedTeamLastMatch supportedTeamId={supportedTeamId} matchdays={matchdays} />
        </div>
      ) : null}

      <JornadaSelector
        value={round}
        total={totalRounds}
        currentRound={currentRound}
        onChange={handleRoundChange}
      />

      {needsLogin && (
        <p className="rounded-xl border border-[#214C9B]/25 bg-blue-50 px-3 py-2 text-xs font-bold text-[#214C9B] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
          Puedes rellenar el boleto en tu navegador, pero inicia sesión para guardarlo y aparecer en los rankings.
        </p>
      )}

      {hydrated && statusBanner === "unsaved" && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
          No has hecho la quiniela de la jornada {round}. Rellena los partidos y pulsa Guardar.
        </p>
      )}

      {hydrated && statusBanner === "locked" && (
        <p className="rounded-xl border border-[#981915]/30 bg-[#981915]/10 px-3 py-2 text-xs font-bold text-[#981915] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
          La jornada {round} ya ha empezado: tu quiniela queda cerrada.
        </p>
      )}

      {hydrated && statusBanner === "saved" && (
        <p className="rounded-xl border border-[#214C9B]/20 bg-blue-50 px-3 py-2 text-xs font-bold text-[#214C9B] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
          RAIniela guardada. Pulsa Editar si quieres modificar algo antes del pitido inicial.
        </p>
      )}

      {hydrated && statusBanner === "finished" && (
        <p className="rounded-xl border border-[#981915]/30 bg-[#981915]/10 px-3 py-2 text-xs font-bold text-[#981915] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
          La jornada {round} esta finalizada: todos los partidos tienen resultado oficial.
        </p>
      )}

      <Card eyebrow={`Jornada ${selectedMatchday.round}`} title="Tu boleto">
        {!bundlesLoading && !hasMatchesForRound && (
          <p className="mb-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 sm:mb-4 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
            {isCmsEditor ? (
              <>
                No hay partidos del Grupo I configurados para la jornada {round}. Asigna equipos reales en Jornadas o
                guarda el calendario en Editar → Competición.
              </>
            ) : (
              <>No hay partidos del Grupo I disponibles para la jornada {round}.</>
            )}
          </p>
        )}

        {hydrated && isSaved && finishedMatches > 0 && (
          <p className="mb-3 text-xs font-bold text-slate-700 sm:mb-4 sm:text-sm">
            Aciertos:{" "}
            <span className="text-[#214C9B]">
              {hits} de {finishedMatches}
            </span>
            {jornadaFinalizada ? " (jornada completa)" : " (partidos con resultado)"}
          </p>
        )}

        {hasMatchesForRound ? (
          <QuinielaTicket
            matches={orderedMatches}
            teams={teams}
            predictions={predictions}
            round={round}
            seasonLabel={viewedSeason.label}
            competitionLabel={getCompetitionConfig("masculino").ligaLabel ?? "1ª RFEF — Grupo 1"}
            supportedTeamId={supportedTeamId ?? undefined}
            featuredSquad={getSupportedTeamSquad(scoringContext)}
            readOnly={readOnly}
            onChange={updatePrediction}
            creatorHandle={userHandle}
            points={showScore ? matchdayPoints : undefined}
            scorerCorrectByMatch={scorerCorrectByMatch}
            savedAt={savedRounds[round]}
            canSave={canSave}
            canEdit={canEdit}
            onSave={() => void handleSave()}
            onEdit={handleEdit}
            saveDisabled={saveDisabled}
            isEditing={isEditing}
            showLoginPrompt={false}
          />
        ) : null}
      </Card>
    </>
  );
}

export default function MiQuinielaPage() {
  const { matchdays, teams, currentRound, totalRounds, seasonId, bundlesLoading } = useQuinielaSeason();
  const [featuredTeamName, setFeaturedTeamName] = useState("Real Avilés Industrial");

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="RAIniela"
        title="Pronósticos"
        description="Marca directamente tu RAIniela con los 10 partidos del Grupo I. Al guardar queda bloqueada hasta que pulses editar; cuando empiece el primer partido ya no podrás cambiarla."
      />
      <QuinielaHowItWorks featuredTeamName={featuredTeamName} />
      {bundlesLoading ? (
        <p className="text-sm font-bold text-slate-500">Cargando partidos…</p>
      ) : null}
      <PronosticosBody
        key={seasonId}
        seasonId={seasonId}
        matchdays={matchdays}
        teams={teams}
        currentRound={currentRound}
        totalRounds={totalRounds}
        bundlesLoading={bundlesLoading}
        onFeaturedTeamNameChange={setFeaturedTeamName}
      />
    </div>
  );
}
