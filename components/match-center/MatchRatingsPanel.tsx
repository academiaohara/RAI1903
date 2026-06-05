"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { signInWithX } from "@/lib/auth/sign-in-with-x";
import { useMatchRatingsSeasonId } from "@/hooks/useMatchRatingsSeasonId";
import { useSquadPlayers } from "@/hooks/useSquadPlayers";
import { getAvilesPlayersWhoPlayed } from "@/lib/match-rating-eligibility";
import { formatFanRating } from "@/lib/format-fan-rating";
import {
  fetchMatchRatingAverages,
  fetchUserMatchRatings,
  migrateLegacyPlayerRatingsToSupabase,
  submitMatchRatings,
} from "@/lib/match-ratings-storage";
import { getPlayerFullName } from "@/lib/squad-utils";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { MatchDetail } from "@/types";
import type { User } from "@supabase/supabase-js";

type MatchRatingsPanelProps = {
  detail: MatchDetail;
};

const SLIDER_MIN = 0;
const SLIDER_MAX = 10;
const SLIDER_STEP = 0.5;
const SLIDER_DEFAULT = 5;

export function MatchRatingsPanel({ detail }: MatchRatingsPanelProps) {
  const { seasonId: ratingsSeasonId, resolving: resolvingSeason } = useMatchRatingsSeasonId(
    detail.match.id,
    detail.gender,
  );
  const { squad } = useSquadPlayers(detail.gender);
  const configured = isSupabaseConfigured();

  const eligiblePlayers = useMemo(
    () => getAvilesPlayersWhoPlayed(detail, squad),
    [detail, squad],
  );

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!configured);
  const [draftRatings, setDraftRatings] = useState<Record<string, number>>({});
  const [averages, setAverages] = useState<Record<string, { average: number; count: number }>>({});
  const sessionKey = `${ratingsSeasonId}:${detail.match.id}:${user?.id ?? "guest"}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = configured && (resolvingSeason || !authReady || loadedKey !== sessionKey);
  const [submitting, setSubmitting] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!configured) return;

    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [configured]);

  const reloadRatings = useCallback(async () => {
    if (!configured) return;
    if (user) await migrateLegacyPlayerRatingsToSupabase(user.id, detail.gender);

    const [communityAverages, userRatings] = await Promise.all([
      fetchMatchRatingAverages(detail.match.id, ratingsSeasonId),
      user ? fetchUserMatchRatings(user.id, detail.match.id, ratingsSeasonId) : Promise.resolve({}),
    ]);
    setAverages(communityAverages);
    setDraftRatings(userRatings);
  }, [configured, detail.gender, detail.match.id, ratingsSeasonId, user]);

  useEffect(() => {
    if (!configured || !authReady || resolvingSeason) return;

    let cancelled = false;

    void (async () => {
      if (user) await migrateLegacyPlayerRatingsToSupabase(user.id, detail.gender);

      const [communityAverages, userRatings] = await Promise.all([
        fetchMatchRatingAverages(detail.match.id, ratingsSeasonId),
        user ? fetchUserMatchRatings(user.id, detail.match.id, ratingsSeasonId) : Promise.resolve({}),
      ]);
      if (cancelled) return;
      setAverages(communityAverages);
      setDraftRatings(userRatings);
      setLoadedKey(sessionKey);
    })();

    return () => {
      cancelled = true;
    };
  }, [authReady, configured, detail.gender, detail.match.id, ratingsSeasonId, resolvingSeason, sessionKey, user]);

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setStatusMessage(null);

    const result = await submitMatchRatings({
      userId: user.id,
      matchId: detail.match.id,
      gender: detail.gender,
      ratings: draftRatings,
      seasonId: ratingsSeasonId,
    });

    setSubmitting(false);
    if (!result.ok) {
      setStatusMessage(result.error);
      return;
    }

    setStatusMessage("Valoración enviada. Gracias por participar.");
    await reloadRatings();
    setLoadedKey(sessionKey);
  };

  const handleSignIn = async () => {
    setSigningIn(true);
    const { error } = await signInWithX(typeof window !== "undefined" ? window.location.pathname : "/");
    if (error) setStatusMessage(error);
    setSigningIn(false);
  };

  if (eligiblePlayers.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-extrabold uppercase tracking-normal text-[#214C9B]">Valoraciones</h2>
        <p className="mt-4 text-sm text-slate-600">
          No hay jugadores del Avilés con minutos disputados en este partido.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-extrabold uppercase tracking-normal text-[#214C9B]">Valoraciones</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Puntúa solo a quienes han jugado. Tu nota se suma a la media de la afición (usuarios registrados).
      </p>

      {!configured && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Las valoraciones en la nube requieren Supabase configurado en el entorno.
        </p>
      )}

      {configured && authReady && !user && (
        <div className="mt-4 rounded-2xl border border-[#214C9B]/15 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">Inicia sesión para enviar tu valoración.</p>
          <button
            type="button"
            onClick={() => void handleSignIn()}
            disabled={signingIn}
            className="mt-3 rounded-full bg-[#214C9B] px-5 py-2.5 text-xs font-extrabold uppercase text-white hover:bg-[#1a3d7d] disabled:opacity-60"
          >
            {signingIn ? "Conectando…" : "Entrar con X"}
          </button>
        </div>
      )}

      {loading ? (
        <p className="mt-6 inline-flex items-center gap-2 text-sm text-slate-500">
          <Loader2 size={16} className="animate-spin" aria-hidden />
          Cargando valoraciones…
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {eligiblePlayers.map((player) => {
            const sliderValue = draftRatings[player.id] ?? SLIDER_DEFAULT;
            const community = averages[player.id];

            return (
              <li
                key={player.id}
                className="rounded-2xl border border-[#214C9B]/15 bg-slate-50/80 p-4 sm:p-5"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="flex min-w-0 items-center gap-2 text-sm font-extrabold uppercase text-slate-900">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#214C9B] text-xs font-extrabold text-white">
                        {player.dorsal}
                      </span>
                      <span className="truncate">{getPlayerFullName(player)}</span>
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      <input
                        type="range"
                        min={SLIDER_MIN}
                        max={SLIDER_MAX}
                        step={SLIDER_STEP}
                        value={sliderValue}
                        disabled={!user}
                        onChange={(event) =>
                          setDraftRatings((current) => ({
                            ...current,
                            [player.id]: Number(event.target.value),
                          }))
                        }
                        className="h-2 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-[#214C9B]/15 accent-[#214C9B] disabled:opacity-50"
                        aria-label={`Valoración de ${getPlayerFullName(player)}`}
                      />
                      <span className="w-9 shrink-0 text-right text-sm font-extrabold tabular-nums text-[#214C9B]">
                        {formatFanRating(sliderValue)}
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex shrink-0 flex-col items-center justify-center rounded-xl border border-[#214C9B]/20 bg-white px-3 py-2 text-center"
                    title="Media de usuarios registrados"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Media</span>
                    <span className="text-lg font-extrabold tabular-nums text-[#214C9B]">
                      {community ? formatFanRating(community.average) : "—"}
                    </span>
                    {community && community.count > 0 && (
                      <span className="text-[10px] text-slate-400">{community.count} votos</span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {user && configured && !loading && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="rounded-full bg-[#981915] px-6 py-2.5 text-xs font-extrabold uppercase text-white hover:bg-[#7f1411] disabled:opacity-60"
          >
            {submitting ? "Enviando…" : "Enviar mi valoración"}
          </button>
          {statusMessage && <p className="text-sm text-slate-600">{statusMessage}</p>}
        </div>
      )}
    </section>
  );
}
