"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useSeason } from "@/components/season/SeasonProvider";
import { loadClasificacionState } from "@/lib/clasificacion-storage";
import { gameTabHref } from "@/lib/juegos";
import { loadQuinielaState } from "@/lib/quiniela-storage";
import { loadQuinigolState } from "@/lib/quinigol-storage";
import { formatDate } from "@/lib/utils";

type AccountBoletosSummaryProps = {
  user: User;
};

type BoletosSummary = {
  quinielaSavedRounds: number;
  quinigolSavedRounds: number;
  clasificacionSubmitted: boolean;
  clasificacionSubmittedAt: string | null;
};

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
    return <p className="text-sm text-slate-500">Cargando tus boletos…</p>;
  }

  if (!summary) return null;

  const games = [
    {
      id: "quiniela" as const,
      label: "RAIniela",
      detail:
        summary.quinielaSavedRounds > 0
          ? `${summary.quinielaSavedRounds} jornada${summary.quinielaSavedRounds === 1 ? "" : "s"} guardada${summary.quinielaSavedRounds === 1 ? "" : "s"}`
          : "Sin boletos guardados",
      href: gameTabHref("quiniela", "pronosticos"),
      rankingHref: gameTabHref("quiniela", "ranking"),
    },
    {
      id: "quinigol" as const,
      label: "RAIGol",
      detail:
        summary.quinigolSavedRounds > 0
          ? `${summary.quinigolSavedRounds} jornada${summary.quinigolSavedRounds === 1 ? "" : "s"} guardada${summary.quinigolSavedRounds === 1 ? "" : "s"}`
          : "Sin boletos guardados",
      href: gameTabHref("quinigol", "pronosticos"),
      rankingHref: gameTabHref("quinigol", "ranking"),
    },
    {
      id: "clasificacion" as const,
      label: "El Oráculo",
      detail: summary.clasificacionSubmitted
        ? `Boleto enviado${summary.clasificacionSubmittedAt ? ` el ${formatDate(summary.clasificacionSubmittedAt)}` : ""}`
        : "Sin enviar",
      href: gameTabHref("clasificacion", "pronosticos"),
      rankingHref: gameTabHref("clasificacion", "ranking"),
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Temporada <span className="font-bold text-[#214C9B]">{viewedSeason.label}</span>. Solo cuentan los boletos
        guardados oficialmente.
      </p>

      <div className="space-y-2">
        {games.map((game) => (
          <div
            key={game.id}
            className="flex flex-col gap-2 rounded-xl border border-[#214C9B]/15 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
          >
            <div className="min-w-0">
              <p className="font-extrabold text-[#214C9B]">{game.label}</p>
              <p className="text-sm text-slate-600">{game.detail}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href={game.href as Route}
                prefetch={false}
                className="rounded-lg border border-[#214C9B]/25 bg-white px-3 py-1.5 text-xs font-bold text-[#214C9B] transition hover:bg-[#214C9B]/5 sm:text-sm"
              >
                Pronósticos
              </Link>
              <Link
                href={game.rankingHref as Route}
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
