"use client";

import { motion } from "framer-motion";
import type { SquadClubStats } from "@/types/squad";

const seasonStatItems = [
  { key: "partidos", label: "Partidos" },
  { key: "victorias", label: "Victorias" },
  { key: "empates", label: "Empates" },
  { key: "derrotas", label: "Derrotas" },
] as const;

type SquadStatsBarProps = {
  stats: SquadClubStats;
  className?: string;
};

export function SquadStatsBar({ stats, className = "" }: SquadStatsBarProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06, duration: 0.35 }}
      aria-label="Estadísticas en la temporada actual"
      className={`group flex w-full shrink-0 flex-col gap-3 rounded-2xl border border-[#214C9B]/15 bg-gradient-to-r from-slate-50 to-blue-50/60 px-4 py-3 text-left shadow-sm sm:ml-auto sm:w-auto sm:min-w-[min(100%,22rem)] lg:min-w-[26rem] ${className}`}
    >
      <h2 className="text-[11px] font-extrabold uppercase tracking-wide text-[#214C9B] sm:text-xs">
        Estadísticas en la temporada actual
      </h2>
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {seasonStatItems.map((item, index) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * index, duration: 0.3 }}
            className="flex min-w-0 flex-col items-center text-center"
          >
            <p className="font-serif text-3xl font-black leading-none tabular-nums tracking-tighter text-[#981915] sm:text-4xl lg:text-[2.75rem]">
              {stats[item.key]}
            </p>
            <p className="mt-1.5 text-[11px] font-semibold text-slate-800 sm:text-xs">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.aside>
  );
}
