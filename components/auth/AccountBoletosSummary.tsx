"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Gamepad2, Ticket, Trophy } from "lucide-react";
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
  points: number | null;
  href: Route;
  rankingHref: Route;
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
          points: payload.countPoints ? position.entry.points : null,
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
      <div className="space-y-2" aria-busy="true" aria-label="Cargando tus pronósticos">
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            className="flex items-center gap-3 rounded-xl border border-[#214C9B]/10 bg-white p-3"
          >
            <div className="h-10 w-12 shrink-0 animate-pulse rounded-lg bg-[#214C9B]/10" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3.5 w-24 animate-pulse rounded bg-[#214C9B]/10" />
              <div className="h-3 w-20 animate-pulse rounded bg-slate-200/80" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!participations || participations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#214C9B]/25 bg-slate-50 px-4 py-6 text-center sm:rounded-2xl sm:px-5 sm:py-8">
        <Gamepad2 size={22} className="mx-auto text-[#214C9B]/60" aria-hidden />
        <p className="mt-2 text-sm font-extrabold text-[#214C9B]">
          Aún no tienes pronósticos en la temporada {viewedSeason.label}
        </p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600">
          Guarda un boleto en cualquiera de los juegos y aquí verás tu posición y tus puntos.
        </p>
        <Link
          href={"/juegos" as Route}
          prefetch={false}
          aria-label="Ir a los juegos"
          className="mt-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#214C9B] bg-[#214C9B] text-white transition hover:bg-[#1a3d7a]"
        >
          <Ticket size={16} aria-hidden />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {participations.map((game) => (
        <article
          key={game.id}
          className="flex items-center gap-3 rounded-xl border border-[#214C9B]/12 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4"
        >
          <span className="flex h-10 w-12 shrink-0 items-center justify-center rounded-lg border border-[#214C9B]/10 bg-slate-50 p-1 sm:h-11 sm:w-14 sm:rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={GAME_LOGOS[game.id]} alt="" className="max-h-full max-w-full object-contain" />
          </span>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-extrabold uppercase tracking-wide text-[#214C9B] sm:text-base">
              {game.label}
            </h3>
            <p className="mt-0.5 text-sm tabular-nums text-slate-600">
              <span className="font-bold text-[#214C9B]">{game.rank}º</span>
              <span className="mx-2 text-slate-300">·</span>
              <span className="font-bold text-slate-900">{formatPoints(game.points)} pts</span>
            </p>
          </div>

          <div className="flex shrink-0 gap-1.5 sm:gap-2">
            <Link
              href={game.href}
              prefetch={false}
              aria-label={`Pronósticos de ${game.label}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#214C9B] bg-[#214C9B] text-white transition hover:bg-[#1a3d7a] sm:h-10 sm:w-10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={GAME_LOGOS[game.id]}
                alt=""
                className="h-5 w-5 object-contain brightness-0 invert"
              />
            </Link>
            <Link
              href={game.rankingHref}
              prefetch={false}
              aria-label={`Ranking de ${game.label}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#214C9B]/25 bg-white text-[#214C9B] transition hover:border-[#214C9B] hover:bg-[#214C9B]/5 sm:h-10 sm:w-10"
            >
              <Trophy size={16} aria-hidden />
            </Link>
          </div>
        </article>
      ))}

      <p className="hidden px-1 text-xs text-slate-500 sm:block">
        Temporada <span className="font-bold text-[#214C9B]">{viewedSeason.label}</span>. Solo aparecen los
        juegos en los que participas.
      </p>
    </div>
  );
}
