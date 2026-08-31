"use client";

import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { OAuthLoginButtons } from "@/components/auth/OAuthLoginButtons";
import { MatchRatingsCarousel } from "@/components/match-center/MatchRatingsCarousel";
import { MatchRatingsCountdown } from "@/components/match-center/MatchRatingsCountdown";
import { MatchRatingsGrid } from "@/components/match-center/MatchRatingsGrid";
import { MatchRatingsTop3 } from "@/components/match-center/MatchRatingsTop3";
import { useMatchRatingsSeasonId } from "@/hooks/useMatchRatingsSeasonId";
import { useSquadPlayers } from "@/hooks/useSquadPlayers";
import { getAvilesPlayersWhoPlayed } from "@/lib/match-rating-eligibility";
import { isMatchRatingVotingOpen } from "@/lib/match-rating-voting";
import {
  fetchMatchRatingAverages,
  fetchUserMatchRatings,
  migrateLegacyPlayerRatingsToSupabase,
  submitMatchRatings,
} from "@/lib/match-ratings-storage";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { MatchDetail } from "@/types";
import type { User } from "@supabase/supabase-js";

type MatchRatingsPanelProps = {
  detail: MatchDetail;
};

export function MatchRatingsPanel({ detail }: MatchRatingsPanelProps) {
  const pathname = usePathname();
  const { seasonId: ratingsSeasonId, resolving: resolvingSeason } = useMatchRatingsSeasonId(
    detail.match.id,
    detail.gender,
  );
  const { squad } = useSquadPlayers(detail.gender);
  const configured = isSupabaseConfigured();
  const votingOpen = isMatchRatingVotingOpen(detail.match.date);

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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const topRatedPlayers = useMemo(() => {
    return eligiblePlayers
      .map((player) => {
        const average = averages[player.id];
        if (!average || average.count <= 0) return null;
        return { player, average };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .sort((a, b) => b.average.average - a.average.average)
      .slice(0, 3);
  }, [averages, eligiblePlayers]);

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

  const handleRatingChange = useCallback((playerId: string, value: number) => {
    setDraftRatings((current) => ({ ...current, [playerId]: value }));
  }, []);

  const handleSubmit = async () => {
    if (!user || !votingOpen) return;
    setSubmitting(true);
    setStatusMessage(null);

    const result = await submitMatchRatings({
      userId: user.id,
      matchId: detail.match.id,
      gender: detail.gender,
      ratings: draftRatings,
      seasonId: ratingsSeasonId,
      matchDate: detail.match.date,
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

  const canVote = Boolean(user && configured && votingOpen);

  return (
    <section>
      <h2 className="text-lg font-extrabold uppercase tracking-normal text-[#214C9B]">Valoraciones</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Puntúa solo a quienes han jugado. Tienes 3 días tras el partido para enviar tu valoración.
      </p>

      {!configured && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Las valoraciones en la nube requieren Supabase configurado en el entorno.
        </p>
      )}

      {configured && authReady && !user && votingOpen && (
        <div className="mt-4 rounded-2xl border border-[#214C9B]/15 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">Inicia sesión para enviar tu valoración.</p>
          <div className="mt-3 max-w-sm">
            <OAuthLoginButtons
              nextPath={pathname}
              googleLabel="Entrar con Google"
              xLabel="Entrar con X"
            />
          </div>
        </div>
      )}

      <div className="mt-5 space-y-4">
        {topRatedPlayers.length > 0 ? <MatchRatingsTop3 players={topRatedPlayers} /> : null}
        <MatchRatingsCountdown matchDate={detail.match.date} />
      </div>

      {loading ? (
        <p className="mt-6 inline-flex items-center gap-2 text-sm text-slate-500">
          <Loader2 size={16} className="animate-spin" aria-hidden />
          Cargando valoraciones…
        </p>
      ) : (
        <>
          <div className="mt-6">
            <MatchRatingsCarousel
              players={eligiblePlayers}
              draftRatings={draftRatings}
              averages={averages}
              onRatingChange={handleRatingChange}
              disabled={!canVote}
            />
          </div>

          <div className="mt-10">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-500">Todos los jugadores</h3>
            <MatchRatingsGrid
              players={eligiblePlayers}
              draftRatings={draftRatings}
              averages={averages}
            />
          </div>
        </>
      )}

      {user && configured && !loading && votingOpen ? (
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
      ) : null}

      {user && configured && !loading && !votingOpen && statusMessage ? (
        <p className="mt-4 text-sm text-slate-600">{statusMessage}</p>
      ) : null}
    </section>
  );
}
