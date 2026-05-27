"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { SquadClubInfo } from "@/types/squad";

const statItems = [
  { key: "partidos", label: "Partidos" },
  { key: "victorias", label: "Victorias" },
  { key: "empates", label: "Empates" },
  { key: "derrotas", label: "Derrotas" },
  { key: "golesFavor", label: "GF" },
  { key: "golesContra", label: "GC" },
] as const;

export function SquadHeader({ club }: { club: SquadClubInfo }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[1.5rem] border border-[#214C9B]/15 bg-gradient-to-br from-[#0f2347] via-[#173a78] to-[#214C9B] p-5 text-white shadow-[0_24px_60px_rgba(15,35,71,0.35)] sm:rounded-[2rem] sm:p-8"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-[#2a5eb5]/40 blur-3xl" />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm sm:h-24 sm:w-24">
            <Image src={club.escudo} alt={club.nombre} width={72} height={72} className="h-auto w-full object-contain drop-shadow-lg" priority />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Plantilla oficial</p>
            <h1 className="mt-1 break-words text-2xl font-extrabold uppercase tracking-tight sm:text-4xl">{club.nombre}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold text-white/85">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">Temporada {club.temporada}</span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">{club.estadio}</span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">{club.jugadores} jugadores</span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">{club.entrenador}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
          {statItems.map((item, index) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index, duration: 0.35 }}
              className="flex min-h-[4.5rem] flex-col items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-center backdrop-blur-sm sm:min-h-[5rem] sm:px-4"
            >
              <p className="w-full text-center text-[10px] font-bold uppercase tracking-wider text-white/65">{item.label}</p>
              <p className="mt-1 w-full text-center text-xl font-extrabold tabular-nums sm:text-3xl">{club.stats[item.key]}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
