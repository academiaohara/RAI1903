"use client";

import { motion } from "framer-motion";
import type { SquadClubStats } from "@/types/squad";

const statItems = [
  { key: "partidos", label: "Partidos" },
  { key: "victorias", label: "Victorias" },
  { key: "empates", label: "Empates" },
  { key: "derrotas", label: "Derrotas" },
  { key: "golesFavor", label: "GF" },
  { key: "golesContra", label: "GC" },
] as const;

export function SquadStatsBar({ stats }: { stats: SquadClubStats }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06, duration: 0.35 }}
      className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6"
    >
      {statItems.map((item, index) => (
        <motion.div
          key={item.key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 * index, duration: 0.3 }}
          className="flex min-h-[4.25rem] flex-col items-center justify-center rounded-2xl border border-[#214C9B]/12 bg-white px-3 py-3 text-center shadow-[0_8px_24px_rgba(17,24,39,0.05)] sm:min-h-[4.75rem]"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{item.label}</p>
          <p className="mt-1 text-xl font-extrabold tabular-nums text-[#214C9B] sm:text-2xl">{stats[item.key]}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
