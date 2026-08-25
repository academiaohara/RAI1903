"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { CheckCircle2, CircleDashed, Ticket, Trophy } from "lucide-react";
import { useSeason } from "@/components/season/SeasonProvider";
import { loadClasificacionState } from "@/lib/clasificacion-storage";
import { gameTabHref } from "@/lib/juegos";
import { loadQuinielaState } from "@/lib/quiniela-storage";
import { loadQuinigolState } from "@/lib/quinigol-storage";
import { cn, formatDate } from "@/lib/utils";

type AccountBoletosSummaryProps = {
  user: User;
};

type BoletosSummary = {
  quinielaSavedRounds: number;
  quinigolSavedRounds: number;
  clasificacionSubmitted: boolean;
  clasificacionSubmittedAt: string | null;
};

const GAME_LOGOS = {
  quiniela: "/juegos/rainielav2.svg",
  quinigol: "/juegos/raigol.svg",
  clasificacion: "/api/game-logo/oraculo",
} as const;

function savedRoundsDetail(count: number): string {
  if (count <= 0) return "Todavía no has guardado ningún boleto.";
  return `${count} jornada${count === 1 ? "" : "s"} guardada${count === 1 ? "" : "s"} esta temporada.`;
}

export function AccountBoletosSummary({ user }: AccountBoletosSummaryProps) {
  const { viewedSeasonId, viewedSeason } = useSeason();
  const [summary, setSummary] = useState<BoletosSummary | null>(null);
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

      if (cancelled) return;

      setSummary({
        quinielaSavedRounds: Object.keys(quiniela.savedRounds).length,
        quinigolSavedRounds: Object.keys(quinigol.savedRounds).length,
        clasificacionSubmitted: clasificacion.submittedAt !== null,
        clasificacionSubmittedAt: clasificacion.submittedAt,
      });
      setLoading(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [user.id, viewedSeasonId]);

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Cargando tus boletos">
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            className="flex items-center gap-4 rounded-2xl border border-[#214C9B]/10 bg-white p-4"
          >
            <div className="h-14 w-16 shrink-0 animate-pulse rounded-xl bg-[#214C9B]/10" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3.5 w-28 animate-pulse rounded bg-[#214C9B]/10" />
              <div className="h-3 w-44 max-w-full animate-pulse rounded bg-slate-200/80" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const games = [
    {
      id: "quiniela" as const,
      label: "RAIniela",
      active: summary.quinielaSavedRounds > 0,
      status: summary.quinielaSavedRounds > 0 ? "Con boletos" : "Sin boletos",
      detail: savedRoundsDetail(summary.quinielaSavedRounds),
      href: gameTabHref("quiniela", "pronosticos"),
      rankingHref: gameTabHref("quiniela", "ranking"),
    },
    {
      id: "quinigol" as const,
      label: "RAIGol",
      active: summary.quinigolSavedRounds > 0,
      status: summary.quinigolSavedRounds > 0 ? "Con boletos" : "Sin boletos",
      detail: savedRoundsDetail(summary.quinigolSavedRounds),
      href: gameTabHref("quinigol", "pronosticos"),
      rankingHref: gameTabHref("quinigol", "ranking"),
    },
    {
      id: "clasificacion" as const,
      label: "El Oráculo",
      active: summary.clasificacionSubmitted,
      status: summary.clasificacionSubmitted ? "Enviado" : "Sin enviar",
      detail: summary.clasificacionSubmitted
        ? `Boleto enviado${summary.clasificacionSubmittedAt ? ` el ${formatDate(summary.clasificacionSubmittedAt)}` : ""}.`
        : "Todavía no has enviado tu clasificación.",
      href: gameTabHref("clasificacion", "pronosticos"),
      rankingHref: gameTabHref("clasificacion", "ranking"),
    },
  ];

  return (
    <div className="space-y-3">
      {games.map((game) => (
        <article
          key={game.id}
          className="group flex flex-col gap-4 rounded-2xl border border-[#214C9B]/12 bg-white p-4 shadow-sm transition hover:border-[#214C9B]/30 hover:shadow-md sm:flex-row sm:items-center"
        >
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <span className="flex h-14 w-16 shrink-0 items-center justify-center rounded-xl border border-[#214C9B]/10 bg-slate-50 p-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={GAME_LOGOS[game.id]} alt="" className="max-h-full max-w-full object-contain" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className="font-extrabold uppercase tracking-wide text-[#214C9B]">{game.label}</h3>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide",
                    game.active
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-500",
                  )}
                >
                  {game.active ? (
                    <CheckCircle2 size={11} aria-hidden />
                  ) : (
                    <CircleDashed size={11} aria-hidden />
                  )}
                  {game.status}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-slate-600">{game.detail}</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link
              href={game.href as Route}
              prefetch={false}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#214C9B] bg-[#214C9B] px-3.5 py-2 text-xs font-extrabold uppercase tracking-wide text-white transition hover:bg-[#1a3d7a] sm:flex-none"
            >
              <Ticket size={14} aria-hidden />
              Pronósticos
            </Link>
            <Link
              href={game.rankingHref as Route}
              prefetch={false}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#214C9B]/25 bg-white px-3.5 py-2 text-xs font-extrabold uppercase tracking-wide text-[#214C9B] transition hover:border-[#214C9B] hover:bg-[#214C9B]/5 sm:flex-none"
            >
              <Trophy size={14} aria-hidden />
              Ranking
            </Link>
          </div>
        </article>
      ))}

      <p className="px-1 text-xs text-slate-500">
        Temporada <span className="font-bold text-[#214C9B]">{viewedSeason.label}</span>. Solo cuentan los
        boletos guardados oficialmente.
      </p>
    </div>
  );
}
