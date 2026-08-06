"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Armchair } from "lucide-react";
import type { SquadPlayer } from "@/types/squad";

const STAT_COLUMNS = ["Min", "G", "A", "TA", "TR"] as const;

function formatMatchMinutes(match: { minutos: number; onBench?: boolean }): string {
  if (match.onBench && match.minutos === 0) return "—";
  return String(match.minutos);
}

function MatchMinutesCell({ minutos, onBench }: { minutos: number; onBench?: boolean }) {
  if (onBench && minutos === 0) {
    return (
      <span className="inline-flex items-center justify-center gap-0.5 text-slate-400" title="En banquillo, sin jugar">
        <Armchair size={14} aria-hidden />
      </span>
    );
  }
  return <>{minutos}</>;
}

export function PlayerMatchesTable({ player }: { player: SquadPlayer }) {
  const matches = player.historialPartidos;

  const pageItems = useMemo(() => matches, [matches]);

  if (matches.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm font-semibold text-slate-500">
        Sin partidos registrados en esta temporada.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="divide-y divide-slate-100 md:hidden">
          {pageItems.map((match, index) => (
            <motion.article
              key={`${match.fecha}-${match.rival}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.02, 0.4) }}
              className="p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-slate-900">{match.rival}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{match.competicion}</p>
                </div>
                <p className="shrink-0 text-right text-xs font-bold uppercase text-[#981915]">
                  {new Date(match.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                </p>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-1 text-center text-[10px] font-bold text-slate-600 sm:mt-3 sm:gap-2 sm:text-xs">
                <span className="rounded-lg bg-slate-100 px-1.5 py-1 tabular-nums sm:rounded-xl sm:px-2">
                  Min {formatMatchMinutes(match)}
                </span>
                <span className="rounded-lg bg-blue-50 px-1.5 py-1 tabular-nums text-[#214C9B] sm:rounded-xl sm:px-2">G {match.goles}</span>
                <span className="rounded-lg bg-slate-100 px-1.5 py-1 tabular-nums sm:rounded-xl sm:px-2">A {match.asistencias}</span>
                <span className="rounded-lg bg-amber-50 px-1.5 py-1 tabular-nums text-amber-700 sm:rounded-xl sm:px-2">TA {match.amarillas}</span>
                <span className="rounded-lg bg-red-50 px-1.5 py-1 tabular-nums text-red-700 sm:rounded-xl sm:px-2">TR {match.rojas}</span>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full table-fixed border-collapse text-sm">
            <colgroup>
              <col className="w-[5.5rem]" />
              <col />
              <col className="w-[9.5rem]" />
              {STAT_COLUMNS.map((col) => (
                <col key={col} className="w-[3.25rem]" />
              ))}
            </colgroup>
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-3 py-3 text-left">Fecha</th>
                <th className="px-3 py-3 text-left">Rival</th>
                <th className="px-3 py-3 text-left">Competición</th>
                {STAT_COLUMNS.map((col) => (
                  <th key={col} className="px-2 py-3 text-center">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageItems.map((match, index) => (
                <motion.tr
                  key={`${match.fecha}-${match.rival}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(index * 0.02, 0.4) }}
                  className="border-t border-slate-100 transition hover:bg-blue-50/50"
                >
                  <td className="px-3 py-3 whitespace-nowrap font-semibold text-slate-700">
                    {new Date(match.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                  </td>
                  <td className="truncate px-3 py-3 font-bold text-slate-900">{match.rival}</td>
                  <td className="truncate px-3 py-3 text-slate-600">{match.competicion}</td>
                  <td className="px-2 py-3 text-center font-bold tabular-nums text-slate-700">
                    <MatchMinutesCell minutos={match.minutos} onBench={match.onBench} />
                  </td>
                  <td className="px-2 py-3 text-center font-extrabold tabular-nums text-[#214C9B]">{match.goles}</td>
                  <td className="px-2 py-3 text-center font-extrabold tabular-nums">{match.asistencias}</td>
                  <td className="px-2 py-3 text-center font-extrabold tabular-nums text-amber-600">{match.amarillas}</td>
                  <td className="px-2 py-3 text-center font-extrabold tabular-nums text-red-600">{match.rojas}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-center text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {matches.length} partidos · temporada 2025/26
      </p>
    </div>
  );
}
