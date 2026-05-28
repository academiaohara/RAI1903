"use client";

import Image from "next/image";
import { Building2 } from "lucide-react";
import { motion } from "framer-motion";
import type { SquadClubInfo } from "@/types/squad";

type SquadHeaderProps = {
  club: SquadClubInfo;
  onStadiumClick: () => void;
};

export function SquadHeader({ club, onStadiumClick }: SquadHeaderProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[1.5rem] border border-[#214C9B]/15 bg-gradient-to-br from-[#0f2347] via-[#173a78] to-[#214C9B] p-5 text-white shadow-[0_24px_60px_rgba(15,35,71,0.35)] sm:rounded-[2rem] sm:p-8"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-[#2a5eb5]/40 blur-3xl" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4 sm:gap-5">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 p-2.5 backdrop-blur-sm sm:h-20 sm:w-20">
            <Image src={club.escudo} alt={club.nombre} width={64} height={64} className="h-auto w-full object-contain drop-shadow-lg" priority />
          </div>
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-extrabold uppercase tracking-tight sm:text-4xl">{club.nombre}</h1>
            <p className="mt-2 text-sm font-semibold text-white/90 sm:text-base">
              <span className="text-white/70">Entrenador:</span> {club.entrenador}
            </p>
            <p className="mt-2 text-xs font-semibold text-white/65">Temporada {club.temporada}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onStadiumClick}
          className="group flex shrink-0 flex-col items-center gap-2 rounded-2xl border border-white/15 bg-white/5 p-3 text-left transition hover:border-white/30 hover:bg-white/10 sm:items-end sm:p-4"
          aria-label={`Ver informacion de ${club.estadio}`}
        >
          <div className="relative h-20 w-28 overflow-hidden rounded-xl border border-white/20 sm:h-24 sm:w-36">
            <Image
              src={club.estadioInfo.imagen}
              alt={club.estadio}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
              sizes="144px"
            />
          </div>
          <span className="flex max-w-[9rem] items-center gap-2 text-xs font-bold text-white sm:max-w-[10rem] sm:justify-end sm:text-sm">
            <Building2 size={16} className="shrink-0 text-white/80" />
            <span className="truncate">{club.estadio}</span>
          </span>
        </button>
      </div>
    </motion.section>
  );
}
