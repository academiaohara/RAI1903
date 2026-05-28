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
      className={`w-full rounded-3xl border border-slate-200/90 bg-white px-5 py-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] sm:px-8 sm:py-7 ${className}`}
    >
      <h2 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#981915] sm:text-xs">
        Estadisticas en la temporada actual
      </h2>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-x-3 gap-y-8 sm:mt-7 sm:gap-x-4 lg:mt-8 lg:flex-nowrap lg:gap-x-2">
        {seasonStatItems.map((item, index) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * index, duration: 0.3 }}
            className="flex min-w-[4.25rem] flex-1 flex-col items-center text-center lg:min-w-0"
          >
            <p
              className={`${bebasNeue.className} text-[52px] font-normal leading-[0.9] tracking-[1px] text-[#214C9B] tabular-nums sm:text-[64px] lg:text-[72px]`}
            >
              {stats[item.key]}
            </p>
            <p className="mt-2 max-w-[6.5rem] text-[10px] font-medium leading-snug tracking-wide text-slate-600 sm:mt-2.5 sm:text-[11px]">
              {item.label}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.aside>
  );
}
