"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useSeason } from "@/components/season/SeasonProvider";
import { loadClasificacionState } from "@/lib/clasificacion-storage";
import { gameTabHref } from "@/lib/juegos";
import type { GameRankingEntry, GameSeasonRankingEntry } from "@/lib/game-rankings";
import { findUserRankingPosition } from "@/lib/ranking-display";
import { loadQuinielaState } from "@/lib/quiniela-storage";
import { loadQuinigolState } from "@/lib/quinigol-storage";
import type { QuinielaSeasonRankingEntry } from "@/lib/quiniela-ranking";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type AccountBoletosSummaryProps = {
  user: User;
};

type GameId = "quiniela" | "quinigol" | "clasificacion";

type GameParticipation = {
  id: GameId;
  label: string;
  rank: number;
  pointsLabel: string;
  href: Route;
  rankingHref: Route;
};

type RankingPayload = {
  entries?: Array<GameRankingEntry | GameSeasonRankingEntry | QuinielaSeasonRankingEntry>;
  countPoints?: boolean;
};

async function fetchSeasonRanking(url: string): Promise<RankingPayload> {
  const response = await fetch(url);
  if (!response.ok) return { entries: [], countPoints: false };
  return (await response.json()) as RankingPayload;
}

export function AccountBoletosSummary({ user }: AccountBoletosSummaryProps) {
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

      if (!participates.quiniela && !participates.quinigol && !participates.clasificacion) {
        if (!cancelled) {
          setParticipations([]);
          setLoading(false);
        }
        return;
      }

      if (!isSupabaseConfigured()) {
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
          ? fetchSeasonRanking(`/api/clasificacion/ranking?${new URLSearchParams({ seasonId: viewedSeasonId }).toString()}`)
          : Promise.resolve({ entries: [], countPoints: false }),
      ]);

      if (cancelled) return;

      const games: GameParticipation[] = [];

      const appendGame = (
        id: GameId,
        label: string,
        href: Route,
        rankingHref: Route,
        payload: RankingPayload,
      ) => {
        const position = findUserRankingPosition(payload.entries ?? [], user.id);
        if (!position) return;

        games.push({
          id,
          label,
          rank: position.rank,
          pointsLabel: payload.countPoints ? `${position.entry.points} pts` : "—",
          href,
          rankingHref,
        });
      };

      if (participates.quiniela) {
        appendGame(
          "quiniela",
          "RAIniela",
          gameTabHref("quiniela", "pronosticos") as Route,
          gameTabHref("quiniela", "ranking") as Route,
          quinielaRanking,
        );
      }

      if (participates.quinigol) {
        appendGame(
          "quinigol",
          "RAIGol",
          gameTabHref("quinigol", "pronosticos") as Route,
          gameTabHref("quinigol", "ranking") as Route,
          quinigolRanking,
        );
      }

      if (participates.clasificacion) {
        appendGame(
          "clasificacion",
          "El Oráculo",
          gameTabHref("clasificacion", "pronosticos") as Route,
          gameTabHref("clasificacion", "ranking") as Route,
          clasificacionRanking,
        );
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
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#214C9B]">Pronósticos</h2>
        <p className="text-sm text-slate-500">Cargando tus pronósticos…</p>
      </div>
    );
  }

  if (!participations || participations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#214C9B]">Pronósticos</h2>
        <p className="mt-1 text-sm text-slate-600">
          Temporada <span className="font-bold text-[#214C9B]">{viewedSeason.label}</span>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {participations.map((game) => (
          <div
            key={game.id}
            className="flex flex-col gap-3 rounded-xl border border-[#214C9B]/15 bg-slate-50 p-4"
          >
            <div className="min-w-0">
              <p className="font-extrabold text-[#214C9B]">{game.label}</p>
              <p className="mt-1 text-sm text-slate-600">
                Posición <span className="font-bold text-[#214C9B]">{game.rank}º</span>
                <span className="mx-2 text-slate-300">·</span>
                <span className="font-bold text-slate-900">{game.pointsLabel}</span>
              </p>
            </div>
            <div className="mt-auto flex flex-wrap gap-2">
              <Link
                href={game.href}
                prefetch={false}
                className="rounded-lg border border-[#214C9B]/25 bg-white px-3 py-1.5 text-xs font-bold text-[#214C9B] transition hover:bg-[#214C9B]/5 sm:text-sm"
              >
                Pronósticos
              </Link>
              <Link
                href={game.rankingHref}
                prefetch={false}
                className="rounded-lg border border-[#214C9B]/25 bg-white px-3 py-1.5 text-xs font-bold text-[#214C9B] transition hover:bg-[#214C9B]/5 sm:text-sm"
              >
                Ranking
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
