"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Gamepad2 } from "lucide-react";
import { useSeason } from "@/components/season/SeasonProvider";
import { loadClasificacionState } from "@/lib/clasificacion-storage";
import type { GameRankingEntry, GameSeasonRankingEntry } from "@/lib/game-rankings";
import { findUserRankingPosition } from "@/lib/ranking-display";
import { loadQuinielaState } from "@/lib/quiniela-storage";
import { loadQuinigolState } from "@/lib/quinigol-storage";
import type { QuinielaSeasonRankingEntry } from "@/lib/quiniela-ranking";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

type AccountBoletosSummaryProps = {
  user: User;
  compact?: boolean;
};

type GameId = "quiniela" | "quinigol" | "clasificacion";

type GameParticipation = {
  id: GameId;
  label: string;
  rank: number;
  points: number | null;
};

type RankingPayload = {
  entries?: Array<GameRankingEntry | GameSeasonRankingEntry | QuinielaSeasonRankingEntry>;
  countPoints?: boolean;
};

const GAME_LOGOS: Record<GameId, string> = {
  quiniela: "/juegos/rainielav2.svg",
  quinigol: "/juegos/raigol.svg",
  clasificacion: "/api/game-logo/oraculo",
};

function formatPoints(points: number | null): string {
  if (points === null) return "—";
  return String(points);
}

async function fetchSeasonRanking(url: string): Promise<RankingPayload> {
  const response = await fetch(url);
  if (!response.ok) return { entries: [], countPoints: false };
  return (await response.json()) as RankingPayload;
}

export function AccountBoletosSummary({ user, compact = false }: AccountBoletosSummaryProps) {
  const { viewedSeasonId, viewedSeason } = useSeason();
  const [participations, setParticipations] = useState<GameParticipation[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      const [quiniela, quinigol, clasificacion] = await Promise.all([
        loadQuinielaState(user.id, viewedSeasonId),
        loadQuinigolState(user.id, viewedSeasonId),
        loadClasificacionState(user.id, viewedSeasonId),
      ]);

      const participates = {
        quiniela: Object.keys(quiniela.savedRounds).length > 0,
        quinigol: Object.keys(quinigol.savedRounds).length > 0,
        clasificacion: clasificacion.submittedAt !== null,
      };

      const noParticipation =
        !participates.quiniela && !participates.quinigol && !participates.clasificacion;

      if (noParticipation || !isSupabaseConfigured()) {
        if (!cancelled) {
          setParticipations([]);
          setLoading(false);
        }
        return;
      }

      const params = new URLSearchParams({ seasonId: viewedSeasonId, scope: "season" });
      const [quinielaRanking, quinigolRanking, clasificacionRanking] = await Promise.all([
        participates.quiniela
          ? fetchSeasonRanking(`/api/quiniela/ranking?${params.toString()}`)
          : Promise.resolve({ entries: [], countPoints: false }),
        participates.quinigol
          ? fetchSeasonRanking(`/api/quinigol/ranking?${params.toString()}`)
          : Promise.resolve({ entries: [], countPoints: false }),
        participates.clasificacion
          ? fetchSeasonRanking(
              `/api/clasificacion/ranking?${new URLSearchParams({ seasonId: viewedSeasonId }).toString()}`,
            )
          : Promise.resolve({ entries: [], countPoints: false }),
      ]);

      if (cancelled) return;

      const games: GameParticipation[] = [];

      const appendGame = (id: GameId, label: string, payload: RankingPayload) => {
        const position = findUserRankingPosition(payload.entries ?? [], user.id);
        if (!position) return;

        games.push({
          id,
          label,
          rank: position.rank,
          points: payload.countPoints ? position.entry.points : null,
        });
      };

      if (participates.quiniela) {
        appendGame("quiniela", "RAIniela", quinielaRanking);
      }

      if (participates.quinigol) {
        appendGame("quinigol", "RAIGol", quinigolRanking);
      }

      if (participates.clasificacion) {
        appendGame("clasificacion", "El Oráculo", clasificacionRanking);
      }

      setParticipations(games);
      setLoading(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [user.id, viewedSeasonId]);

  if (loading) {
    return (
      <div
        className={cn("grid gap-2", compact ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3")}
        aria-busy="true"
        aria-label="Cargando tus pronósticos"
      >
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            className={cn(
              "animate-pulse rounded-xl bg-[#214C9B]/5",
              compact ? "h-12" : "aspect-square rounded-2xl border border-[#214C9B]/10 bg-[#214C9B]/10",
            )}
          />
        ))}
      </div>
    );
  }

  if (!participations || participations.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-[#214C9B]/25 bg-slate-50 text-center",
          compact ? "px-3 py-4" : "rounded-2xl px-4 py-8",
        )}
      >
        <Gamepad2 size={18} className="mx-auto text-[#214C9B]/60" aria-hidden />
        <p className="mt-1.5 text-xs font-extrabold text-[#214C9B]">
          Sin pronósticos en {viewedSeason.label}
        </p>
        {!compact ? (
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600">
            Guarda un boleto en cualquiera de los juegos y aquí verás tu posición y tus puntos.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn(compact ? "space-y-2" : "space-y-3")}>
      <div className={cn("grid gap-2", compact ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3")}>
        {participations.map((game) => (
          <article
            key={game.id}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border border-[#214C9B]/10 bg-slate-50/80",
              compact ? "px-2.5 py-2" : "aspect-square flex-col justify-center rounded-2xl bg-white p-4 text-center shadow-sm",
            )}
          >
            <span
              className={cn(
                "flex shrink-0 items-center justify-center",
                compact ? "h-7 w-8" : "h-10 w-12",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={GAME_LOGOS[game.id]} alt="" className="max-h-full max-w-full object-contain" />
            </span>

            <div className={cn("min-w-0", compact ? "flex-1" : "text-center")}>
              <h3
                className={cn(
                  "font-extrabold uppercase tracking-wide text-[#214C9B]",
                  compact ? "text-[10px] leading-tight" : "mt-2 text-xs",
                )}
              >
                {game.label}
              </h3>

              <p
                className={cn(
                  "tabular-nums text-slate-600",
                  compact ? "mt-0.5 text-xs" : "mt-2 text-sm",
                )}
              >
                <span className="font-bold text-[#214C9B]">{game.rank}º</span>
                <span className="mx-1.5 text-slate-300">·</span>
                <span className="font-semibold text-slate-700">{formatPoints(game.points)} pts</span>
              </p>
            </div>
          </article>
        ))}
      </div>

      <p className="text-[10px] text-slate-400">
        Temporada {viewedSeason.label}
      </p>
    </div>
  );
}
