"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { SquadPlayer } from "@/types/squad";

const PAGE_SIZE = 6;

export function PlayerMatchesTable({ player }: { player: SquadPlayer }) {
  const matches = player.historialPartidos;
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));

  const pageItems = useMemo(() => {
    const start = page * PAGE_SIZE;
    return matches.slice(start, start + PAGE_SIZE);
  }, [matches, page]);

  if (matches.length === 0) {
    return <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm font-semibold text-slate-500">Sin partidos registrados en mock.</p>;
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
              transition={{ delay: index * 0.03 }}
              className="p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-slate-900">{match.rival}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{match.competicion}</p>
                </div>
                <p className="shrink-0 text-right text-xs font-bold uppercase text-[#214C9B]">
                  {new Date(match.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                </p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-bold text-slate-600 sm:grid-cols-5">
                <span className="rounded-xl bg-slate-100 px-2 py-1">Min {match.minutos}</span>
                <span className="rounded-xl bg-blue-50 px-2 py-1 text-[#214C9B]">G {match.goles}</span>
                <span className="rounded-xl bg-slate-100 px-2 py-1">A {match.asistencias}</span>
                <span className="rounded-xl bg-amber-50 px-2 py-1 text-amber-700">TA {match.amarillas}</span>
                <span className="rounded-xl bg-red-50 px-2 py-1 text-red-700">TR {match.rojas}</span>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {["Fecha", "Rival", "Competicion", "Min", "G", "A", "TA", "TR"].map((col) => (
                  <th key={col} className="px-4 py-3">
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
                  transition={{ delay: index * 0.03 }}
                  className="border-t border-slate-100 transition hover:bg-blue-50/50"
                >
                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {new Date(match.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">{match.rival}</td>
                  <td className="px-4 py-3 text-slate-600">{match.competicion}</td>
                  <td className="px-4 py-3 text-center font-bold tabular-nums">{match.minutos}</td>
                  <td className="px-4 py-3 text-center font-extrabold tabular-nums text-[#214C9B]">{match.goles}</td>
                  <td className="px-4 py-3 text-center font-extrabold tabular-nums">{match.asistencias}</td>
                  <td className="px-4 py-3 text-center font-extrabold tabular-nums text-amber-600">{match.amarillas}</td>
                  <td className="px-4 py-3 text-center font-extrabold tabular-nums text-red-600">{match.rojas}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-600 transition enabled:hover:border-[#214C9B] enabled:hover:text-[#214C9B] disabled:opacity-40"
          >
            Anterior
          </button>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Pagina {page + 1} / {totalPages}
          </p>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-600 transition enabled:hover:border-[#214C9B] enabled:hover:text-[#214C9B] disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
