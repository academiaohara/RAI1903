"use client";

import { motion } from "framer-motion";
import type { SquadPlayer } from "@/types/squad";

type StatDef = {
  label: string;
  value: number | string;
  accent?: boolean;
};

export function PlayerStats({ player, compact = false }: { player: SquadPlayer; compact?: boolean }) {
  const stats: StatDef[] = [
    { label: "Partidos", value: player.partidos, accent: true },
    { label: "Minutos", value: player.minutos.toLocaleString("es-ES") },
    { label: "Goles", value: player.goles, accent: player.goles > 0 },
    { label: "Asistencias", value: player.asistencias, accent: player.asistencias > 0 },
    { label: "Amarillas", value: player.amarillas },
    { label: "Rojas", value: player.rojas },
  ];

  return (
    <div className={`grid gap-2 sm:gap-3 ${compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"}`}>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          className={`rounded-2xl border p-3 sm:p-4 ${
            stat.accent
              ? "border-[#214C9B]/20 bg-gradient-to-br from-blue-50 to-white"
              : "border-slate-200/80 bg-white"
          }`}
        >
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 sm:text-[10px]">{stat.label}</p>
          <p className={`mt-0.5 font-extrabold tabular-nums sm:mt-1 ${compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"} ${stat.accent ? "text-[#214C9B]" : "text-slate-900"}`}>
            {stat.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
