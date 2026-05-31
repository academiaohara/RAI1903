"use client";

import { motion } from "framer-motion";
import type { SquadPlayer } from "@/types/squad";

export function PlayerCareerTimeline({ player }: { player: SquadPlayer }) {
  const career = [...player.trayectoria].reverse();

  return (
    <div className="relative space-y-0">
      <div className="absolute bottom-2 left-[calc(3rem-2.125rem+0.4375rem)] top-2 w-px -translate-x-1/2 bg-gradient-to-b from-[#214C9B] via-[#214C9B]/30 to-transparent" />

      {career.map((entry, index) => (
        <motion.div
          key={`${entry.temporada}-${entry.club}`}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="grid gap-4 pb-6 pl-12 sm:grid-cols-[1fr_auto]"
        >
          <div className="relative">
            <span
              aria-hidden
              className="absolute -left-[2.125rem] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-white bg-[#214C9B] shadow-md shadow-blue-950/20"
            />

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#214C9B] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  {entry.temporada}
                </span>
                <h4 className="text-base font-extrabold uppercase text-slate-900">{entry.club}</h4>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 self-center sm:min-w-[14rem]">
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
