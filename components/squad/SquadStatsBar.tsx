"use client";

import { motion } from "framer-motion";
import { bebasNeue } from "@/lib/fonts";
import type { SquadClubStats } from "@/types/squad";

const seasonStatItems = [
  { key: "partidos", label: "Partidos" },
  { key: "victorias", label: "Victorias" },
  { key: "empates", label: "Empates" },
  { key: "derrotas", label: "Derrotas" },
  { key: "golesFavor", label: "Goles en total" },
  { key: "golesContra", label: "Goles en contra" },
  { key: "porteriasImbatidas", label: "Porterias imbatidas" },
] as const satisfies ReadonlyArray<{ key: keyof SquadClubStats; label: string }>;

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
      aria-label="Estadisticas en la temporada actual"
      className={`w-full rounded-3xl border border-slate-200/90 bg-white px-3 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] sm:px-8 sm:py-7 ${className}`}
    >
      <h2 className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#981915] sm:text-xs sm:tracking-[0.14em]">
        Estadisticas en la temporada actual
      </h2>

      <div className="mt-3 grid grid-cols-7 gap-0.5 sm:mt-7 sm:flex sm:flex-wrap sm:items-end sm:justify-between sm:gap-x-4 sm:gap-y-8 lg:mt-8 lg:flex-nowrap lg:gap-x-2">
        {seasonStatItems.map((item, index) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * index, duration: 0.3 }}
            className="flex min-w-0 flex-col items-center text-center sm:min-w-[4.25rem] sm:flex-1 lg:min-w-0"
          >
            <p
              className={`${bebasNeue.className} text-[1.65rem] font-normal leading-[0.9] tracking-[0.5px] text-[#214C9B] tabular-nums sm:text-[64px] sm:tracking-[1px] lg:text-[72px]`}
            >
              {stats[item.key]}
            </p>
            <p className="mt-0.5 max-w-none text-[7px] font-medium leading-tight tracking-wide text-slate-600 sm:mt-2.5 sm:max-w-[6.5rem] sm:text-[11px] sm:leading-snug">
              {item.label}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.aside>
  );
}
