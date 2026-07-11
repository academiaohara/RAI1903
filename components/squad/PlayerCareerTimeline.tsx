"use client";

import { motion } from "framer-motion";
import { sortCareerByTemporada } from "@/lib/career-utils";
import type { SquadPlayer } from "@/types/squad";

export function PlayerCareerTimeline({ player }: { player: SquadPlayer }) {
  const career = sortCareerByTemporada(player.trayectoria).reverse();

  return (
    <div className="relative space-y-0">
      <div className="absolute bottom-2 left-[calc(2.5rem-2.125rem+0.4375rem)] top-2 w-px -translate-x-1/2 bg-gradient-to-b from-[#214C9B] via-[#214C9B]/30 to-transparent sm:left-[calc(3rem-2.125rem+0.4375rem)]" />

      {career.map((entry, index) => (
        <motion.div
          key={`${entry.temporada}-${entry.club}`}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="grid gap-3 pb-5 pl-10 sm:grid-cols-[1fr_auto] sm:gap-4 sm:pb-6 sm:pl-12"
        >
          <div className="relative">
            <span
              aria-hidden
              className="absolute -left-[1.875rem] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white bg-[#214C9B] shadow-md shadow-blue-950/20 sm:-left-[2.125rem] sm:h-3.5 sm:w-3.5"
            />

            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#214C9B] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white sm:px-3 sm:py-1 sm:text-[10px]">
                  {entry.temporada}
                </span>
                <h4 className="text-sm font-extrabold uppercase text-slate-900 sm:text-base">{entry.club}</h4>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 self-center sm:min-w-[14rem] sm:gap-2">
            {[
              { label: "PJ", value: entry.partidos },
              { label: "G", value: entry.goles },
              { label: "A", value: entry.asistencias },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                <p className="text-[10px] font-bold uppercase text-slate-400">{stat.label}</p>
                <p className="text-lg font-extrabold tabular-nums text-[#214C9B]">{stat.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
